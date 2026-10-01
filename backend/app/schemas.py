from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = "folder"
    color: Optional[str] = "#3B82F6"

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Goal / Habit Schemas
class GoalBase(BaseModel):
    name: str
    category_id: Optional[int] = None
    type: str = "habit"  # habit or goal
    frequency: str = "daily"  # daily, weekly, custom
    target_value: float = 1.0
    current_value: Optional[float] = 0.0
    unit: str = "hours"
    goal_direction: str = "higher_is_better"  # higher_is_better or lower_is_better
    status: Optional[str] = "in_progress"  # in_progress, achieved, paused
    linked_habit_ids: Optional[str] = ""
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def empty_date_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    type: Optional[str] = None
    frequency: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    goal_direction: Optional[str] = None
    status: Optional[str] = None
    linked_habit_ids: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def empty_date_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v

class GoalResponse(GoalBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

# Goal Log Schemas
class GoalLogBase(BaseModel):
    goal_id: int
    log_date: date
    target_value: float
    actual_value: float
    status: Optional[str] = None
    notes: Optional[str] = None

class GoalLogCreate(GoalLogBase):
    pass

class GoalLogBatchItem(BaseModel):
    goal_id: int
    actual_value: float
    target_value: Optional[float] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class GoalLogBatchCreate(BaseModel):
    log_date: date
    logs: List[GoalLogBatchItem]

class GoalLogResponse(GoalLogBase):
    id: int
    achievement_pct: float
    created_at: datetime
    updated_at: datetime
    goal: Optional[GoalResponse] = None

    class Config:
        from_attributes = True

# Daily Record Schemas
class DailyRecordResponse(BaseModel):
    id: int
    record_date: date
    total_planned_hours: float
    total_actual_hours: float
    overall_completion_pct: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Setting Schemas
class SettingUpdate(BaseModel):
    value: str

class SettingResponse(BaseModel):
    id: int
    key: str
    value: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

# Dashboard Response Schema
class DashboardStats(BaseModel):
    current_date: date
    current_streak: int
    best_streak: int
    today_planned: float
    today_actual: float
    today_completion_pct: float
    week_completion_pct: float
    month_completion_pct: float
    monthly_average_pct: float
    total_planned_hours: float
    total_actual_hours: float
    overall_winter_arc_pct: float
    today_plan_count: int
    today_completed_count: int
    planned_vs_actual: Dict[str, Any]
    winter_arc_year: int = 2026
    winter_arc_active: bool = False
    winter_arc_status: str = "upcoming"
    winter_arc_days_left: int = 0

# Analytics Schemas
class PlannedVsActualItem(BaseModel):
    label: str
    target: float
    actual: float
    difference: float
    achievement_pct: float

class CategoryPerformanceItem(BaseModel):
    category_id: Optional[int]
    category_name: str
    color: str
    total_goals: int
    avg_achievement_pct: float

class MonthlySummaryItem(BaseModel):
    month_key: str
    month_name: str
    year: int
    planned: float
    actual: float
    achievement_pct: float
    completed_goals: int
    missed_goals: int
    avg_daily_completion: float

class CalendarHeatmapItem(BaseModel):
    date: str
    planned: float
    actual: float
    achievement_pct: float
    status_count: Dict[str, int]

# Winter Arc Schema
class WinterArcResponse(BaseModel):
    year: int
    start_date: date
    end_date: date
    total_days: int
    days_elapsed: int
    days_remaining: int
    days_until_start: int
    status: str  # "active", "upcoming", "completed"
    is_active_now: bool
    overall_progress_pct: float
    planned_hours: float
    actual_hours: float
    achievement_pct: float
    consistency_pct: float
    best_month: Optional[str] = None
    best_habit: Optional[str] = None
    most_improved_habit: Optional[str] = None
    is_completed: bool

# Period Comparison Schema
class MetricComparison(BaseModel):
    metric_name: str
    previous_value: float
    current_value: float
    change_pct: float
    unit: str

class PeriodComparisonResponse(BaseModel):
    period_previous_name: str
    period_current_name: str
    metrics: List[MetricComparison]

# Export / Import Schema
class ExportData(BaseModel):
    version: str = "1.0"
    exported_at: datetime
    categories: List[Dict[str, Any]]
    goals: List[Dict[str, Any]]
    goal_logs: List[Dict[str, Any]]
    daily_records: List[Dict[str, Any]]
    settings: List[Dict[str, Any]]
