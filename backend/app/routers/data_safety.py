import csv
import io
import json
from datetime import datetime, date
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Category, Goal, GoalLog, DailyRecord, Setting

router = APIRouter(prefix="/api/data", tags=["Data Safety"])

def custom_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

@router.get("/export/json")
def export_json(db: Session = Depends(get_db)):
    categories = [c.__dict__ for c in db.query(Category).all()]
    goals = [g.__dict__ for g in db.query(Goal).all()]
    logs = [l.__dict__ for l in db.query(GoalLog).all()]
    records = [r.__dict__ for r in db.query(DailyRecord).all()]
    settings = [s.__dict__ for s in db.query(Setting).all()]

    def clean_dict(d_list):
        cleaned = []
        for item in d_list:
            c = {k: v for k, v in item.items() if not k.startswith("_")}
            cleaned.append(c)
        return cleaned

    export_payload = {
        "version": "1.0",
        "app": "Winter Arc Tracker",
        "exported_at": datetime.utcnow().isoformat(),
        "categories": clean_dict(categories),
        "goals": clean_dict(goals),
        "goal_logs": clean_dict(logs),
        "daily_records": clean_dict(records),
        "settings": clean_dict(settings)
    }

    json_str = json.dumps(export_payload, default=custom_serializer, indent=2)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=winter_arc_export_{date.today().isoformat()}.json"}
    )

@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    logs = db.query(GoalLog).all()
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Log ID", "Date", "Goal Name", "Category", "Target Value", "Actual Value", 
        "Unit", "Goal Direction", "Achievement %", "Status", "Notes"
    ])
    
    for l in logs:
        g = l.goal
        g_name = g.name if g else "Unknown Goal"
        g_cat = g.category.name if (g and g.category) else "Uncategorized"
        unit = g.unit if g else ""
        direction = g.goal_direction if g else "higher_is_better"

        writer.writerow([
            l.id,
            l.log_date.isoformat(),
            g_name,
            g_cat,
            l.target_value,
            l.actual_value,
            unit,
            direction,
            l.achievement_pct,
            l.status,
            l.notes or ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=winter_arc_logs_{date.today().isoformat()}.csv"}
    )

@router.post("/import/json")
async def import_json(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="File must be a JSON file")

    content = await file.read()
    try:
        data = json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON content: {str(e)}")

    if "goals" not in data or "goal_logs" not in data:
        raise HTTPException(status_code=400, detail="Missing required sections ('goals', 'goal_logs') in import payload")

    imported_counts = {"categories": 0, "goals": 0, "logs": 0}

    # Import categories
    if "categories" in data:
        for c in data["categories"]:
            existing = db.query(Category).filter(Category.name == c["name"]).first()
            if not existing:
                db_cat = Category(
                    name=c["name"],
                    icon=c.get("icon", "folder"),
                    color=c.get("color", "#3B82F6"),
                    is_default=c.get("is_default", False)
                )
                db.add(db_cat)
                imported_counts["categories"] += 1
        db.commit()

    # Import goals
    for g in data["goals"]:
        existing_g = db.query(Goal).filter(Goal.name == g["name"]).first()
        if not existing_g:
            cat_id = None
            if "category_id" in g and g["category_id"]:
                cat_id = g["category_id"]

            db_g = Goal(
                name=g["name"],
                category_id=cat_id,
                type=g.get("type", "habit"),
                frequency=g.get("frequency", "daily"),
                target_value=g.get("target_value", 1.0),
                unit=g.get("unit", "hours"),
                goal_direction=g.get("goal_direction", "higher_is_better"),
                is_active=g.get("is_active", True)
            )
            db.add(db_g)
            imported_counts["goals"] += 1
    db.commit()

    # Import logs
    for l in data["goal_logs"]:
        l_date = date.fromisoformat(l["log_date"])
        g_id = l["goal_id"]
        
        # Verify goal exists
        g_obj = db.query(Goal).filter(Goal.id == g_id).first()
        if not g_obj:
            continue

        existing_l = db.query(GoalLog).filter(GoalLog.goal_id == g_id, GoalLog.log_date == l_date).first()
        if not existing_l:
            db_l = GoalLog(
                goal_id=g_id,
                log_date=l_date,
                target_value=l.get("target_value", 1.0),
                actual_value=l.get("actual_value", 0.0),
                status=l.get("status", "missed"),
                notes=l.get("notes"),
                achievement_pct=l.get("achievement_pct", 0.0)
            )
            db.add(db_l)
            imported_counts["logs"] += 1
    db.commit()

    return {
        "message": "Data successfully imported",
        "imported_counts": imported_counts
    }
