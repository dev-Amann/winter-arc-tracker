from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import GoalLog, Goal, DailyRecord
from app.schemas import GoalLogCreate, GoalLogBatchCreate, GoalLogResponse
from app.calculations import calculate_achievement, determine_status

router = APIRouter(prefix="/api/logs", tags=["Goal Logs"])

def update_daily_record_summary(db: Session, log_date: date):
    """
    Recalculates total planned hours, total actual hours, and overall completion % for log_date.
    """
    logs = db.query(GoalLog).filter(GoalLog.log_date == log_date).all()
    if not logs:
        dr = db.query(DailyRecord).filter(DailyRecord.record_date == log_date).first()
        if dr:
            db.delete(dr)
            db.commit()
        return

    total_planned = 0.0
    total_actual = 0.0
    achievements = []

    for log in logs:
        achievements.append(log.achievement_pct)
        # Sum hours if unit is hours/minutes
        g = log.goal
        if g:
            if g.unit and "hour" in g.unit.lower():
                total_planned += log.target_value
                total_actual += log.actual_value
            elif g.unit and "min" in g.unit.lower():
                total_planned += log.target_value / 60.0
                total_actual += log.actual_value / 60.0

    avg_completion = sum(achievements) / len(achievements) if achievements else 0.0

    dr = db.query(DailyRecord).filter(DailyRecord.record_date == log_date).first()
    if not dr:
        dr = DailyRecord(
            record_date=log_date,
            total_planned_hours=round(total_planned, 2),
            total_actual_hours=round(total_actual, 2),
            overall_completion_pct=round(avg_completion, 2)
        )
        db.add(dr)
    else:
        dr.total_planned_hours = round(total_planned, 2)
        dr.total_actual_hours = round(total_actual, 2)
        dr.overall_completion_pct = round(avg_completion, 2)

    db.commit()

@router.get("", response_model=List[GoalLogResponse])
def get_logs(
    log_date: Optional[date] = None,
    goal_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(GoalLog)
    if log_date:
        query = query.filter(GoalLog.log_date == log_date)
    if goal_id:
        query = query.filter(GoalLog.goal_id == goal_id)
    if start_date:
        query = query.filter(GoalLog.log_date >= start_date)
    if end_date:
        query = query.filter(GoalLog.log_date <= end_date)
        
    return query.order_by(GoalLog.log_date.desc()).all()

@router.post("", response_model=GoalLogResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_log(log_input: GoalLogCreate, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == log_input.goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    today = date.today()
    if log_input.log_date > today and (log_input.status in ("complete", "partial") or (log_input.actual_value and log_input.actual_value > 0)):
        raise HTTPException(status_code=400, detail="Cannot mark future dates as completed or partial. Performance can only be recorded on or before today.")

    target_val = log_input.target_value if log_input.target_value is not None else goal.target_value
    
    # Consistent status handling: if missed, actual is 0 and achievement is 0
    if log_input.status == "missed" or (log_input.actual_value <= 0 and log_input.status != "complete"):
        actual_val = 0.0
        ach_pct = 0.0
        log_status = "missed"
    elif log_input.status == "complete":
        actual_val = log_input.actual_value if log_input.actual_value > 0 else target_val
        ach_pct = calculate_achievement(target_val, actual_val, goal.goal_direction)
        log_status = "complete"
    else:
        actual_val = log_input.actual_value
        ach_pct = calculate_achievement(target_val, actual_val, goal.goal_direction)
        log_status = log_input.status or determine_status(ach_pct)

    existing_log = db.query(GoalLog).filter(
        GoalLog.goal_id == log_input.goal_id,
        GoalLog.log_date == log_input.log_date
    ).first()

    if existing_log:
        existing_log.target_value = target_val
        existing_log.actual_value = actual_val
        existing_log.status = log_status
        existing_log.notes = log_input.notes
        existing_log.achievement_pct = ach_pct
        db_log = existing_log
    else:
        db_log = GoalLog(
            goal_id=log_input.goal_id,
            log_date=log_input.log_date,
            target_value=target_val,
            actual_value=actual_val,
            status=log_status,
            notes=log_input.notes,
            achievement_pct=ach_pct
        )
        db.add(db_log)

    db.commit()
    db.refresh(db_log)
    update_daily_record_summary(db, log_input.log_date)
    return db_log

@router.post("/batch", response_model=List[GoalLogResponse])
def batch_upsert_logs(batch: GoalLogBatchCreate, db: Session = Depends(get_db)):
    today = date.today()
    if batch.log_date > today:
        for item in batch.logs:
            if item.status in ("complete", "partial") or (item.actual_value and item.actual_value > 0):
                raise HTTPException(status_code=400, detail="Cannot mark future dates as completed or partial. Performance can only be recorded on or before today.")

    updated_logs = []
    for item in batch.logs:
        goal = db.query(Goal).filter(Goal.id == item.goal_id).first()
        if not goal:
            continue

        target_val = item.target_value if item.target_value is not None else goal.target_value
        
        # Consistent status handling: if marked missed or value <= 0
        if item.status == "missed" or (item.actual_value <= 0 and item.status != "complete"):
            actual_val = 0.0
            ach_pct = 0.0
            log_status = "missed"
        elif item.status == "complete":
            actual_val = item.actual_value if item.actual_value > 0 else target_val
            ach_pct = calculate_achievement(target_val, actual_val, goal.goal_direction)
            log_status = "complete"
        else:
            actual_val = item.actual_value
            ach_pct = calculate_achievement(target_val, actual_val, goal.goal_direction)
            log_status = item.status or determine_status(ach_pct)

        existing = db.query(GoalLog).filter(
            GoalLog.goal_id == item.goal_id,
            GoalLog.log_date == batch.log_date
        ).first()

        if existing:
            existing.target_value = target_val
            existing.actual_value = actual_val
            existing.status = log_status
            existing.notes = item.notes
            existing.achievement_pct = ach_pct
            db_log = existing
        else:
            db_log = GoalLog(
                goal_id=item.goal_id,
                log_date=batch.log_date,
                target_value=target_val,
                actual_value=actual_val,
                status=log_status,
                notes=item.notes,
                achievement_pct=ach_pct
            )
            db.add(db_log)

        updated_logs.append(db_log)

    db.commit()
    for l in updated_logs:
        db.refresh(l)

    update_daily_record_summary(db, batch.log_date)
    return updated_logs

@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(GoalLog).filter(GoalLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    log_date = log.log_date
    db.delete(log)
    db.commit()
    update_daily_record_summary(db, log_date)
    return None
