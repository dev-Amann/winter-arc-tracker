from datetime import date, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import GoalLog, Goal, DailyRecord, Setting
from app.schemas import DashboardStats
from app.calculations import calculate_streak
from app.routers.goals import seed_sample_goals_if_empty

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardStats)
def get_dashboard_summary(db: Session = Depends(get_db)):
    seed_sample_goals_if_empty(db)
    today = date.today()
    
    # 1. Today's logs & plan
    today_logs = db.query(GoalLog).filter(GoalLog.log_date == today).all()
    active_goals = db.query(Goal).filter(Goal.is_active == True).all()

    today_plan_count = len(active_goals)
    today_completed_count = sum(1 for l in today_logs if l.status == "complete")

    today_achievements = [l.achievement_pct for l in today_logs]
    today_completion_pct = round(sum(today_achievements) / len(today_achievements), 1) if today_achievements else 0.0

    today_planned_hours = 0.0
    today_actual_hours = 0.0

    for g in active_goals:
        if g.unit and "hour" in g.unit.lower():
            today_planned_hours += g.target_value
        elif g.unit and "min" in g.unit.lower():
            today_planned_hours += g.target_value / 60.0

    for l in today_logs:
        g = l.goal
        if g and g.unit and "hour" in g.unit.lower():
            today_actual_hours += l.actual_value
        elif g and g.unit and "min" in g.unit.lower():
            today_actual_hours += l.actual_value / 60.0

    # 2. Streak calculations (all daily averages)
    all_logs = db.query(GoalLog).all()
    logs_by_date: Dict[date, list] = {}
    for l in all_logs:
        logs_by_date.setdefault(l.log_date, []).append(l.achievement_pct)

    daily_avg_by_date: Dict[date, float] = {
        d: sum(pcts) / len(pcts) for d, pcts in logs_by_date.items()
    }

    streak_info = calculate_streak(daily_avg_by_date, target_pct=80.0)

    # 3. Week completion % (last 7 days)
    start_week = today - timedelta(days=6)
    week_pcts = [daily_avg_by_date.get(start_week + timedelta(days=i), 0.0) for i in range(7) if (start_week + timedelta(days=i)) in daily_avg_by_date]
    week_completion_pct = round(sum(week_pcts) / len(week_pcts), 1) if week_pcts else 0.0

    # 4. Month completion % (current month)
    start_month = date(today.year, today.month, 1)
    month_pcts = [pct for d, pct in daily_avg_by_date.items() if d.year == today.year and d.month == today.month]
    month_completion_pct = round(sum(month_pcts) / len(month_pcts), 1) if month_pcts else 0.0

    # 5. Monthly average % (all logged months)
    all_pcts = list(daily_avg_by_date.values())
    monthly_average_pct = round(sum(all_pcts) / len(all_pcts), 1) if all_pcts else 0.0

    # 6. Overall Total Planned & Actual Hours across all history
    total_planned_hours = 0.0
    total_actual_hours = 0.0

    for l in all_logs:
        g = l.goal
        if g and g.unit and "hour" in g.unit.lower():
            total_planned_hours += l.target_value
            total_actual_hours += l.actual_value
        elif g and g.unit and "min" in g.unit.lower():
            total_planned_hours += l.target_value / 60.0
            total_actual_hours += l.actual_value / 60.0

    # 7. Winter Arc 2026 progress
    # Default Winter Arc: Oct 1, 2026 to Dec 31, 2026
    wa_start_setting = db.query(Setting).filter(Setting.key == "winter_arc_start").first()
    wa_end_setting = db.query(Setting).filter(Setting.key == "winter_arc_end").first()

    wa_start = date.fromisoformat(wa_start_setting.value) if wa_start_setting and wa_start_setting.value else date(2026, 10, 1)
    wa_end = date.fromisoformat(wa_end_setting.value) if wa_end_setting and wa_end_setting.value else date(2026, 12, 31)

    wa_pcts = [pct for d, pct in daily_avg_by_date.items() if wa_start <= d <= wa_end]
    overall_winter_arc_pct = round(sum(wa_pcts) / len(wa_pcts), 1) if wa_pcts else 0.0

    overall_ach_pct = round((total_actual_hours / total_planned_hours) * 100.0, 1) if total_planned_hours > 0 else 0.0

    return DashboardStats(
        current_date=today,
        current_streak=streak_info["current_streak"],
        best_streak=streak_info["best_streak"],
        today_planned=round(today_planned_hours, 1),
        today_actual=round(today_actual_hours, 1),
        today_completion_pct=today_completion_pct,
        week_completion_pct=week_completion_pct,
        month_completion_pct=month_completion_pct,
        monthly_average_pct=monthly_average_pct,
        total_planned_hours=round(total_planned_hours, 1),
        total_actual_hours=round(total_actual_hours, 1),
        overall_winter_arc_pct=overall_winter_arc_pct,
        today_plan_count=today_plan_count,
        today_completed_count=today_completed_count,
        planned_vs_actual={
            "planned_hours": round(total_planned_hours, 1),
            "actual_hours": round(total_actual_hours, 1),
            "achievement_pct": overall_ach_pct,
            "difference_hours": round(total_actual_hours - total_planned_hours, 1)
        }
    )
