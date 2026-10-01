from typing import Dict, List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Setting
from app.schemas import SettingUpdate, SettingResponse

router = APIRouter(prefix="/api/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "winter_arc_rule": "Oct 1 - Dec 31 (Annual Auto-Mode)",
    "winter_arc_start_day": "10-01",
    "winter_arc_end_day": "12-31",
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

import json

@router.get("/reflections/{year}/{month}")
def get_monthly_reflection(year: int, month: int, db: Session = Depends(get_db)):
    athlete_set = db.query(Setting).filter(Setting.key == "athlete_name").first()
    curr_athlete_name = athlete_set.value if athlete_set and athlete_set.value else "Aman"

    key = f"reflection_{year}_{month:02d}"
    s = db.query(Setting).filter(Setting.key == key).first()
    if s and s.value:
        try:
            data = json.loads(s.value)
            if not data.get("athlete_name"):
                data["athlete_name"] = curr_athlete_name
            return data
        except Exception:
            return {"goal": s.value, "achieved": "", "improve": "", "athlete_name": curr_athlete_name}
    return {"goal": "", "achieved": "", "improve": "", "athlete_name": curr_athlete_name}

@router.put("/reflections/{year}/{month}")
def save_monthly_reflection(year: int, month: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    ath_name = payload.get("athlete_name")
    if ath_name:
        ath_set = db.query(Setting).filter(Setting.key == "athlete_name").first()
        if not ath_set:
            ath_set = Setting(key="athlete_name", value=ath_name)
            db.add(ath_set)
        else:
            ath_set.value = ath_name

    key = f"reflection_{year}_{month:02d}"
    s = db.query(Setting).filter(Setting.key == key).first()
    val = json.dumps(payload)
    if not s:
        s = Setting(key=key, value=val)
        db.add(s)
    else:
        s.value = val
    db.commit()
    return {"status": "success", "athlete_name": ath_name}
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

