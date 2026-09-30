from datetime import date, timedelta
from typing import List, Dict, Any, Optional

def calculate_achievement(target: float, actual: float, goal_direction: str = "higher_is_better") -> float:
    """
    Centralized achievement calculation.
    
    Higher is better:
        - Target = 2h, Actual = 1.5h -> 75%
        - Target = 2h, Actual = 3.0h -> 150%
    
    Lower is better:
        - Target = 60m (max), Actual = 45m -> 100%
        - Target = 60m (max), Actual = 90m -> (60 / 90) * 100 = 66.67%
    """
    target = float(target)
    actual = float(actual)
    
    if goal_direction == "lower_is_better":
        if actual <= target:
            return 100.0
        if actual <= 0:
            return 100.0
        return round((target / actual) * 100.0, 2)
    else:
        if target <= 0:
            return 100.0 if actual >= 0 else 0.0
        return round((actual / target) * 100.0, 2)


def determine_status(achievement_pct: float) -> str:
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
