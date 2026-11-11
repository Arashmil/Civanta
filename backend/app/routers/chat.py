import re
import logging
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import GEMINI_API_KEY
from app.models import Complaint

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Virtual Police Desk Chatbot"])

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    language: Optional[str] = "en"  # "en" or "kn"

class ChatResponse(BaseModel):
    reply: str
    complaint_found: Optional[dict] = None
    disclaimer: str = "Suggested. Officer must confirm."

SYSTEM_PROMPT = """You are 'CIVANTA Sahāyaka' (ಸಿವಾಂತ ಸಹಾಯಕ), the official AI Grievance Assistant for Karnataka State Police (KSP).
Your mission is to assist citizens, complainants, and police personnel politely, factually, and accurately.

CRITICAL FORMATTING INSTRUCTIONS (STRICT PLAIN-TEXT ONLY):
- Write in clean, professional, conversational plain text without markdown symbols.
- DO NOT use markdown bold asterisks (never use **word**), italics (*word*), or any asterisks (*).
- DO NOT use markdown header hashtags (#, ##, ###).
- DO NOT use raw markdown bullet characters (* or -). If listing points, use clean plain text bullets (• ) or standard numbers (1., 2.).
- Present case details in clean, natural lines, for example:
  Case ID: KA-CYB-2026-0001
  Subject: Unauthorized debit card OTP compromise
  Status: In Progress
  Assigned Officer: PSI Anand Kumar
  Next Action: Trace IP origin of phishing server
  Resolution Due Date: 2026-11-12
- Keep answers concise, human-readable, and free of markdown syntax artifacts.

KNOWLEDGE BASE & POLICE PROCEDURES:
1. STATUTORY POLICE GRIEVANCE CATEGORIES:
   - Cybercrime: UPI fraud, SIM swap, phishing, social media hacking, ransomware, fake accounts.
   - Financial Fraud & Scams: bogus trading groups, loan app harassment, Ponzi schemes, counterfeit currency.
   - Women & Child Safety: stalking, harassment, domestic violence, workplace POSH, eve-teasing.
   - Theft & Burglary: house theft, chain snatching, vehicle theft, pickpocketing.
   - Lost & Found Property: lost mobile phones (CEIR tracking), laptops, bags, original certificates, passports.
   - Traffic & Road Safety: dangerous overspeeding, hit-and-run, road encroachments, signal defects.
   - Assault & Violent Crimes: physical violence, life threats, weapons, grievous hurt.
   - Narcotics & Illegal Substances: drug peddling, contraband, substance abuse.
   - Missing Persons & Runaways: missing adults, missing children, tracing.
   - Property & Land Disputes: land encroachment, tenant/landlord disputes, forged sale deeds.
   - Public Nuisance & Civic Grievances: noise pollution, illegal dumping, public drinking.
   - Corruption & Police Misconduct: bribery demands, officer harassment, procedural lapse.
2. STATUTORY RESOLUTION SLA RULES:
   - 24 Hours: Investigating officer must acknowledge and log mandatory next action.
   - 3 Days Overdue: Automated escalation to Supervisory Command (DySP console).
   - 7 Days Overdue: Critical Red Flag alert elevated on Supervisory Command console.
3. EMERGENCY & HELPLINE NUMBERS:
   - All Emergency Services (Police / Fire / Ambulance): Dial 112
   - National Cyber Crime Helpline: Dial 1930 (or visit cybercrime.gov.in)
   - Women Helpline: 1091 / 112
   - Child Helpline: 1098
4. CORE STATUTORY PILOT DIRECTIVE:
   - You are strictly an informational assistant for grievance tracking and procedural navigation.
   - You must NEVER determine criminal guilt, judge allegations, register offences, or issue FIRs. Those responsibilities remain solely with authorized police officers.
   - Always ensure every response carries the statutory reminder: '[Suggested. Officer must confirm.]'.
5. BILINGUAL SUPPORT:
   - If the user interacts in Kannada, respond in natural, polite, and grammatically correct Kannada.
   - If the user interacts in English, respond in professional administrative English.
"""

