from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    daily_records = relationship("DailyRecord", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("Setting", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(50), nullable=False)
    icon = Column(String(50), default="folder")
    color = Column(String(20), default="#3B82F6")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="categories")
    goals = relationship("Goal", back_populates="category")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), default="habit")  # habit or goal
    frequency = Column(String(20), default="daily")  # daily, weekly, custom
    target_value = Column(Float, nullable=False, default=1.0)
    unit = Column(String(30), default="hours")  # hours, problems, sessions, minutes, pages, etc.
    goal_direction = Column(String(20), default="higher_is_better")  # higher_is_better or lower_is_better
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    current_value = Column(Float, nullable=True, default=0.0)
    status = Column(String(30), nullable=True, default="in_progress")  # in_progress, achieved, paused
    linked_habit_ids = Column(String(255), nullable=True, default="")  # comma-separated habit IDs
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="goals")
    category = relationship("Category", back_populates="goals")
    logs = relationship("GoalLog", back_populates="goal", cascade="all, delete-orphan")


class GoalLog(Base):
    __tablename__ = "goal_logs"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True)
    log_date = Column(Date, nullable=False, index=True)
    target_value = Column(Float, nullable=False)
    actual_value = Column(Float, nullable=False)
    status = Column(String(20), default="missed")  # complete, partial, missed
    notes = Column(Text, nullable=True)
    achievement_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    goal = relationship("Goal", back_populates="logs")

    __table_args__ = (
        Index("idx_goal_date", "goal_id", "log_date", unique=True),
    )


class DailyRecord(Base):
    __tablename__ = "daily_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    record_date = Column(Date, nullable=False, index=True)
    total_planned_hours = Column(Float, default=0.0)
    total_actual_hours = Column(Float, default=0.0)
    overall_completion_pct = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="daily_records")

    __table_args__ = (
        Index("idx_user_date", "user_id", "record_date", unique=True),
    )


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    key = Column(String(50), nullable=False)
    value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="settings")

    __table_args__ = (
        Index("idx_user_key", "user_id", "key", unique=True),
    )
