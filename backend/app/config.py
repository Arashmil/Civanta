import os
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env if present
load_dotenv(BASE_DIR / ".env")

# Settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
JWT_SECRET = os.getenv("JWT_SECRET", "civanta-super-secret-jwt-key-2026-karnataka-police")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'civanta.db'}")
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file types and max upload size (10MB)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".txt", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# System categories (Exactly 5)
CATEGORIES = [
    "Cybercrime",
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
