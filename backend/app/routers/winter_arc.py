import calendar
from datetime import date, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import GoalLog, Goal, Setting
from app.schemas import WinterArcResponse

router = APIRouter(prefix="/api/winter-arc", tags=["Winter Arc"])

@router.get("", response_model=WinterArcResponse)
def get_winter_arc_summary(year: Optional[int] = None, db: Session = Depends(get_db)):
    today = date.today()
    target_year = year if year else today.year

    start_d = date(target_year, 10, 1)
    end_d = date(target_year, 12, 31)

    total_days = (end_d - start_d).days + 1

    if today < start_d:
        status = "upcoming"
        is_active_now = False
        is_completed = False
        days_until_start = (start_d - today).days
        days_elapsed = 0
        days_remaining = total_days
        overall_progress_pct = 0.0
    elif today > end_d:
        status = "completed"
        is_active_now = False
        is_completed = True
        days_until_start = 0
        days_elapsed = total_days
        days_remaining = 0
        overall_progress_pct = 100.0
    else:
        status = "active"
        is_active_now = True
        is_completed = False
        days_until_start = 0
        days_elapsed = (today - start_d).days + 1
        days_remaining = (end_d - today).days
        overall_progress_pct = round((days_elapsed / total_days) * 100.0, 1) if total_days > 0 else 100.0

    # Query all logs within Winter Arc range for target year
    logs = db.query(GoalLog).filter(GoalLog.log_date >= start_d, GoalLog.log_date <= end_d).all()

    planned_hours = 0.0
    actual_hours = 0.0
    achievements = []
    days_with_logs = set()
    consistent_days = set()

    habit_achievements: Dict[int, list] = {}
    month_achievements: Dict[int, list] = {}

    for l in logs:
        g = l.goal
        if g and g.unit and "hour" in g.unit.lower():
            planned_hours += l.target_value
            actual_hours += l.actual_value
        elif g and g.unit and "min" in g.unit.lower():
            planned_hours += l.target_value / 60.0
            actual_hours += l.actual_value / 60.0
        else:
            planned_hours += l.target_value
            actual_hours += l.actual_value

        achievements.append(l.achievement_pct)
        days_with_logs.add(l.log_date)

        if l.achievement_pct >= 80.0:
            consistent_days.add(l.log_date)

        if l.goal_id:
            habit_achievements.setdefault(l.goal_id, []).append(l.achievement_pct)

        month_achievements.setdefault(l.log_date.month, []).append(l.achievement_pct)

    achievement_pct = round(sum(achievements) / len(achievements), 1) if achievements else 0.0
    consistency_pct = round((len(consistent_days) / days_elapsed) * 100.0, 1) if days_elapsed > 0 else 0.0

    # Best Month
    best_month_name = None
    best_m_avg = -1.0
    for m_num, pcts in month_achievements.items():
        avg = sum(pcts) / len(pcts)
        if avg > best_m_avg:
            best_m_avg = avg
            best_month_name = calendar.month_name[m_num]

    # Best Habit
    best_habit_name = None
    best_h_avg = -1.0
    for g_id, pcts in habit_achievements.items():
        avg = sum(pcts) / len(pcts)
        if avg > best_h_avg:
            best_h_avg = avg
            g_obj = db.query(Goal).filter(Goal.id == g_id).first()
            if g_obj:
                best_habit_name = g_obj.name

    # Most Improved Habit
    most_improved_name = None
    max_improvement = -999.0

    for g_id, pcts in habit_achievements.items():
        if len(pcts) >= 4:
            mid = len(pcts) // 2
            first_half = sum(pcts[:mid]) / mid
            second_half = sum(pcts[mid:]) / (len(pcts) - mid)
            improvement = second_half - first_half
            if improvement > max_improvement:
                max_improvement = improvement
                g_obj = db.query(Goal).filter(Goal.id == g_id).first()
                if g_obj:
                    most_improved_name = g_obj.name

    return WinterArcResponse(
        year=target_year,
        start_date=start_d,
        end_date=end_d,
        total_days=total_days,
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        days_until_start=days_until_start,
        status=status,
        is_active_now=is_active_now,
        overall_progress_pct=overall_progress_pct,
        planned_hours=round(planned_hours, 1),
        actual_hours=round(actual_hours, 1),
        achievement_pct=achievement_pct,
        consistency_pct=consistency_pct,
        best_month=best_month_name or "N/A",
        best_habit=best_habit_name or "N/A",
        most_improved_habit=most_improved_name or (best_habit_name or "N/A"),
        is_completed=is_completed
    )

