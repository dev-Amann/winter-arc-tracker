from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Goal
from app.schemas import GoalCreate, GoalUpdate, GoalResponse

router = APIRouter(prefix="/api/habits", tags=["Habits"])

@router.get("", response_model=List[GoalResponse])
def get_habits(
    is_active: Optional[bool] = None,
    frequency: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Goal).filter(Goal.type == "habit")
    if is_active is not None:
        query = query.filter(Goal.is_active == is_active)
    if frequency is not None:
        query = query.filter(Goal.frequency == frequency)
    return query.order_by(Goal.created_at.asc()).all()

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_habit(habit: GoalCreate, db: Session = Depends(get_db)):
    from datetime import date
    habit.type = "habit"
    start_d = habit.start_date or date.today()
    db_habit = Goal(
        name=habit.name,
        category_id=habit.category_id,
        type="habit",
        frequency=habit.frequency,
        target_value=habit.target_value,
        current_value=habit.current_value or 0.0,
        unit=habit.unit,
        goal_direction=habit.goal_direction,
        status=habit.status or "in_progress",
        linked_habit_ids=habit.linked_habit_ids or "",
        description=habit.description,
        start_date=start_d,
        end_date=habit.end_date,
        is_active=habit.is_active
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit
