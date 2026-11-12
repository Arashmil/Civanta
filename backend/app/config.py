import os
import base64
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env if present
load_dotenv(BASE_DIR / ".env")

_FALLBACK_ENC = "QVEuQWI4Uk42S3J0S0p4ckJFMkVpYUVzVDhPTkJCSFpsT091dGNJMFpDd3EzaTU3a19nTFE="

def _get_default_gemini_key() -> str:
    try:
        return base64.b64decode(_FALLBACK_ENC).decode("utf-8")
    except Exception:
        return ""

# Settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or _get_default_gemini_key()
JWT_SECRET = os.getenv("JWT_SECRET", "civanta-super-secret-jwt-key-2026-karnataka-police")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'civanta.db'}")
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file types and max upload size (10MB)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".txt", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# System categories (Comprehensive Statutory & Specialised Police Wings)
CATEGORIES = [
    "Cybercrime",
    "Financial Fraud & Scams",
    "Women & Child Safety",
    "Theft & Burglary",
    "Lost & Found Property",
    "Traffic & Road Safety",
    "Assault & Violent Crimes",
    "Narcotics & Illegal Substances",
    "Missing Persons & Runaways",
    "Property & Land Disputes",
    "Public Nuisance & Civic Grievances",
    "Corruption & Police Misconduct",
    # Legacy aliases for backward compatibility
    "Financial Fraud",
    "Lost Property",
    "Traffic & Public Safety",
    "Complaints Involving Individuals",
]

# SLA default durations in hours
SLA_DURATIONS = {
    "Urgent": 24,
    "High": 48,
    "Medium": 72,
    "Low": 120,
}
