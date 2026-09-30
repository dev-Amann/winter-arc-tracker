from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Goal, Category
from app.schemas import GoalCreate, GoalUpdate, GoalResponse

router = APIRouter(prefix="/api/goals", tags=["Goals"])

DEFAULT_SAMPLE_GOALS = [
    {
        "name": "Coding",
        "category_name": "Coding",
        "type": "habit",
        "frequency": "daily",
        "target_value": 2.0,
        "unit": "hours",
        "goal_direction": "higher_is_better"
    },
    {
        "name": "DSA",
        "category_name": "Education",
        "type": "habit",
        "frequency": "daily",
        "target_value": 5.0,
        "unit": "problems",
        "goal_direction": "higher_is_better"
    },
    {
        "name": "Exercise",
        "category_name": "Fitness",
        "type": "habit",
        "frequency": "weekly",
        "target_value": 5.0,
        "unit": "sessions",
        "goal_direction": "higher_is_better"
    },
    {
        "name": "Read",
        "category_name": "Personal",
        "type": "habit",
        "frequency": "daily",
        "target_value": 20.0,
        "unit": "pages",
        "goal_direction": "higher_is_better"
    },
    {
        "name": "Instagram",
        "category_name": "Productivity",
        "type": "habit",
        "frequency": "daily",
        "target_value": 60.0,
        "unit": "minutes",
        "goal_direction": "lower_is_better"
    }
]

def seed_sample_goals_if_empty(db: Session):
    from app.routers.categories import seed_categories_if_empty
    seed_categories_if_empty(db)
    if db.query(Goal).count() == 0:
        for g_data in DEFAULT_SAMPLE_GOALS:
            cat_name = g_data.get("category_name")
            cat = db.query(Category).filter(Category.name == cat_name).first()
            data = {k: v for k, v in g_data.items() if k != "category_name"}
            goal = Goal(**data, category_id=cat.id if cat else None, is_active=True)
            db.add(goal)
        db.commit()

@router.get("", response_model=List[GoalResponse])
def get_goals(
    is_active: Optional[bool] = None,
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    seed_sample_goals_if_empty(db)
    query = db.query(Goal)
    if is_active is not None:
        query = query.filter(Goal.is_active == is_active)
    if type is not None:
        query = query.filter(Goal.type == type)
    if category_id is not None:
        query = query.filter(Goal.category_id == category_id)
    return query.order_by(Goal.created_at.asc()).all()

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    db_goal = Goal(
        name=goal.name,
        category_id=goal.category_id,
        type=goal.type,
        frequency=goal.frequency,
        target_value=goal.target_value,
        unit=goal.unit,
        goal_direction=goal.goal_direction,
        start_date=goal.start_date,
        end_date=goal.end_date,
        is_active=goal.is_active
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, goal_data: GoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_dict = goal_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(goal, key, value)
        
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return None
