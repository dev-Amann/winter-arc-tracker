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
    habit.type = "habit"
    db_habit = Goal(
        name=habit.name,
        category_id=habit.category_id,
        type="habit",
        frequency=habit.frequency,
        target_value=habit.target_value,
        unit=habit.unit,
        goal_direction=habit.goal_direction,
        start_date=habit.start_date,
        end_date=habit.end_date,
        is_active=habit.is_active
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit
