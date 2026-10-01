from datetime import date, timedelta
from typing import List, Dict, Any, Optional

def calculate_achievement(target: float, actual: float, goal_direction: str = "higher_is_better", status: Optional[str] = None) -> float:
    """
    Centralized achievement calculation.
    If status is explicitly 'missed', achievement is always 0.0%.
    """
    if status == "missed":
        return 0.0

    target = float(target)
    actual = float(actual)
    
    if goal_direction == "lower_is_better":
        # If user did 0 but marked it missed, it's 0%
        if status == "missed":
            return 0.0
        if actual <= target:
            return 100.0
        if actual <= 0:
            return 100.0
        return round((target / actual) * 100.0, 2)
    else:
        if target <= 0:
            return 100.0 if actual >= 0 else 0.0
        return round((actual / target) * 100.0, 2)


def determine_status(achievement_pct: float, actual_val: float = 0.0) -> str:
    """
    Determine completion status based on achievement percentage.
    """
    if achievement_pct >= 99.99:
        return "complete"
    elif achievement_pct > 0.0:
        return "partial"
    else:
        return "missed"


def calculate_streak(logs_by_date: Dict[date, float], target_pct: float = 80.0) -> Dict[str, int]:
    """
    Calculate current streak and best streak based on consecutive days meeting or exceeding target_pct.
    logs_by_date: dict mapping date to overall average achievement percentage for that day.
    """
    if not logs_by_date:
        return {"current_streak": 0, "best_streak": 0}

    sorted_dates = sorted(logs_by_date.keys())
    
    best_streak = 0
    current_temp = 0
    
    for d in sorted_dates:
        if logs_by_date[d] >= target_pct:
            current_temp += 1
            if current_temp > best_streak:
                best_streak = current_temp
        else:
            current_temp = 0

    # Calculate current active streak ending today or yesterday
    today = date.today()
    current_streak = 0
    check_date = today
    
    # If today hasn't logged yet or is below target, check starting from yesterday
    if check_date in logs_by_date and logs_by_date[check_date] >= target_pct:
        pass
    else:
        check_date = today - timedelta(days=1)

    while check_date in logs_by_date and logs_by_date[check_date] >= target_pct:
        current_streak += 1
        check_date -= timedelta(days=1)
        
    return {
        "current_streak": current_streak,
        "best_streak": max(best_streak, current_streak)
    }


def is_goal_active_on_date(goal, d: date) -> bool:
    """
    Check if a goal/habit was active on a specific calendar date d.
    If the habit was created after d (or has start_date > d), it was NOT active.
    If the habit has an end_date and d > end_date, it is no longer active.
    """
    if hasattr(goal, "is_active") and not goal.is_active:
        return False
    start_d = getattr(goal, "start_date", None)
    if not start_d and hasattr(goal, "created_at") and goal.created_at:
        start_d = goal.created_at.date()
    if start_d and d < start_d:
        return False
    end_d = getattr(goal, "end_date", None)
    if end_d and d > end_d:
        return False
    return True
