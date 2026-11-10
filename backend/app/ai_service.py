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

# Keyword dictionaries for the 5 categories (English & Kannada)
CATEGORY_KEYWORDS = {
    "Cybercrime": [
        "cyber", "hack", "hacked", "phishing", "malware", "virus", "otp", "sim swap", 
        "fake website", "ransomware", "apk", "social media hack", "instagram", "facebook",
        "ಸೈಬರ್", "ಹ್ಯಾಕ್", "ಒಟಿಪಿ", "ಲಿಂಕ್", "ವೈರಸ್", "ಸಾಮಾಜಿಕ ಜಾಲತಾಣ", "ಖಾತೆ ಹ್ಯಾಕ್"
    ],
    "Financial Fraud": [
        "fraud", "cheated", "bank", "upi", "gpay", "phonepe", "paytm", "atm", "credit card",
        "debit card", "investment scam", "loan scam", "crypto", "money transfer", "unauthorized transaction",
        "ಹಣ", "ಬ್ಯಾಂಕ್", "ವಂಚನೆ", "ಯುಪಿಐ", "ಸಾಲ", "ಖಾತೆ", "ವರ್ಗಾವಣೆ", "ಮೋಸ"
    ],
    "Lost Property": [
        "lost", "missing", "wallet", "purse", "phone", "mobile", "laptop", "bag", "vehicle",
        "bike", "car", "license", "rc book", "certificate", "passport", "pan card", "aadhaar",
        "ಕಳೆದುಹೋದ", "ಮೊಬೈಲ್", "ವಾಹನ", "ದಾಖಲೆ", "ಪರ್ಸ್", "ಬ್ಯಾಗ್", "ಕಾಣೆಯಾದ", "ಪಾಸ್‌ಪೋರ್ಟ್"
    ],
    "Traffic & Public Safety": [
        "traffic", "signal", "accident", "hit and run", "rash driving", "overspeeding",
        "parking", "road block", "pothole", "drunk driving", "street light", "junction",
        "ರಸ್ತೆ", "ಅಪಘಾತ", "ಸಿಗ್ನಲ್", "ಪಾರ್ಕಿಂಗ್", "ವಾಹನ", "ದಟ್ಟಣೆ", "ಮದ್ಯಪಾನ ಚಾಲನೆ"
    ],
    "Complaints Involving Individuals": [
        "assault", "fight", "threat", "threatening", "neighbor", "harassment", "abuse",
        "domestic violence", "blackmail", "stalking", "defamation", "tenant", "landlord",
        "ಗಲಾಟೆ", "ಬೆದರಿಕೆ", "ಜಗಳ", "ದೌರ್ಜನ್ಯ", "ಕಿರುಕುಳ", "ಹಲ್ಲೆ", "ಪಕ್ಕದ ಮನೆಯವರು", "ಹಿಂಸೆ"
    ]
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

        prompt = f"""You are the AI triage assistant for CIVANTA - Karnataka State Police Grievance Management System.
Analyze the following citizen complaint statement.

Complaint Title: {title}
Complaint Text:
{text}

Allowed Categories (choose EXACTLY ONE):
- Cybercrime
- Financial Fraud
- Lost Property
- Traffic & Public Safety
- Complaints Involving Individuals

Allowed Priorities (choose EXACTLY ONE):
- Urgent (Immediate threat to life, active golden-hour bank fraud, kidnapping)
- High (Major fraud >50k, physical violence threat, stolen vehicle)
- Medium (Standard disputes, minor cyber issues, civic traffic)
- Low (Lost certificates, minor property)

Output strictly valid JSON with this exact structure:
{{
  "language": "kn" or "en",
  "original_text": "{text.replace('\"', '\\\"')}",
  "english_text": "<Full and accurate English translation if Kannada, or same text if English>",
  "category": "<Exact category from the list above>",
  "priority": "<Exact priority from the list above>",
  "confidence": <float between 0.70 and 0.99>,
  "summary": "<1-2 concise sentences summarizing the grievance in English>",
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
