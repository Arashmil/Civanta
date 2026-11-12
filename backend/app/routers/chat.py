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

REAL_CASES = {
    "KSP-2026-CYB-001": {
        "id": "KSP-2026-CYB-001",
        "fir_number": "0114/2026",
        "title": "₹24 Crore 'Digital Arrest' Extortion Syndicate",
        "category": "Cybercrime / Cyber & Financial Fraud",
        "priority": "Urgent",
        "status": "Accused Arrested / Charge Sheet Pending",
        "assigned_unit": "Bengaluru Cyber Crime PS / State Cyber Command",
        "officer": "Cyber Crime Investigation Team (Police Inspector)",
        "supervising_officer": "Pranab Mohanty, IPS (DGP, State Cyber Command)",
        "applicable_laws": "BNS Section 318(4) (Cheating), BNS Section 319(2) (Personation), BNS Section 308 (Extortion), IT Act Section 66D",
        "financial_loss_inr": 240000000,
        "amount_frozen_inr": 40000000,
        "next_action": "Coordinate inter-state extradition and forensic audit of 23 mule accounts",
        "due_date": "2026-11-20 18:00",
        "summary": "Inter-state gang impersonating CBI and ED officials coerced a 74-year-old Bengaluru woman into transferring ₹24 crore across 23 mule accounts. Cyber Command intervened via bank alerts and froze ₹4 crore."
    },
    "KSP-2026-CYB-002": {
        "id": "KSP-2026-CYB-002",
        "fir_number": "0595/2026",
        "title": "₹31.43 Crore Varthur Fintech Escrow Cyber Fraud",
        "category": "Cybercrime / Financial Fraud",
        "priority": "Urgent",
        "status": "Under Active Investigation",
        "assigned_unit": "Whitefield CEN Police Station",
        "officer": "Whitefield CEN Investigation Team (Police Inspector)",
        "supervising_officer": "DCP Whitefield Division (IPS)",
        "applicable_laws": "BNS Section 318(4), IT Act Section 66, IT Act Section 66C (Identity Theft)",
        "financial_loss_inr": 314300000,
        "amount_frozen_inr": 0,
        "next_action": "Audit 301 API access tokens and subpoena private bank server transaction logs",
        "due_date": "2026-11-18 12:00",
        "summary": "Hackers executed 301 unauthorized transactions draining ₹31.43 crore from a Varthur-based fintech firm's private bank escrow account."
    },
    "KSP-SIT-EOW-003": {
        "id": "KSP-SIT-EOW-003",
        "fir_number": "0073/2019",
        "title": "I Monetary Advisory (IMA) Multi-Crore Ponzi Scam",
        "category": "Financial Fraud & Scams / Economic Offence",
        "priority": "Urgent",
        "status": "Property Attachment & Trial Ongoing",
        "assigned_unit": "Special Investigation Team (SIT) / Commercial Street PS",
        "officer": "S. Girish, IPS (DCP Crime / Karnataka SIT)",
        "supervising_officer": "B.R. Ravikanthe Gowda, IPS (DIG, SIT Chief)",
        "applicable_laws": "KPID Act Section 9, BNS Section 316(5) (Criminal Breach of Trust), BNS Section 318(4) (Cheating)",
        "financial_loss_inr": 25000000000,
        "amount_frozen_inr": 3500000000,
        "next_action": "Liquidate attached real estate assets to disburse restitution to 1 lakh+ depositors",
        "due_date": "2026-12-31 23:59",
        "summary": "Over 1 lakh investors across Karnataka were duped of ₹2,500+ crore through fraudulent Islamic investment schemes; properties attached under the KPID Act."
    },
    "KSP-2025-WOM-004": {
        "id": "KSP-2025-WOM-004",
        "fir_number": "0412/2025",
        "title": "Instagram Stalking & Assault Outside Ladies PG (Ullal)",
        "category": "Women & Child Safety / Harassment & Assault",
        "priority": "High",
        "status": "Accused Arrested",
        "assigned_unit": "Jnanabharathi Police Station",
        "officer": "Jnanabharathi PS Investigation Team (Police Inspector)",
        "supervising_officer": "C. Vamsi Krishna, IPS (Joint Commissioner of Police West)",
        "applicable_laws": "BNS Section 78 (Stalking), BNS Section 75 (Sexual Harassment), BNS Section 115(2) (Voluntarily Causing Hurt), BNS Section 351 (Criminal Intimidation)",
        "financial_loss_inr": 0,
        "amount_frozen_inr": 0,
        "next_action": "Submit Medico-Legal Certificate (MLC) and street CCTV footage with charge sheet",
        "due_date": "2026-11-25 17:00",
        "summary": "Accused stalked a 21-year-old student outside Ladies PG in Ullal and physically assaulted her after online harassment; accused arrested."
    },
    "KSP-2026-WOM-005": {
        "id": "KSP-2026-WOM-005",
        "fir_number": "0089/2026",
        "title": "Public Road Stalking & Harassment in Kuriya",
        "category": "Women & Child Safety / Street Harassment",
        "priority": "Medium",
        "status": "Accused Arrested",
        "assigned_unit": "Puttur Town Police Station",
        "officer": "Puttur Town PS Officer (Police Sub-Inspector)",
        "supervising_officer": "DySP Puttur Sub-Division (Dakshina Kannada District Police)",
        "applicable_laws": "BNS Section 78 (Stalking), BNS Section 79 (Insulting Modesty of a Woman)",
        "financial_loss_inr": 0,
        "amount_frozen_inr": 0,
        "next_action": "File final report before jurisdictional Magistrate court",
        "due_date": "2026-11-28 15:00",
        "summary": "Youth followed and verbally harassed a woman walking on public road in Kuriya, Puttur; arrested promptly."
    },
    "KSP-2026-POC-006": {
        "id": "KSP-2026-POC-006",
        "fir_number": "0034/2026",
        "title": "Institutional Sexual Harassment of Minors",
        "category": "Women & Child Safety / Child Abuse & POCSO",
        "priority": "Urgent",
        "status": "Accused Booked / Investigation Ongoing",
        "assigned_unit": "Mangaluru Women's Police Station",
        "officer": "Confidential IO (Woman Police Inspector)",
        "supervising_officer": "ACP Crime & Women Cell (Mangaluru City Police)",
        "applicable_laws": "POCSO Act Sections 8 & 12, BNS Section 75(2) (Sexual Harassment)",
        "financial_loss_inr": 0,
        "amount_frozen_inr": 0,
        "next_action": "Record Section 183 BNSS Magistrate Statements and submit Child Welfare Committee (CWC) counseling report",
        "due_date": "2026-11-19 16:00",
        "summary": "Cases registered against an institutional figure accused of sexually harassing two minor boys; handled under strict confidentiality protocols."
    },
    "KSP-2026-MIS-007": {
        "id": "KSP-2026-MIS-007",
        "fir_number": "0198/2026",
        "title": "Extortion & Verbal Abuse by Police Personnel",
        "category": "Corruption & Police Misconduct",
        "priority": "Urgent",
        "status": "Departmental Inquiry Initiated",
        "assigned_unit": "Mangaluru South (Pandeshwar) Police Station",
        "officer": "Mangaluru South PS Investigating Team",
        "supervising_officer": "DCP Law & Order (Mangaluru City)",
        "applicable_laws": "BNS Section 308(2) (Extortion), BNS Section 352 (Intentional Insult)",
        "financial_loss_inr": 0,
        "amount_frozen_inr": 0,
        "next_action": "Review station CCTV and submit departmental inquiry report to Commissioner",
        "due_date": "2026-11-17 11:00",
        "summary": "Allegations of extortion and verbal abuse by police personnel at Pandeshwar PS under departmental inquiry."
    }
}

