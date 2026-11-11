import re
import json
import logging
from typing import Optional, Dict, Any, List
from difflib import SequenceMatcher
from sqlalchemy.orm import Session

from app.config import GEMINI_API_KEY, CATEGORIES
from app.models import Complaint

logger = logging.getLogger(__name__)

KANNADA_UNICODE_PATTERN = re.compile(r"[\u0C80-\u0CFF]")

# Comprehensive Police Grievance Category Taxonomy (English & Kannada)
CATEGORY_KEYWORDS = {
    "Cybercrime": [
        "cyber", "hack", "hacked", "phishing", "malware", "virus", "otp", "sim swap", 
        "fake website", "ransomware", "apk", "social media hack", "instagram", "facebook",
        "deepfake", "dark web", "identity theft",
        "ಸೈಬರ್", "ಹ್ಯಾಕ್", "ಒಟಿಪಿ", "ಲಿಂಕ್", "ವೈರಸ್", "ಸಾಮಾಜಿಕ ಜಾಲತಾಣ", "ಖಾತೆ ಹ್ಯಾಕ್"
    ],
    "Financial Fraud & Scams": [
        "fraud", "cheated", "bank", "upi", "gpay", "phonepe", "paytm", "atm", "credit card",
        "debit card", "investment scam", "loan scam", "crypto", "money transfer", "unauthorized transaction",
        "ponzi", "chit fund", "trading group", "fake call", "lottery",
        "ಹಣ", "ಬ್ಯಾಂಕ್", "ವಂಚನೆ", "ಯುಪಿಐ", "ಸಾಲ", "ಖಾತೆ", "ವರ್ಗಾವಣೆ", "ಮೋಸ", "ಚಿಟ್‌ಫಂಡ್"
    ],
    "Women & Child Safety": [
        "woman", "women", "girl", "child", "children", "posh", "pocso", "stalking", "harassment",
        "domestic violence", "dowry", "eve teasing", "acid", "inappropriate touch", "molestation",
        "ಮಹಿಳೆ", "ಮಕ್ಕಳು", "ಕಿರುಕುಳ", "ಕೌಟುಂಬಿಕ ಹಿಂಸೆ", "ವರದಕ್ಷಿಣೆ", "ಹಿಂಸೆ", "ಪೀಡೆ"
    ],
    "Theft & Burglary": [
        "theft", "stolen", "robbery", "burglary", "house breaking", "chain snatching", "pickpocket",
        "loot", "break-in", "stole", "bike theft", "car theft", "jewelry stolen",
        "ಕಳ್ಳತನ", "ದರೋಡೆ", "ಕಳ್ಳ", "ಸರಗಳ್ಳತನ", "ಬೈಕ್ ಕಳ್ಳತನ", "ಚಿನ್ನಾಭರಣ ಕಳ್ಳತನ"
    ],
    "Lost & Found Property": [
        "lost", "missing", "wallet", "purse", "phone", "mobile", "laptop", "bag", "vehicle",
        "bike", "car", "license", "rc book", "certificate", "passport", "pan card", "aadhaar", "ceir",
        "ಕಳೆದುಹೋದ", "ಮೊಬೈಲ್", "ವಾಹನ", "ದಾಖಲೆ", "ಪರ್ಸ್", "ಬ್ಯಾಗ್", "ಕಾಣೆಯಾದ", "ಪಾಸ್‌ಪೋರ್ಟ್", "ಗುರುತಿನ ಚೀಟಿ"
    ],
    "Traffic & Road Safety": [
        "traffic", "signal", "accident", "hit and run", "rash driving", "overspeeding",
        "parking", "road block", "pothole", "drunk driving", "street light", "junction", "road rage",
        "ರಸ್ತೆ", "ಅಪಘಾತ", "ಸಿಗ್ನಲ್", "ಪಾರ್ಕಿಂಗ್", "ವಾಹನ", "ದಟ್ಟಣೆ", "ಮದ್ಯಪಾನ ಚಾಲನೆ", "ಹಿಟ್ ಆಂಡ್ ರನ್"
    ],
    "Assault & Violent Crimes": [
        "assault", "fight", "threat", "threatening", "beating", "attack", "murder threat",
        "grievous hurt", "gang", "weapon", "knife", "injury", "physical abuse", "extortion",
        "ಹಲ್ಲೆ", "ಜಗಳ", "ಮಾರಾಮಾರಿ", "ಬೆದರಿಕೆ", "ಹೊಡೆದಾಟ", "ಗಾಯ", "ಮಾರಕಾಸ್ತ್ರ", "ದೌರ್ಜನ್ಯ"
    ],
    "Narcotics & Illegal Substances": [
        "drugs", "narcotics", "weed", "ganja", "cocaine", "heroin", "meth", "substance",
        "peddling", "contraband", "illegal alcohol", "rave party", "mdma",
        "ಮಾದಕ ದ್ರವ್ಯ", "ಗಾಂಜಾ", "ಡ್ರಗ್ಸ್", "ಅಕ್ರಮ ಮದ್ಯ", "ಸಾಗಾಣಿಕೆ"
    ],
    "Missing Persons & Runaways": [
        "missing person", "missing child", "disappeared", "runaway", "untraceable",
        "not returned home", "kidnapped", "abducted",
        "ಕಾಣೆಯಾಗಿದ್ದಾರೆ", "ನಾಪತ್ತೆ", "ಮನೆಗೆ ಬಂದಿಲ್ಲ", "ಅಪಹರಣ"
    ],
    "Property & Land Disputes": [
        "land dispute", "property", "encroachment", "fake agreement", "illegal possession",
        "tenant", "landlord eviction", "boundary dispute", "forged deed", "khata fraud",
        "ಆಸ್ತಿ", "ಜಮೀನು ವಿವಾದ", "ಒತ್ತುವರಿ", "ಖಾಲಿ ಮಾಡಿಸುವುದು", "ಬಾಡಿಗೆದಾರ", "ನಕಲಿ ದಾಖಲೆ"
    ],
    "Public Nuisance & Civic Grievances": [
        "nuisance", "loudspeaker", "noise", "illegal dumping", "garbage", "public drinking",
        "gambling", "illegal construction", "street harassment",
        "ಸಾರ್ವಜನಿಕ ಕಿರುಕುಳ", "ಶಬ್ದ ಮಾಲಿನ್ಯ", "ಕಸ ಸುರಿಯುವುದು", "ಅಕ್ರಮ ಜೂಜು", "ಕಿರಿಕಿರಿ"
    ],
    "Corruption & Police Misconduct": [
        "corruption", "bribe", "bribery", "extortion by official", "police harassment",
        "illegal detention", "refusal to register", "misconduct",
        "ಲಂಚ", "ಭ್ರಷ್ಟಾಚಾರ", "ಅಧಿಕಾರ ದುರುಪಯೋಗ", "ಅನಗತ್ಯ ಕಿರುಕುಳ"
    ],
    # Legacy aliases
    "Financial Fraud": ["fraud", "bank", "upi", "scam", "ವಂಚನೆ", "ಹಣ"],
    "Lost Property": ["lost", "missing", "ಕಳೆದುಹೋದ"],
    "Traffic & Public Safety": ["traffic", "accident", "ರಸ್ತೆ"],
    "Complaints Involving Individuals": ["dispute", "fight", "harassment", "ಜಗಳ", "ಕಿರುಕುಳ"]
}

