import calendar
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import GoalLog, Goal, Category, DailyRecord
from app.schemas import (
    PlannedVsActualItem, CategoryPerformanceItem,
    MonthlySummaryItem, CalendarHeatmapItem,
    PeriodComparisonResponse, MetricComparison
)
from app.calculations import is_goal_active_on_date

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/planned-vs-actual", response_model=List[PlannedVsActualItem])
def get_planned_vs_actual(
    time_frame: str = Query("month", description="day, week, month, quarter, year, custom"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    today = date.today()
    if time_frame == "day":
        s_date = e_date = today
    elif time_frame == "week":
        s_date = today - timedelta(days=6)
        e_date = today
    elif time_frame == "month":
        s_date = date(today.year, today.month, 1)
        e_date = today
    elif time_frame == "quarter":
        quarter = (today.month - 1) // 3 + 1
        s_date = date(today.year, (quarter - 1) * 3 + 1, 1)
        e_date = today
    elif time_frame == "year":
        s_date = date(today.year, 1, 1)
        e_date = today
    elif time_frame == "custom" and start_date and end_date:
        s_date = start_date
        e_date = end_date
    else:
        s_date = date(today.year, today.month, 1)
        e_date = today

    logs = db.query(GoalLog).filter(GoalLog.log_date >= s_date, GoalLog.log_date <= e_date).all()
    logs = [l for l in logs if l.goal and is_goal_active_on_date(l.goal, l.log_date)]
    
    goal_stats: Dict[int, Dict[str, Any]] = {}
    
    for l in logs:
        g = l.goal
        if not g:
            continue
        if g.id not in goal_stats:
            goal_stats[g.id] = {
                "label": g.name,
                "target": 0.0,
                "actual": 0.0,
                "goal_direction": g.goal_direction
            }
        goal_stats[g.id]["target"] += l.target_value
        goal_stats[g.id]["actual"] += l.actual_value

    result = []
    for g_id, data in goal_stats.items():
        diff = round(data["actual"] - data["target"], 2)
        if data["goal_direction"] == "lower_is_better":
            ach_pct = 100.0 if data["actual"] <= data["target"] else round((data["target"] / data["actual"]) * 100.0, 2)
        else:
            ach_pct = round((data["actual"] / data["target"]) * 100.0, 2) if data["target"] > 0 else 0.0

        result.append(PlannedVsActualItem(
            label=data["label"],
            target=round(data["target"], 2),
            actual=round(data["actual"], 2),
            difference=diff,
            achievement_pct=ach_pct
        ))

    return result

@router.get("/monthly", response_model=List[MonthlySummaryItem])
def get_monthly_analytics(year: Optional[int] = None, db: Session = Depends(get_db)):
    target_year = year or date.today().year
    
    logs = db.query(GoalLog).filter(
        GoalLog.log_date >= date(target_year, 1, 1),
        GoalLog.log_date <= date(target_year, 12, 31)
    ).all()
    logs = [l for l in logs if l.goal and is_goal_active_on_date(l.goal, l.log_date)]

    month_data = {m: {"planned": 0.0, "actual": 0.0, "completed": 0, "missed": 0, "daily_pcts": {}} for m in range(1, 13)}

    for l in logs:
        m = l.log_date.month
        month_data[m]["planned"] += l.target_value
        month_data[m]["actual"] += l.actual_value
        if l.status == "complete":
            month_data[m]["completed"] += 1
        elif l.status == "missed":
            month_data[m]["missed"] += 1

        month_data[m]["daily_pcts"].setdefault(l.log_date, []).append(l.achievement_pct)

    summaries = []
    for m in range(1, 13):
        m_name = calendar.month_name[m]
        p = round(month_data[m]["planned"], 2)
        a = round(month_data[m]["actual"], 2)
        ach = round((a / p) * 100.0, 2) if p > 0 else 0.0
        
        daily_averages = [
            sum(pcts) / len(pcts) for pcts in month_data[m]["daily_pcts"].values()
        ]
        avg_daily = round(sum(daily_averages) / len(daily_averages), 2) if daily_averages else 0.0

        summaries.append(MonthlySummaryItem(
            month_key=f"{target_year}-{m:02d}",
            month_name=m_name,
            year=target_year,
            planned=p,
            actual=a,
            achievement_pct=ach,
            completed_goals=month_data[m]["completed"],
            missed_goals=month_data[m]["missed"],
            avg_daily_completion=avg_daily
        ))

    return summaries

@router.get("/yearly")
def get_yearly_overview(year: Optional[int] = None, db: Session = Depends(get_db)):
    target_year = year or date.today().year
    monthly = get_monthly_analytics(target_year, db)

    total_planned = sum(m.planned for m in monthly)
    total_actual = sum(m.actual for m in monthly)
    overall_ach = round((total_actual / total_planned) * 100.0, 2) if total_planned > 0 else 0.0
    
    return {
        "year": target_year,
        "total_planned": round(total_planned, 2),
        "total_actual": round(total_actual, 2),
        "overall_achievement_pct": overall_ach,
        "monthly_breakdown": monthly
    }

@router.get("/categories", response_model=List[CategoryPerformanceItem])
def get_category_performance(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    logs = db.query(GoalLog).all()

    cat_stats: Dict[Optional[int], Dict[str, Any]] = {}
    for cat in categories:
        cat_stats[cat.id] = {
            "name": cat.name,
            "color": cat.color,
            "goals": set(),
            "achievements": []
        }
    cat_stats[None] = {"name": "Uncategorized", "color": "#9CA3AF", "goals": set(), "achievements": []}

    for l in logs:
        g = l.goal
        if not g:
            continue
        c_id = g.category_id
        if c_id not in cat_stats:
            c_id = None
        cat_stats[c_id]["goals"].add(g.id)
        cat_stats[c_id]["achievements"].append(l.achievement_pct)

    results = []
    for c_id, stats in cat_stats.items():
        if not stats["goals"] and not stats["achievements"]:
            continue
        avg_ach = round(sum(stats["achievements"]) / len(stats["achievements"]), 2) if stats["achievements"] else 0.0
        results.append(CategoryPerformanceItem(
            category_id=c_id,
            category_name=stats["name"],
            color=stats["color"],
            total_goals=len(stats["goals"]),
            avg_achievement_pct=avg_ach
        ))

    return results

@router.get("/heatmap", response_model=List[CalendarHeatmapItem])
def get_calendar_heatmap(
    goal_id: Optional[int] = None,
    category_id: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    target_year = year or date.today().year
    s_date = date(target_year, 1, 1)
    e_date = date(target_year, 12, 31)

    query = db.query(GoalLog).filter(GoalLog.log_date >= s_date, GoalLog.log_date <= e_date)
    if goal_id:
        query = query.filter(GoalLog.goal_id == goal_id)
    
    logs = query.all()
    logs = [l for l in logs if l.goal and is_goal_active_on_date(l.goal, l.log_date)]
    
    if category_id:
        logs = [l for l in logs if l.goal and l.goal.category_id == category_id]

    by_date: Dict[date, Dict[str, Any]] = {}
    for l in logs:
        d = l.log_date
        if d not in by_date:
            by_date[d] = {
                "planned": 0.0,
                "actual": 0.0,
                "achievements": [],
                "statuses": {"complete": 0, "partial": 0, "missed": 0}
            }
        by_date[d]["planned"] += l.target_value
        by_date[d]["actual"] += l.actual_value
        by_date[d]["achievements"].append(l.achievement_pct)
        if l.status in by_date[d]["statuses"]:
            by_date[d]["statuses"][l.status] += 1

    heatmap = []
    for d, data in sorted(by_date.items()):
        avg_ach = round(sum(data["achievements"]) / len(data["achievements"]), 2) if data["achievements"] else 0.0
        heatmap.append(CalendarHeatmapItem(
            date=d.isoformat(),
            planned=round(data["planned"], 2),
            actual=round(data["actual"], 2),
            achievement_pct=avg_ach,
            status_count=data["statuses"]
        ))

    return heatmap

@router.get("/comparison", response_model=PeriodComparisonResponse)
def get_period_comparison(
    period_type: str = Query("month", description="month, quarter, custom"),
    p1_start: Optional[date] = None,
    p1_end: Optional[date] = None,
    p2_start: Optional[date] = None,
    p2_end: Optional[date] = None,
    db: Session = Depends(get_db)
):
    today = date.today()
    if period_type == "month":
        # Current month vs Previous month
        p2_start = date(today.year, today.month, 1)
        p2_end = today
        prev_m = 12 if today.month == 1 else today.month - 1
        prev_y = today.year - 1 if today.month == 1 else today.year
        _, last_day = calendar.monthrange(prev_y, prev_m)
        p1_start = date(prev_y, prev_m, 1)
        p1_end = date(prev_y, prev_m, min(today.day, last_day))
        name1 = calendar.month_name[prev_m]
        name2 = calendar.month_name[today.month]
    else:
        name1 = "Period 1"
        name2 = "Period 2"

    logs1 = db.query(GoalLog).filter(GoalLog.log_date >= p1_start, GoalLog.log_date <= p1_end).all() if p1_start and p1_end else []
    logs2 = db.query(GoalLog).filter(GoalLog.log_date >= p2_start, GoalLog.log_date <= p2_end).all() if p2_start and p2_end else []

    def calc_metrics(log_list):
        total_p = sum(l.target_value for l in log_list)
        total_a = sum(l.actual_value for l in log_list)
        avg_ach = sum(l.achievement_pct for l in log_list) / len(log_list) if log_list else 0.0
        return total_p, total_a, avg_ach

    p1_p, p1_a, p1_ach = calc_metrics(logs1)
    p2_p, p2_a, p2_ach = calc_metrics(logs2)

    def change_pct(old, new):
        if old == 0:
            return 100.0 if new > 0 else 0.0
        return round(((new - old) / old) * 100.0, 1)

    metrics = [
        MetricComparison(
            metric_name="Total Planned",
            previous_value=round(p1_p, 1),
            current_value=round(p2_p, 1),
            change_pct=change_pct(p1_p, p2_p),
            unit="units"
        ),
        MetricComparison(
            metric_name="Total Actual",
            previous_value=round(p1_a, 1),
            current_value=round(p2_a, 1),
            change_pct=change_pct(p1_a, p2_a),
            unit="units"
        ),
        MetricComparison(
            metric_name="Average Achievement",
            previous_value=round(p1_ach, 1),
            current_value=round(p2_ach, 1),
            change_pct=change_pct(p1_ach, p2_ach),
            unit="%"
        )
    ]

    return PeriodComparisonResponse(
        period_previous_name=name1,
        period_current_name=name2,
        metrics=metrics
    )
