from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Category
from app.schemas import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])

DEFAULT_CATEGORIES = [
    {"name": "Coding", "icon": "code", "color": "#06B6D4", "is_default": True},
    {"name": "Career", "icon": "briefcase", "color": "#3B82F6", "is_default": True},
    {"name": "Education", "icon": "book-open", "color": "#8B5CF6", "is_default": True},
    {"name": "Fitness", "icon": "activity", "color": "#10B981", "is_default": True},
    {"name": "Health", "icon": "heart", "color": "#EC4899", "is_default": True},
    {"name": "Productivity", "icon": "zap", "color": "#F59E0B", "is_default": True},
    {"name": "Finance", "icon": "dollar-sign", "color": "#10B981", "is_default": True},
    {"name": "Personal", "icon": "user", "color": "#6366F1", "is_default": True},
    {"name": "Other", "icon": "folder", "color": "#6B7280", "is_default": True},
]

def seed_categories_if_empty(db: Session):
    if db.query(Category).count() == 0:
        for cat in DEFAULT_CATEGORIES:
            db.add(Category(**cat))
        db.commit()

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    seed_categories_if_empty(db)
    return db.query(Category).order_by(Category.id.asc()).all()

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name.ilike(category.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    db_cat = Category(
        name=category.name,
        icon=category.icon or "folder",
        color=category.color or "#3B82F6",
        is_default=False
    )
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if cat.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete default category")
    db.delete(cat)
    db.commit()
    return None
