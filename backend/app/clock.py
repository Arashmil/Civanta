from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.database import SessionLocal

# Indian Standard Time (IST) timezone (UTC + 05:30)
IST = timezone(timedelta(hours=5, minutes=30), name="IST")

# In-memory offset cache, synchronized with DB
_CLOCK_OFFSET_SECONDS = 0

def init_clock():
    """Load persisted clock offset from DB on startup."""
    global _CLOCK_OFFSET_SECONDS
    try:
        from app.models import SystemConfig
        db = SessionLocal()
        cfg = db.query(SystemConfig).filter(SystemConfig.key == "clock_offset_seconds").first()
        if cfg:
            _CLOCK_OFFSET_SECONDS = int(cfg.value)
        db.close()
    except Exception:
        pass

def get_now() -> datetime:
    """Returns current simulated time (real UTC time + offset)."""
    return datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(seconds=_CLOCK_OFFSET_SECONDS)

def get_now_ist() -> datetime:
    """Returns current simulated time in Indian Standard Time (IST)."""
    return (datetime.now(timezone.utc) + timedelta(seconds=_CLOCK_OFFSET_SECONDS)).astimezone(IST)

def set_clock_offset(offset_seconds: int, db: Session = None):
    """Sets the clock offset and persists it to DB."""
    global _CLOCK_OFFSET_SECONDS
    _CLOCK_OFFSET_SECONDS = offset_seconds
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        from app.models import SystemConfig
        cfg = db.query(SystemConfig).filter(SystemConfig.key == "clock_offset_seconds").first()
        if not cfg:
            cfg = SystemConfig(key="clock_offset_seconds", value=str(offset_seconds), description="Simulated clock offset in seconds")
            db.add(cfg)
        else:
            cfg.value = str(offset_seconds)
        db.commit()
    finally:
        if close_db:
            db.close()

def fast_forward(days: int = 0, hours: int = 0, db: Session = None) -> datetime:
    """Fast-forwards simulated clock by days and/or hours."""
    add_seconds = (days * 86400) + (hours * 3600)
    new_offset = _CLOCK_OFFSET_SECONDS + add_seconds
    set_clock_offset(new_offset, db)
    return get_now()

def reset_clock(db: Session = None) -> datetime:
    """Resets simulated clock to real-time (offset=0)."""
    set_clock_offset(0, db)
    return get_now()

def get_clock_status() -> dict:
    real_now_utc = datetime.now(timezone.utc)
    sim_now_utc = real_now_utc + timedelta(seconds=_CLOCK_OFFSET_SECONDS)
    
    real_now_ist = real_now_utc.astimezone(IST)
    sim_now_ist = sim_now_utc.astimezone(IST)
    
    return {
        "real_time": real_now_ist.isoformat(),
        "simulated_time": sim_now_ist.isoformat(),
        "simulated_time_ist": sim_now_ist.strftime("%d %b %Y, %I:%M:%S %p IST"),
        "timezone": "Asia/Kolkata (IST, UTC+05:30)",
        "offset_seconds": _CLOCK_OFFSET_SECONDS,
        "offset_days": round(_CLOCK_OFFSET_SECONDS / 86400, 2),
        "is_simulated": _CLOCK_OFFSET_SECONDS != 0
    }