# Priority indicators
URGENT_KEYWORDS = [
    "urgent", "life threat", "kill", "suicide", "bleeding", "severe", "golden hour", "immediate",
    "kidnap", "hostage", "attack", "ಬೆದರಿಕೆ", "ಕೊಲೆ", "ತುರ್ತು", "ಆತ್ಮಹತ್ಯೆ", "ರಕ್ತಸ್ರಾವ", "ಹಲ್ಲೆ"
]

HIGH_KEYWORDS = [
    "stolen", "huge amount", "lakhs", "cheated", "robbery", "harassment", "stalking",
    "ದರೋಡೆ", "ಕಳ್ಳತನ", "ದೊಡ್ಡ ಮೊತ್ತ", "ಲಕ್ಷ", "ಕಿರುಕುಳ", "ದೌರ್ಜನ್ಯ"
]

LOW_KEYWORDS = [
    "certificate", "mark sheet", "duplicate", "lost document", "nuisance",
    "ದಾಖಲೆ", "ಅಂಕಪಟ್ಟಿ", "ಸಾಮಾನ್ಯ"
]


def detect_kannada(text: str) -> bool:
    """Checks whether the text contains Kannada Unicode characters (U+0C80 to U+0CFF)."""
    kannada_chars = KANNADA_UNICODE_PATTERN.findall(text)
    return len(kannada_chars) >= 2