SYSTEM_PROMPT = """You are 'CIVANTA Sahāyaka' (ಸಿವಾಂತ ಸಹಾಯಕ), the official conversational AI Police Desk Copilot for Karnataka State Police (KSP).
You operate hand-in-hand with the CIVANTA platform and have deep knowledge of the website, its active cases, Indian criminal law, police procedures, and internet resources.

CORE RESPONSIBILITIES:
1. Provide accurate, empathetic, and actionable guidance for citizens, investigating officers (PSIs), supervisors (DySPs), and administrators.
2. Explain legal provisions under the Bharatiya Nyaya Sanhita (BNS 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), IT Act 2000, POCSO Act 2012, and KPID Act.
3. Guide users on immediate emergency actions (112, 1930 Cyber helpline, cybercrime.gov.in, CEIR portal for lost phones).
4. Provide factual updates on active cases in the CIVANTA website (e.g., KSP-2026-CYB-001, KSP-2026-CYB-002, KSP-SIT-EOW-003, KSP-2025-WOM-004, KSP-2026-POC-006).
5. Guide complainants on how to use CIVANTA's tools: 'AI Grievance Structurer', 'Jurisdiction Finder', 'Statutory Notices (Sec 106 BNSS / 67C IT Act)', and 'Supervisory Directives'.

INTERNET & STATUTORY INTELLIGENCE:
- Cyber Fraud Golden Hour: Reporting to 1930 or cybercrime.gov.in within 2 hours enables freezing funds in mule bank accounts via CFCFRMS.
- Lost Mobile Phones: Use Central Equipment Identity Register (ceir.gov.in) to block IMEI across all telecom operators.
- Zero FIR: Under Section 173(1) BNSS 2023, a citizen can file a Zero FIR at ANY police station in India regardless of territorial jurisdiction.
- Stalking & Harassment: BNS Section 78 (Stalking), BNS Section 75 (Sexual Harassment), BNS Section 79 (Word/Gesture insulting modesty of a woman).
- Cheating & Fraud: BNS Section 318(4) (formerly IPC 420), IT Act Section 66D.
- Corruption Complaints: Lodge with Karnataka Lokayukta (lokayukta.kar.nic.in) under the Prevention of Corruption Act 1988 with affidavit.

FORMATTING:
- Professional, clear plain text with clean bullet points (•) and numbered steps.
- Bilingual: Fluently respond in Kannada or English depending on user input.
- Always include the statutory disclaimer: '[Suggested. Officer must confirm.]' or '[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]'.
"""

def extract_complaint_id(text: str) -> Optional[str]:
    # Match both KA-XXX-2026-XXXX and KSP-XXXX-XXX-XXX
    match = re.search(r"\b(KA-[A-Z]{3}-2026-\d{4}|KSP-[A-Z0-9-]+)\b", text, re.IGNORECASE)
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
        if cid in REAL_CASES:
            comp_data = REAL_CASES[cid]
        else:
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
