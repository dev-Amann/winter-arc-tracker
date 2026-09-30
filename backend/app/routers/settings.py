from typing import Dict, List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Setting
from app.schemas import SettingUpdate, SettingResponse

router = APIRouter(prefix="/api/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "winter_arc_start": "2026-10-01",
    "winter_arc_end": "2026-12-31",
    "theme": "dark",
    "streak_target_pct": "80"
}

def seed_settings_if_empty(db: Session):
    for key, default_val in DEFAULT_SETTINGS.items():
        existing = db.query(Setting).filter(Setting.key == key).first()
        if not existing:
            db.add(Setting(key=key, value=default_val))
    db.commit()

@router.get("", response_model=Dict[str, str])
def get_settings(db: Session = Depends(get_db)):
    seed_settings_if_empty(db)
    settings = db.query(Setting).all()
    return {s.key: s.value for s in settings}

@router.put("/{key}")
def update_setting(key: str, payload: SettingUpdate, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        setting = Setting(key=key, value=payload.value)
        db.add(setting)
    else:
        setting.value = payload.value
    db.commit()
    db.refresh(setting)
    return {"key": setting.key, "value": setting.value}