def clean_chat_reply(text: str) -> str:
    """Removes annoying markdown artifacts (*, **, #) to deliver clean, polished plain text."""
    if not text:
        return ""
    # Strip markdown headers #, ##, ###
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    # Strip ** bold and * italic markers
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    # Convert leading markdown bullets "* " or "- " to clean "• "
    text = re.sub(r"^[*-]\s+", "• ", text, flags=re.MULTILINE)
    # Strip any remaining stray asterisks or hashes
    text = text.replace("**", "").replace("*", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def extract_complaint_id(text: str) -> Optional[str]:
    match = re.search(r"\b(KA-[A-Z]{3}-2026-\d{4})\b", text, re.IGNORECASE)
    return match.group(1).upper() if match else None

def rule_based_fallback(message: str, comp_data: Optional[dict], lang: str) -> str:
    m = message.lower()
    is_kn = lang == "kn" or any("\u0c80" <= c <= "\u0cff" for c in message)

    if comp_data:
        if is_kn:
            return (
                f"ಪ್ರಕರಣ {comp_data['id']} ವಿವರಗಳು:\n"
                f"• ವಿಷಯ: {comp_data['title']}\n"
                f"• ವರ್ಗ: {comp_data['category']} ({comp_data['priority']} ಆದ್ಯತೆ)\n"
                f"• ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: {comp_data['status']}\n"
                f"• ನಿಯೋಜಿತ ವಿಭಾಗ: {comp_data['assigned_unit']}\n"
                f"• ತನಿಖಾಧಿಕಾರಿ: {comp_data['officer']}\n"
                f"• ಮುಂದಿನ ಕಡ್ಡಾಯ ಕ್ರಮ: {comp_data['next_action']}\n"
                f"• ಗಡುವು: {comp_data['due_date']}\n\n"
                f"[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
            )
        else:
            return (
                f"Record summary for Complaint {comp_data['id']}:\n"
                f"• Subject: {comp_data['title']}\n"
                f"• Category: {comp_data['category']} ({comp_data['priority']} Priority)\n"
                f"• Status: {comp_data['status']}\n"
                f"• Assigned Unit: {comp_data['assigned_unit']}\n"
                f"• Investigating Officer: {comp_data['officer']}\n"
                f"• Mandatory Next Action: {comp_data['next_action']}\n"
                f"• Target Resolution Due Date: {comp_data['due_date']}\n\n"
                f"[Suggested. Officer must confirm.]"
            )

    if any(k in m for k in ["1930", "cyber", "phish", "otp", "hack", "ಸೈಬರ್"]):
        if is_kn:
            return (
                "ಆನ್‌ಲೈನ್ ಹಣಕಾಸು ಅಥವಾ ಸೈಬರ್ ವಂಚನೆ ನಡೆದ ತಕ್ಷಣ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ 1930 ಗೆ ಕರೆ ಮಾಡಿ. "
                "ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು ಮತ್ತು ವಹಿವಾಟು ಐಡಿಗಳನ್ನು ಒದಗಿಸಿ. ಸಿವಾಂತ (CIVANTA) ಪೋರ್ಟಲ್‌ನಲ್ಲಿ 'ಸೈಬರ್ ಅಪರಾಧ' ವರ್ಗದಲ್ಲಿ ತಕ್ಷಣ ದೂರು ದಾಖಲಿಸಿ.\n\n"
                "[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
            )
        else:
            return (
                "For cyber financial fraud or unauthorized transactions, immediately call the National Cyber Crime Helpline at 1930. "
                "Report details within the golden hour to freeze beneficiary bank accounts. You can also file an official grievance in CIVANTA under 'Cybercrime'.\n\n"
                "[Suggested. Officer must confirm.]"
            )

    if any(k in m for k in ["112", "emergency", "ತುರ್ತು"]):
        if is_kn:
            return "ಯಾವುದೇ ತುರ್ತು ಪೊಲೀಸ್, ಅಗ್ನಿಶಾಮಕ ಅಥವಾ ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಹಾಯಕ್ಕಾಗಿ ತಕ್ಷಣ 112 ಗೆ ಕರೆ ಮಾಡಿ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        else:
            return "For any immediate police, fire, or medical emergency, immediately dial 112 (Emergency Response Support System).\n\n[Suggested. Officer must confirm.]"

    if any(k in m for k in ["category", "categories", "ವರ್ಗ"]):
        if is_kn:
            return (
                "ಸಿವಾಂತ (CIVANTA) ವ್ಯವಸ್ಥೆಯಲ್ಲಿ 5 ಶಾಸನಬದ್ಧ ದೂರು ವರ್ಗಗಳಿವೆ:\n"
                "1. ಸೈಬರ್ ಅಪರಾಧ (Cybercrime)\n"
                "2. ಹಣಕಾಸು ವಂಚನೆ (Financial Fraud)\n"
                "3. ಕಳೆದುಹೋದ ವಸ್ತುಗಳು (Lost Property)\n"
                "4. ಸಂಚಾರ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ (Traffic & Public Safety)\n"
                "5. ವ್ಯಕ್ತಿಗಳ ನಡುವಿನ ದೂರುಗಳು (Complaints Involving Individuals)\n\n"
                "[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
            )
        else:
            return (
                "CIVANTA operates on exactly 5 statutory categories:\n"
                "1. Cybercrime (online fraud, phishing, hacking)\n"
                "2. Financial Fraud (investment scams, unauthorized loans)\n"
                "3. Lost Property (mobile phones, laptops, identity cards)\n"
                "4. Traffic & Public Safety (hit & run, traffic hazards)\n"
                "5. Complaints Involving Individuals (tenant disputes, workplace harassment)\n\n"
                "[Suggested. Officer must confirm.]"
            )

    # General greeting / fallback
    if is_kn:
        return (
            "ನಮಸ್ಕಾರ! ನಾನು ಸಿವಾಂತ ಸಹಾಯಕ (CIVANTA Sahayaka), ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಕುಂದುಕೊರತೆ ಮಾರ್ಗದರ್ಶಿ.\n"
            "ನಾನು ನಿಮಗೆ ದೂರು ದಾಖಲಿಸಲು, ದೂರು ಸಂಖ್ಯೆ (ಉದಾಹರಣೆಗೆ KA-CYB-2026-0001) ಮೂಲಕ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಲು ಅಥವಾ ಸಹಾಯವಾಣಿ ಮಾಹಿತಿ ನೀಡಲು ನೆರವಾಗಬಲ್ಲೆ.\n\n"
            "[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        )
    return (
        "Hello! I am CIVANTA Sahāyaka, the virtual grievance desk assistant for Karnataka State Police.\n"
        "I can help you file a complaint, check the live status of your complaint ID (e.g. KA-CYB-2026-0001), explain the 5 grievance categories, or provide emergency helpline contacts.\n\n"
        "[Suggested. Officer must confirm.]"
    )

@router.post("", response_model=ChatResponse)
def chat_with_bot(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Virtual Police Desk Chatbot Assistant.
    Supports English & Kannada. Answers grievance inquiries, checks real-time database case statuses,
    and guides citizens while strictly enforcing that it does not decide guilt or register FIRs.
    """
    cid = extract_complaint_id(req.message)
    comp_data = None

    if cid:
        comp = db.query(Complaint).filter(Complaint.id == cid).first()
        if comp:
            comp_data = {
                "id": comp.id,
                "title": comp.title,
                "category": comp.category,
                "priority": comp.priority,
                "status": comp.status,
                "assigned_unit": comp.assigned_unit,
                "officer": comp.assigned_officer_name or "Unassigned",
                "next_action": comp.next_action,
                "due_date": comp.due_date.strftime("%Y-%m-%d %H:%M") if comp.due_date else "Not set",
                "is_overdue": comp.is_overdue,
                "is_escalated": comp.is_escalated
            }

    # If Gemini API key is available, call Gemini
    if GEMINI_API_KEY and GEMINI_API_KEY.strip() != "":
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=GEMINI_API_KEY)

            # Build contextual system prompt
            context_add = ""
            if comp_data:
                context_add = f"\n\nDATABASE CONTEXT FOR CASE {comp_data['id']}:\n" + "\n".join(f"{k}: {v}" for k, v in comp_data.items())

            full_system_instruction = SYSTEM_PROMPT + context_add

            # Build message history
            conversation_contents = []
            for h in req.history[-6:]:
                conversation_contents.append(f"{h.role.upper()}: {h.content}")
            conversation_contents.append(f"USER: {req.message}")
            prompt = "\n".join(conversation_contents)

            response = None
            for model_name in ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=full_system_instruction,
                            temperature=0.3,
                            max_output_tokens=500
                        )
                    )
                    if response and response.text:
                        break
                except Exception as model_err:
                    logger.warning(f"Chat model {model_name} failed: {model_err}, trying next...")

            raw_reply = response.text.strip() if (response and response.text) else ""
            reply = clean_chat_reply(raw_reply)
            if "Suggested. Officer must confirm" not in reply and "ಸೂಚಿಸಲಾಗಿದೆ" not in reply:
                reply += "\n\n[Suggested. Officer must confirm.]"

            return ChatResponse(
                reply=reply,
                complaint_found=comp_data,
                disclaimer="Suggested. Officer must confirm."
            )
        except Exception as exc:
            logger.warning(f"Gemini chat API call failed: {exc}. Using rule-based fallback.")

    # Rule-based fallback
    reply = clean_chat_reply(rule_based_fallback(req.message, comp_data, req.language or "en"))
    return ChatResponse(
        reply=reply,
        complaint_found=comp_data,
        disclaimer="Suggested. Officer must confirm."
    )