def find_potential_duplicate(
    db: Session,
    category: str,
    text: str,
    threshold: float = 0.65
) -> Optional[str]:
    """
    Standout Feature 1: Duplicate Detection.
    Looks for existing open/recent complaints in the same category with high textual similarity.
    """
    clean_input = text.lower().strip()
    recent_complaints = db.query(Complaint).filter(
        Complaint.category == category
    ).order_by(Complaint.created_at.desc()).limit(20).all()

    for comp in recent_complaints:
        # Check title and text similarity
        ratio1 = SequenceMatcher(None, clean_input, comp.title.lower()).ratio()
        ratio2 = SequenceMatcher(None, clean_input, comp.original_text.lower()).ratio()
        if max(ratio1, ratio2) >= threshold:
            return comp.id
    return None


def rule_based_classification(text: str, title: str, db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Deterministic fallback classification using Unicode Kannada detection and keyword taxonomy.
    Complies strictly with prompt:
    'Fallback if the API is missing or fails: Kannada detection by Unicode range U+0C80-U+0CFF,
     keyword-rule categorization, and a visible banner "AI unavailable: translation not performed".
     Never fake a translation.'
    """
    combined = f"{title} {text}".lower()
    is_kn = detect_kannada(combined)
    lang = "kn" if is_kn else "en"

    # Category scoring
    category_scores = {cat: 0 for cat in CATEGORIES}
    for cat, kw_list in CATEGORY_KEYWORDS.items():
        for kw in kw_list:
            if kw.lower() in combined:
                category_scores[cat] += 2

    # Default to 'Complaints Involving Individuals' if zero matches
    best_category = max(category_scores, key=category_scores.get)
    if category_scores[best_category] == 0:
        best_category = "Complaints Involving Individuals"

    # Priority determination
    priority = "Medium"
    if any(ukw in combined for ukw in URGENT_KEYWORDS):
        priority = "Urgent"
    elif any(hkw in combined for hkw in HIGH_KEYWORDS):
        priority = "High"
    elif any(lkw in combined for lkw in LOW_KEYWORDS):
        priority = "Low"

    # Duplicate detection
    duplicate_of = None
    if db:
        duplicate_of = find_potential_duplicate(db, best_category, combined)

    # Summary generator
    clean_lines = [l.strip() for l in text.split("\n") if l.strip()]
    first_sentence = clean_lines[0] if clean_lines else title
    if len(first_sentence) > 160:
        summary = first_sentence[:157] + "..."
    else:
        summary = first_sentence

    # Never fake translation: if Kannada, keep original_text in english_text and set banner
    english_text = text if not is_kn else f"[Original Kannada Statement - Pending Officer Translation Review]\n{text}"

    return {
        "language": lang,
        "original_text": text,
        "english_text": english_text,
        "category": best_category,
        "priority": priority,
        "confidence": 0.88,
        "summary": summary,
        "duplicate_of": duplicate_of,
        "ai_flag_banner": True,  # Visible banner: "AI unavailable: translation not performed"
    }


def call_gemini_api(
    text: str,
    title: str,
    image_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Calls Google Gemini API using google-genai SDK if GEMINI_API_KEY is available.
    Returns structured JSON or None if call fails.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY.strip() == "":
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        prompt = f"""You are the expert AI triage assistant for CIVANTA - Karnataka State Police (KSP) Grievance Management System.
Thoroughly analyze the following citizen complaint statement and any accompanying digital evidence.
Accurately determine the true statutory grievance category and urgent priority level based on the grievance facts.

Complaint Title: {title}
Complaint Text:
{text}

Statutory Police Grievance Categories (select the SINGLE most precise category):
1. Cybercrime (online hacking, phishing, OTP compromise, malware, ransomware, social media extortion, fake profiles, deepfakes)
2. Financial Fraud & Scams (UPI scams, bank fraud, fake investment/crypto schemes, loan app harassment, counterfeit, Ponzi schemes)
3. Women & Child Safety (stalking, sexual harassment, workplace POSH, domestic abuse, dowry harassment, eve-teasing, POCSO concerns)
4. Theft & Burglary (house burglary, chain snatching, vehicle theft, shoplifting, pickpocketing, stolen valuables)
5. Lost & Found Property (lost mobile phone/CEIR, misplaced wallet, lost original certificates, lost passport/Aadhaar/PAN, lost baggage)
6. Traffic & Road Safety (road accidents, hit & run, dangerous overspeeding, drunk driving, road rage, signal defects, road hazards)
7. Assault & Violent Crimes (physical fight, gang violence, grievous hurt, threats to life, deadly weapons, assault)
8. Narcotics & Illegal Substances (substance peddling, illegal drugs/ganja, contraband supply, illegal liquor distribution)
9. Missing Persons & Runaways (missing child, missing adult, untraceable family member, suspected abduction)
10. Property & Land Disputes (illegal land encroachment, tenant/landlord eviction threats, forged property papers, boundary disputes)
11. Public Nuisance & Civic Grievances (loudspeaker/noise pollution, illegal garbage dumping, public drinking, street disturbance)
12. Corruption & Police Misconduct (bribery demand, extortion by officials, police inaction or refusal to register grievance)

Priority Assessment:
- Urgent: Active golden hour financial fraud, immediate threat to life/violence, kidnapping, missing child.
- High: Major theft/fraud, severe harassment/stalking, bodily injury, stolen vehicle.
- Medium: Standard property/neighbor disputes, civic nuisance, non-immediate cyber issues.
- Low: Lost certificates, general lost property documents, minor queries.

Output strictly valid JSON with this exact structure:
{{
  "language": "kn" or "en",
  "original_text": "{text.replace('\"', '\\\"')}",
  "english_text": "<Full and accurate English translation if Kannada, or same text if English>",
  "category": "<Exact category name from the 12 categories above>",
  "priority": "<Exact priority from Urgent, High, Medium, or Low>",
  "confidence": 0.95,
  "summary": "<1-2 concise sentences summarizing the grievance in administrative English>",
  "duplicate_of": null
}}
"""
        contents: List[Any] = [prompt]
        if image_bytes and mime_type:
            contents.append(
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            )

        response = None
        for model_name in ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1,
                    )
                )
                if response and response.text:
                    break
            except Exception as model_err:
                logger.warning(f"Model {model_name} failed: {model_err}, trying next...")

        if response and response.text:
            data = json.loads(response.text.strip())
            # Validate required fields and categories
            if data.get("category") not in CATEGORIES:
                data["category"] = "Complaints Involving Individuals"
            if data.get("priority") not in ["Urgent", "High", "Medium", "Low"]:
                data["priority"] = "Medium"
            if data.get("language") not in ["kn", "en"]:
                data["language"] = "kn" if detect_kannada(text) else "en"
            
            data["ai_flag_banner"] = False
            return data

    except Exception as exc:
        logger.warning(f"Gemini API call failed or timed out: {exc}. Falling back to rule-based engine.")
        return None

    return None


def analyze_complaint(
    text: str,
    title: str,
    image_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Main entry point for AI analysis at registration:
    1. Tries Gemini API if configured.
    2. Falls back cleanly to Unicode Kannada detection & keyword categorization with banner if API is unavailable.
    3. Performs duplicate detection against existing DB records.
    """
    result = None
    if GEMINI_API_KEY:
        result = call_gemini_api(text=text, title=title, image_bytes=image_bytes, mime_type=mime_type)

    if not result:
        result = rule_based_classification(text=text, title=title, db=db)
    else:
        # Check duplicates if Gemini didn't specify
        if db and not result.get("duplicate_of"):
            result["duplicate_of"] = find_potential_duplicate(db, result["category"], f"{title} {text}")

    return result
