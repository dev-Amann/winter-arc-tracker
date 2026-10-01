import React, { useState, useEffect, useMemo } from 'react';
import { 
  getGoals, 
  getLogs, 
  saveLog, 
  getMonthlyReflection, 
  saveMonthlyReflection 
} from '../services/api';
import { 
  Snowflake, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Check, 
  Save, 
  Lock, 
  Moon, 
  Flame, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  MessageSquare,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  ReferenceLine 
} from 'recharts';

const MonthlySheetPage = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1; // 1-12
  const todayDateStr = today.toISOString().split('T')[0];

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonthNum);
  const [goals, setGoals] = useState([]);
  const [logsMap, setLogsMap] = useState({}); // key: `${goalId}_${dateStr}`
  const [sleepMap, setSleepMap] = useState({}); // key: dateStr -> hours
  const [monthLogs, setMonthLogs] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [nameSavedStatus, setNameSavedStatus] = useState(false);
  const [reflections, setReflections] = useState({
    athlete_name: '',
    goal: '',
    achieved: '',
    improve: ''
  });
  const [loading, setLoading] = useState(true);
  const [savingReflection, setSavingReflection] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Calculate days in selected month
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1];

  // Load Month Data
  const loadMonthData = async () => {
    try {
      setLoading(true);
      const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const endStr = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      const [goalsRes, logsRes, reflRes] = await Promise.all([
        getGoals({ is_active: true }),
        getLogs({ start_date: startStr, end_date: endStr }),
        getMonthlyReflection(year, month)
      ]);

      // Only include goals active during this selected month
      const activeMonthGoals = goalsRes.filter((g) => {
        const gStart = g.start_date || (g.created_at ? g.created_at.split('T')[0] : null);
        const gEnd = g.end_date || null;
        if (gStart && gStart > endStr) return false;
        if (gEnd && gEnd < startStr) return false;
        return true;
      });

      setGoals(activeMonthGoals);

      const lMap = {};
      const sMap = {};

      logsRes.forEach((l) => {
        const key = `${l.goal_id}_${l.log_date}`;
        lMap[key] = l;

        // Check if this is the sleep habit
        const g = l.goal;
        if (g && g.name && g.name.toLowerCase().includes('sleep')) {
          sMap[l.log_date] = Math.round(l.actual_value);
        }
      });

      setLogsMap(lMap);
      setSleepMap(sMap);
      setMonthLogs(logsRes);
      if (reflRes) {
        setReflections({
          athlete_name: reflRes.athlete_name || 'Aman',
          goal: reflRes.goal || '',
          achieved: reflRes.achieved || '',
          improve: reflRes.improve || ''
        });
      }
    } catch (err) {
      console.error('Failed to load monthly sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthData();
  }, [year, month]);

  // Daily Notes grouped by date across the month
  const dailyNotesList = useMemo(() => {
    const grouped = {};
    monthLogs.forEach((l) => {
      if (l.notes && l.notes.trim()) {
        if (!grouped[l.log_date]) {
          grouped[l.log_date] = [];
        }
        grouped[l.log_date].push(l);
      }
    });

    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([dateStr, entries]) => ({
        dateStr,
        entries
      }));
  }, [monthLogs]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    setYear(currentYear);
    setMonth(currentMonthNum);
  };

  // Cell Click: ONLY allowed for TODAY
  const handleCellClick = async (goal, dayNum) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    
    // Strict Guard: Can only edit TODAY
    if (dateStr !== todayDateStr) {
      if (dateStr > todayDateStr) {
        alert('Future dates are locked and cannot be edited until that day arrives.');
      } else {
        alert('Past dates are historical records and locked from further edits.');
      }
      return;
    }

    const key = `${goal.id}_${dateStr}`;
    const currentLog = logsMap[key];
    const currentStatus = currentLog ? currentLog.status : 'missed';

    // Cycle: missed -> complete -> partial -> missed
    let nextStatus = 'complete';
    let nextVal = goal.target_value;

    if (currentStatus === 'complete') {
      nextStatus = 'partial';
      nextVal = Math.round((goal.target_value / 2) * 10) / 10;
    } else if (currentStatus === 'partial') {
      nextStatus = 'missed';
      nextVal = 0;
    } else {
      nextStatus = 'complete';
      nextVal = goal.target_value;
    }

    try {
      const updatedLog = await saveLog({
        goal_id: goal.id,
        log_date: dateStr,
        target_value: goal.target_value,
        actual_value: nextVal,
        status: nextStatus
      });

      setLogsMap((prev) => ({
        ...prev,
        [key]: updatedLog
      }));

      // Update sleep map if it is sleep
      if (goal.name.toLowerCase().includes('sleep')) {
        setSleepMap((prev) => ({
          ...prev,
          [dateStr]: Math.round(nextVal)
        }));
      }
    } catch (err) {
      console.error('Failed to update log:', err);
      alert(err.response?.data?.detail || 'Failed to save log');
    }
  };

  // Handle Athlete Name Auto-save on blur
  const handleNameBlur = async () => {
    const trimmed = reflections.athlete_name?.trim() || 'Athlete';
    try {
      await saveMonthlyReflection(year, month, { ...reflections, athlete_name: trimmed });
      setNameSavedStatus(true);
      setTimeout(() => setNameSavedStatus(false), 2500);
    } catch (err) {
      console.error('Failed to auto-save athlete name:', err);
    }
  };

  // Selected habit for detailed duration/metric matrix
  const activeMetricHabit = useMemo(() => {
    if (!goals || goals.length === 0) return null;
    if (selectedHabitId) {
      const found = goals.find(g => g.id === selectedHabitId);
      if (found) return found;
    }
    // Default to a habit with 'hour' in unit, or the first habit
    const hourHabit = goals.find(g => g.unit && g.unit.toLowerCase().includes('hour'));
    return hourHabit || goals[0];
  }, [goals, selectedHabitId]);

  // Dynamic levels for the activeMetricHabit
  const metricLevels = useMemo(() => {
    if (!activeMetricHabit) return [10, 9, 8, 7, 6, 5, 4];
    const unit = (activeMetricHabit.unit || '').toLowerCase();
    const target = activeMetricHabit.target_value || 1;

    if (unit.includes('hour')) {
      const maxHr = Math.max(10, Math.ceil(target + 2));
      const minHr = Math.max(1, Math.min(4, Math.floor(target / 2)));
      const lvls = [];
      for (let h = maxHr; h >= minHr; h--) {
        lvls.push(h);
      }
      return lvls;
    } else if (unit.includes('problem') || unit.includes('session') || unit.includes('page') || unit.includes('min')) {
      const maxVal = Math.max(8, Math.ceil(target * 1.5));
      const step = Math.max(1, Math.round(maxVal / 7));
      const lvls = [];
      for (let v = maxVal; v >= 1; v -= step) {
        if (!lvls.includes(v)) lvls.push(v);
      }
      if (!lvls.includes(Math.round(target))) {
        lvls.push(Math.round(target));
        lvls.sort((a, b) => b - a);
      }
      return lvls.slice(0, 8);
    } else {
      const maxVal = Math.max(8, Math.ceil(target * 1.5));
      const lvls = [];
      for (let v = maxVal; v >= 1; v--) {
        lvls.push(v);
      }
      return lvls.slice(0, 8);
    }
  }, [activeMetricHabit]);

  // Metric Click for active habit: ONLY allowed for TODAY
  const handleMetricLevelClick = async (val, dayNum) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    if (dateStr !== todayDateStr) {
      if (dateStr > todayDateStr) {
        alert('Future dates are locked and cannot be edited until that day arrives.');
      } else {
        alert('Past dates are historical records and locked from further edits.');
      }
      return;
    }

    if (!activeMetricHabit) return;

    const aStart = activeMetricHabit.start_date || (activeMetricHabit.created_at ? activeMetricHabit.created_at.split('T')[0] : null);
    const aEnd = activeMetricHabit.end_date || null;
    if (aStart && dateStr < aStart) {
      alert(`This habit was not active on ${dateStr}. It started on ${aStart}.`);
      return;
    }
    if (aEnd && dateStr > aEnd) {
      alert(`This habit is retired. It ended on ${aEnd}.`);
      return;
    }

    try {
      const isComplete = activeMetricHabit.goal_direction === 'lower_is_better' 
        ? val <= activeMetricHabit.target_value 
        : val >= activeMetricHabit.target_value;

      const status = isComplete ? 'complete' : (val > 0 ? 'partial' : 'missed');
      const updated = await saveLog({
        goal_id: activeMetricHabit.id,
        log_date: dateStr,
        target_value: activeMetricHabit.target_value,
        actual_value: val,
        status: status
      });

      setLogsMap((prev) => ({
        ...prev,
        [`${activeMetricHabit.id}_${dateStr}`]: updated
      }));

      // If it is sleep, keep sleepMap updated
      if (activeMetricHabit.name.toLowerCase().includes('sleep')) {
        setSleepMap((prev) => ({
          ...prev,
          [dateStr]: val
        }));
      }
    } catch (err) {
      console.error('Failed to log metric:', err);
    }
  };

  // Save Reflection
  const handleSaveReflections = async () => {
    try {
      setSavingReflection(true);
      await saveMonthlyReflection(year, month, reflections);
      setFeedbackMsg('Monthly reflections saved to database successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save reflection:', err);
      alert('Failed to save reflections');
    } finally {
      setSavingReflection(false);
    }
  };

  const isCurrentMonthView = year === currentYear && month === currentMonthNum;
  const isWinterArcMonth = month >= 10 && month <= 12;

  // Sleep hour rows (10 down to 4)
  const sleepHours = [10, 9, 8, 7, 6, 5, 4];

  // 1. Daily Trendline Data across days 1..daysInMonth
  const dailyTrendData = useMemo(() => {
    return daysArray.map((d) => {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isFuture = dStr > todayDateStr;

      // Only count habits that were active on this specific date
      const activeHabitsOnDay = goals.filter((g) => {
        const start = g.start_date || (g.created_at ? g.created_at.split('T')[0] : null);
        const end = g.end_date || null;
        if (start && dStr < start) return false;
        if (end && dStr > end) return false;
        return true;
      });

      let achPct = 0;
      let plannedHrs = 0;
      let actualHrs = 0;

      if (activeHabitsOnDay.length > 0 && !isFuture) {
        let dayAchSum = 0;
        activeHabitsOnDay.forEach((g) => {
          const l = logsMap[`${g.id}_${dStr}`];
          if (l) {
            dayAchSum += l.achievement_pct || 0;
            if (g.unit && g.unit.toLowerCase().includes('hour')) {
              plannedHrs += l.target_value;
              actualHrs += l.actual_value;
            } else if (g.unit && g.unit.toLowerCase().includes('min')) {
              plannedHrs += l.target_value / 60;
              actualHrs += l.actual_value / 60;
            }
          } else {
            if (g.unit && g.unit.toLowerCase().includes('hour')) {
              plannedHrs += g.target_value;
            }
          }
        });
        achPct = Math.round(dayAchSum / activeHabitsOnDay.length);
      }

      return {
        day: d,
        dayLabel: `Day ${d}`,
        dateStr: dStr,
        achievement: achPct,
        sleep: sleepMap[dStr] || 0,
        planned: Math.round(plannedHrs * 10) / 10,
        actual: Math.round(actualHrs * 10) / 10,
        targetBaseline: 80
      };
    });
  }, [daysArray, logsMap, sleepMap, year, month, goals, todayDateStr]);

  // 2. Habit Comparison Data for the Month
  const habitComparisonData = useMemo(() => {
    return goals.map((g) => {
      let completedDays = 0;
      let partialDays = 0;
      let missedDays = 0;
      let totalActual = 0;
      let totalPlanned = 0;
      let activeDaysCount = 0;

      const gStart = g.start_date || (g.created_at ? g.created_at.split('T')[0] : null);
      const gEnd = g.end_date || null;

      daysArray.forEach((d) => {
        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isBeforeInception = gStart && dStr < gStart;
        const isAfterRetirement = gEnd && dStr > gEnd;
        const isFuture = dStr > todayDateStr;

        if (!isBeforeInception && !isAfterRetirement) {
          activeDaysCount++;
          const log = logsMap[`${g.id}_${dStr}`];
          if (log) {
            if (log.status === 'complete') completedDays++;
            else if (log.status === 'partial') partialDays++;
            else if (log.status === 'missed') missedDays++;
            totalActual += log.actual_value || 0;
            totalPlanned += log.target_value || 0;
          } else if (!isFuture) {
            missedDays++;
            totalPlanned += g.target_value || 0;
          }
        }
      });

      const denominator = activeDaysCount > 0 ? activeDaysCount : 1;
      const successRate = Math.round((completedDays / denominator) * 100);
      return {
        name: g.name,
        completedDays,
        partialDays,
        missedDays,
        activeDaysCount,
        successRate,
        actualTotal: Math.round(totalActual * 10) / 10,
        plannedTotal: Math.round(totalPlanned * 10) / 10,
        color: g.category?.color || '#06B6D4',
        unit: g.unit
      };
    });
  }, [goals, daysArray, logsMap, daysInMonth, year, month, todayDateStr]);

  // 3. Overall Monthly Summary Statistics
  const monthStats = useMemo(() => {
    let totalAch = 0;
    let daysWithLogs = 0;
    let consistentDays = 0;
    let totalActualHrs = 0;
    let totalSleepHrs = 0;
    let sleepDaysCount = 0;

    dailyTrendData.forEach((d) => {
      if (d.achievement > 0) {
        totalAch += d.achievement;
        daysWithLogs++;
      }
      if (d.achievement >= 80) {
        consistentDays++;
      }
      totalActualHrs += d.actual;
      if (d.sleep > 0) {
        totalSleepHrs += d.sleep;
        sleepDaysCount++;
      }
    });

    const avgAch = daysWithLogs > 0 ? Math.round(totalAch / daysWithLogs) : 0;
    const avgSleep = sleepDaysCount > 0 ? (totalSleepHrs / sleepDaysCount).toFixed(1) : 0;

    return {
      avgAch,
      consistentDays,
      totalActualHrs: Math.round(totalActualHrs * 10) / 10,
      avgSleep
    };
  }, [dailyTrendData]);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto w-full space-y-8 select-none">
      {/* Printable / Bullet-Journal Style Header Frame */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 space-y-6">
        {/* Decorative Top Title */}
        <div className="flex items-center justify-center gap-4 text-center">
          <div className="hidden sm:block h-[1px] w-24 bg-gradient-to-r from-transparent to-cyan-500/60" />
          <div className="flex items-center gap-3">
            <Snowflake className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-white uppercase">
              WINTER ARC TRACKER
            </h1>
            <Snowflake className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div className="hidden sm:block h-[1px] w-24 bg-gradient-to-l from-transparent to-cyan-500/60" />
        </div>

        {/* Metadata & Month Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-slate-800/80 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400">Name :</span>
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={reflections.athlete_name}
                onChange={(e) => setReflections((prev) => ({ ...prev, athlete_name: e.target.value }))}
                onBlur={handleNameBlur}
                placeholder="Your Name"
                className="bg-transparent border-b border-dashed border-slate-600 focus:border-cyan-400 text-white font-semibold text-sm px-2 py-0.5 outline-none transition-colors"
              />
              {nameSavedStatus && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold animate-in fade-in">
                  ✓ Saved
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-slate-400">Month :</span>
            <span className="text-base font-extrabold text-cyan-400 tracking-wide">
              {monthName} {year}
            </span>
            {isWinterArcMonth && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                WINTER ARC SEASON
              </span>
            )}
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold px-2 text-white">
              {monthName.slice(0, 3)} {year}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isCurrentMonthView && (
              <button
                onClick={handleCurrentMonth}
                className="ml-2 px-2.5 py-1 text-[11px] font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/30 transition-colors"
              >
                Today ({monthNames[currentMonthNum - 1].slice(0, 3)})
              </button>
            )}
          </div>
        </div>

        {/* Legend & Edit Rule Banner */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400 inline-block" />
              <span className="text-slate-300 font-medium">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500/60 border border-amber-400 inline-block" />
              <span className="text-slate-300 font-medium">Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-700 inline-block" />
              <span className="text-slate-400 font-medium">Missed / Empty</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-500" />
              <span className="text-slate-500 font-medium">Locked (Past/Future)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-cyan-300 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict Rule: Only <strong>Today's Date</strong> is editable. Past and future days are locked.</span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {feedbackMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading Monthly Sheet for {monthName} {year}...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. TOP HABITS / DAYS TABLE */}
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wider uppercase text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                HABITS / DAYS MATRIX
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                {goals.length} Active Habits Tracked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800">
                    <th className="p-3 text-left font-serif font-bold uppercase tracking-wider text-slate-300 min-w-[180px] sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                      HABITS / DAYS
                    </th>
                    {daysArray.map((d) => {
                      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const isToday = dStr === todayDateStr;
                      const dateObj = new Date(year, month - 1, d);
                      const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dateObj.getDay()];

                      return (
                        <th
                          key={d}
                          className={`p-2 text-center font-mono font-bold min-w-[32px] border-r border-slate-800/60 ${
                            isToday ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-400' : 'text-slate-400'
                          }`}
                        >
                          <div>{d}</div>
                          <div className="text-[9px] text-slate-500 font-normal">{dayLetter}</div>
                        </th>
                      );
                    })}
                    <th className="p-2 text-center font-bold text-slate-300 min-w-[60px] bg-slate-900">
                      Score
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {goals.map((g, idx) => {
                    const gStart = g.start_date || (g.created_at ? g.created_at.split('T')[0] : null);
                    const gEnd = g.end_date || null;
                    let completedDaysCount = 0;
                    let activeDaysElapsed = 0;

                    return (
                      <tr 
                        key={g.id} 
                        className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors"
                      >
                        {/* Habit Label */}
                        <td className="p-3 sticky left-0 bg-slate-950/90 z-10 border-r border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-serif font-bold text-slate-500 text-xs w-4">
                              {idx + 1}.
                            </span>
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: g.category?.color || '#06B6D4' }} 
                            />
                            <span className="font-bold text-slate-200 truncate">{g.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {g.target_value} {g.unit.slice(0, 3)}
                          </span>
                        </td>

                        {/* Day Columns */}
                        {daysArray.map((d) => {
                          const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const isToday = dStr === todayDateStr;
                          const isFuture = dStr > todayDateStr;
                          const isBeforeInception = gStart && dStr < gStart;
                          const isAfterRetirement = gEnd && dStr > gEnd;
                          const isActiveDay = !isBeforeInception && !isAfterRetirement;

                          if (isActiveDay && !isFuture) {
                            activeDaysElapsed++;
                          }

                          const key = `${g.id}_${dStr}`;
                          const log = logsMap[key];
                          const status = log ? log.status : 'missed';

                          if (isActiveDay && status === 'complete') completedDaysCount++;

                          // Inactive state prior to creation date or after retirement date
                          if (!isActiveDay) {
                            return (
                              <td
                                key={d}
                                title={
                                  isBeforeInception 
                                    ? `Not active on this date (Habit started on ${gStart})` 
                                    : `Habit retired on ${gEnd}`
                                }
                                className="p-1.5 text-center border-r border-slate-800/60 bg-slate-950/60 cursor-not-allowed opacity-35"
                              >
                                <div className="w-6 h-6 mx-auto rounded flex items-center justify-center font-mono text-[11px] text-slate-600 font-bold">
                                  —
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={d}
                              onClick={() => isToday && handleCellClick(g, d)}
                              title={
                                isToday 
                                  ? `Today: Click to toggle ${g.name} status`
                                  : isFuture 
                                  ? 'Future date (Locked)' 
                                  : `Past date (${dStr}): ${status}`
                              }
                              className={`p-1.5 text-center border-r border-slate-800/60 transition-all ${
                                isToday
                                  ? 'bg-cyan-500/10 cursor-pointer hover:bg-cyan-500/30'
                                  : isFuture
                                  ? 'bg-slate-950/40 cursor-not-allowed opacity-40'
                                  : 'cursor-default'
                              }`}
                            >
                              <div className="w-6 h-6 mx-auto rounded flex items-center justify-center transition-all">
                                {status === 'complete' && (
                                  <div className="w-5 h-5 rounded bg-emerald-500 border border-emerald-400 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                                    <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                                  </div>
                                )}
                                {status === 'partial' && (
                                  <div className="w-5 h-5 rounded bg-amber-500/60 border border-amber-400 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-amber-300 rounded-sm" />
                                  </div>
                                )}
                                {status === 'missed' && !isFuture && log && (
                                  <div className="w-5 h-5 rounded border border-rose-500/40 bg-rose-500/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                  </div>
                                )}
                                {isFuture && (
                                  <div className="w-5 h-5 rounded border border-slate-800/50 flex items-center justify-center">
                                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                                  </div>
                                )}
                                {!log && !isFuture && (
                                  <div className="w-5 h-5 rounded border border-slate-800/60 hover:border-slate-700 flex items-center justify-center">
                                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Month Score */}
                        <td className="p-2 text-center font-mono font-bold text-cyan-400 bg-slate-950/50">
                          <div className="text-xs">{completedDaysCount} / {activeDaysElapsed || 1}d</div>
                          <div className="text-[9px] text-slate-400 font-normal">
                            {Math.round((completedDaysCount / (activeDaysElapsed || 1)) * 100)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>          {/* 2. DYNAMIC HABIT METRIC & DURATION MATRIX */}
          {activeMetricHabit ? (
            <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-0">
              <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-xl text-white border"
                    style={{ 
                      backgroundColor: `${activeMetricHabit.category?.color || '#06B6D4'}20`,
                      borderColor: `${activeMetricHabit.category?.color || '#06B6D4'}40` 
                    }}
                  >
                    <Activity className="w-4 h-4" style={{ color: activeMetricHabit.category?.color || '#06B6D4' }} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase text-white flex items-center gap-2">
                      HABIT METRIC & DURATION MATRIX : <span style={{ color: activeMetricHabit.category?.color || '#06B6D4' }}>{activeMetricHabit.name}</span>
                    </h2>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Target: {activeMetricHabit.target_value} {activeMetricHabit.unit} / day • Click today's column to log exact amount
                    </span>
                  </div>
                </div>

                {/* Habit Selector Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Switch Habit:</span>
                  {goals.map((g) => {
                    const isSelected = activeMetricHabit.id === g.id;
                    const habitColor = g.category?.color || '#06B6D4';
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedHabitId(g.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                          isSelected 
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 scale-105' 
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                        }`}
                      >
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: habitColor }} 
                        />
                        <span className="font-bold">{g.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">
                          ({g.target_value} {g.unit?.slice(0, 3)})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800">
                      <th className="p-3 text-left font-serif font-bold uppercase tracking-wider text-slate-300 min-w-[180px] sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                        {activeMetricHabit.name} Levels ({activeMetricHabit.unit})
                      </th>
                      {daysArray.map((d) => {
                        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const isToday = dStr === todayDateStr;
                        return (
                          <th
                            key={d}
                            className={`p-2 text-center font-mono font-bold min-w-[32px] border-r border-slate-800/60 ${
                              isToday ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                            }`}
                          >
                            {d}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {metricLevels.map((lvl) => (
                      <tr 
                        key={lvl}
                        className="border-b border-slate-800/60 hover:bg-slate-900/30 transition-colors"
                      >
                        <td className="p-2.5 font-bold text-slate-300 sticky left-0 bg-slate-950/90 z-10 border-r border-slate-800 flex items-center justify-between">
                          <span>{lvl} {activeMetricHabit.unit}</span>
                          {lvl === activeMetricHabit.target_value && (
                            <span 
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                              style={{ 
                                backgroundColor: `${activeMetricHabit.category?.color || '#06B6D4'}20`,
                                color: activeMetricHabit.category?.color || '#06B6D4',
                                borderColor: `${activeMetricHabit.category?.color || '#06B6D4'}40`
                              }}
                            >
                              Target
                            </span>
                          )}
                        </td>

                        {daysArray.map((d) => {
                          const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const isToday = dStr === todayDateStr;
                          const isFuture = dStr > todayDateStr;
                          const aStart = activeMetricHabit.start_date || (activeMetricHabit.created_at ? activeMetricHabit.created_at.split('T')[0] : null);
                          const aEnd = activeMetricHabit.end_date || null;
                          const isBeforeInception = aStart && dStr < aStart;
                          const isAfterRetirement = aEnd && dStr > aEnd;
                          const isActiveDay = !isBeforeInception && !isAfterRetirement;

                          if (!isActiveDay) {
                            return (
                              <td
                                key={d}
                                title={
                                  isBeforeInception 
                                    ? `Not active on this date (${activeMetricHabit.name} started on ${aStart})` 
                                    : `${activeMetricHabit.name} retired on ${aEnd}`
                                }
                                className="p-1.5 text-center border-r border-slate-800/60 bg-slate-950/60 cursor-not-allowed opacity-35"
                              >
                                <div className="w-6 h-6 mx-auto rounded flex items-center justify-center font-mono text-[11px] text-slate-600 font-bold">
                                  —
                                </div>
                              </td>
                            );
                          }

                          const key = `${activeMetricHabit.id}_${dStr}`;
                          const log = logsMap[key];
                          const loggedVal = log ? Math.round(log.actual_value) : null;
                          const isSelected = loggedVal === lvl;

                          return (
                            <td
                              key={d}
                              onClick={() => isToday && handleMetricLevelClick(lvl, d)}
                              title={
                                isToday 
                                  ? `Today: Click to set ${activeMetricHabit.name} to ${lvl} ${activeMetricHabit.unit}` 
                                  : isFuture 
                                  ? 'Future date (Locked)' 
                                  : `${dStr}: Logged ${loggedVal ?? 0} ${activeMetricHabit.unit}`
                              }
                              className={`p-1.5 text-center border-r border-slate-800/60 ${
                                isToday 
                                  ? 'bg-cyan-500/10 cursor-pointer hover:bg-cyan-500/25' 
                                  : isFuture 
                                  ? 'bg-slate-950/40 cursor-not-allowed opacity-30' 
                                  : 'cursor-default'
                              }`}
                            >
                              <div className="w-6 h-6 mx-auto rounded flex items-center justify-center">
                                {isSelected ? (
                                  <div 
                                    className="w-5 h-5 rounded flex items-center justify-center shadow-md font-mono text-[10px] font-bold text-white border"
                                    style={{ 
                                      backgroundColor: activeMetricHabit.category?.color || '#06B6D4',
                                      borderColor: '#ffffff50'
                                    }}
                                  >
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded border border-slate-800/40 flex items-center justify-center">
                                    <span className="w-1 h-1 rounded-full bg-slate-800/60" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl border border-slate-800 text-center text-slate-400">
              <p className="text-xs">No active habits available. Add habits from the Habits page to track daily durations and metrics.</p>
            </div>
          )}

          {/* 3. BOTTOM REFLECTION SECTION (3 Spacious Journal Panels) */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-wide uppercase font-serif">
                  MONTHLY REFLECTIONS & ACCOUNTABILITY JOURNAL
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record your strategic vision and monthly review for {monthName} {year}
                </p>
              </div>

              <button
                onClick={handleSaveReflections}
                disabled={savingReflection}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                {savingReflection ? 'Saving...' : 'Save Monthly Reflections'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: MY MONTHLY GOAL */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                <span className="text-xs font-serif font-black tracking-wider uppercase text-cyan-400 border-b border-slate-800 pb-2">
                  MY MONTHLY GOAL
                </span>
                <textarea
                  rows={6}
                  placeholder={`What is your core objective for ${monthName}? (e.g. 50 hours of deep coding, 20 gym sessions, maintain 80%+ consistency...)`}
                  value={reflections.goal}
                  onChange={(e) => setReflections((prev) => ({ ...prev, goal: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>

              {/* Box 2: WHAT I HAVE ACHIEVED THIS MONTH */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                <span className="text-xs font-serif font-black tracking-wider uppercase text-emerald-400 border-b border-slate-800 pb-2">
                  WHAT I HAVE ACHIEVED THIS MONTH
                </span>
                <textarea
                  rows={6}
                  placeholder="Record your achievements, milestones, breakthrough days, and habits locked down..."
                  value={reflections.achieved}
                  onChange={(e) => setReflections((prev) => ({ ...prev, achieved: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* Box 3: WHAT SHOULD I IMPROVE */}
              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                <span className="text-xs font-serif font-black tracking-wider uppercase text-amber-400 border-b border-slate-800 pb-2">
                  WHAT SHOULD I IMPROVE
                </span>
                <textarea
                  rows={6}
                  placeholder="Identify where discipline slipped, patterns to eliminate, and adjustments for next month..."
                  value={reflections.improve}
                  onChange={(e) => setReflections((prev) => ({ ...prev, improve: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Daily Habit Reflections & Notes Feed */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  DAILY HABIT NOTES & REFLECTIONS ARCHIVE ({monthName} {year})
                </h3>
                <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  {dailyNotesList.reduce((acc, d) => acc + d.entries.length, 0)} Logged Notes
                </span>
              </div>

              {dailyNotesList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailyNotesList.map((dayGroup) => (
                    <div 
                      key={dayGroup.dateStr}
                      className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
                        <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(dayGroup.dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {dayGroup.entries.length} habit note{dayGroup.entries.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {dayGroup.entries.map((entry) => (
                          <div key={entry.id} className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: entry.goal?.category?.color || '#06B6D4' }} 
                              />
                              <span className="font-bold text-slate-200">{entry.goal?.name || 'Habit'}:</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                {entry.actual_value} {entry.goal?.unit || ''}
                              </span>
                              <span className={`text-[10px] font-bold uppercase ml-auto ${
                                entry.status === 'complete' ? 'text-emerald-400' : entry.status === 'partial' ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {entry.status}
                              </span>
                            </div>
                            <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40 text-[11px] italic leading-relaxed">
                              "{entry.notes}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-center space-y-1.5">
                  <FileText className="w-6 h-6 text-slate-600 mx-auto" />
                  <div className="text-xs font-semibold text-slate-400">No daily notes logged yet for {monthName} {year}</div>
                  <div className="text-[11px] text-slate-500 max-w-md mx-auto">
                    When you type notes and reflections on the <strong className="text-cyan-400">Today</strong> page, they will automatically appear here as your monthly accountability diary!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. SEPARATE SECTION: MONTHLY PERFORMANCE ANALYTICS & CHARTS */}
          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-8 shadow-2xl">
            {/* Header & Stat Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-wide uppercase font-serif flex items-center gap-2.5">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  MONTHLY PERFORMANCE CHARTS & TRENDLINES ({monthName.toUpperCase()} {year})
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Statistical evaluation of consistency, habit adherence, and sleep patterns
                </p>
              </div>

              {/* 4 Quick Stat Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Avg</div>
                  <div className="text-base font-black text-cyan-400">{monthStats.avgAch}%</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Consistent Days</div>
                  <div className="text-base font-black text-emerald-400">{monthStats.consistentDays} <span className="text-[10px] text-slate-500 font-normal">/ {daysInMonth}d</span></div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Hours Executed</div>
                  <div className="text-base font-black text-sky-400">{monthStats.totalActualHrs}h</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Avg Sleep</div>
                  <div className="text-base font-black text-indigo-400">{monthStats.avgSleep}h</div>
                </div>
              </div>
            </div>

            {/* Grid of Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Daily Consistency Trendline */}
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Daily Consistency Trendline
                    </h3>
                    <p className="text-[11px] text-slate-400">Day-by-day achievement % across {monthName}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    80% Target
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="monthAchGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(value) => [`${value}%`, 'Daily Achievement']}
                        labelFormatter={(label) => `Day ${label} (${monthName})`}
                      />
                      <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: '80% Consistent', fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} />
                      <Area type="monotone" dataKey="achievement" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#monthAchGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Habits Success Rate */}
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Habits Adherence Rate (%)
                    </h3>
                    <p className="text-[11px] text-slate-400">% of days completed per habit</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Habit Matrix
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habitComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val, name, item) => [`${val}% (${item.payload.completedDays} days)`, 'Completion Rate']}
                      />
                      <Bar dataKey="successRate" radius={[6, 6, 0, 0]}>
                        {habitComparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Sleep Rhythm Curve */}
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      Daily Sleep Rhythm (Hours)
                    </h3>
                    <p className="text-[11px] text-slate-400">Sleep recorded per night vs 8h target</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    8h Benchmark
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="monthSleepGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} domain={[0, 12]} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val) => [`${val} hrs`, 'Sleep']}
                        labelFormatter={(lbl) => `Day ${lbl} (${monthName})`}
                      />
                      <ReferenceLine y={8} stroke="#818CF8" strokeDasharray="4 4" label={{ value: '8h Target', fill: '#818CF8', fontSize: 10, position: 'insideTopRight' }} />
                      <Area type="monotone" dataKey="sleep" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#monthSleepGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Planned vs Actual Hours by Habit */}
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      Planned vs Actual Execution Volume
                    </h3>
                    <p className="text-[11px] text-slate-400">Total target units vs recorded units</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    Volume Comparison
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habitComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val, name, item) => [`${val} ${item.payload.unit}`, name === 'actualTotal' ? 'Actual' : 'Planned']}
                      />
                      <Bar dataKey="plannedTotal" fill="#38BDF8" radius={[4, 4, 0, 0]} name="Planned" />
                      <Bar dataKey="actualTotal" fill="#10B981" radius={[4, 4, 0, 0]} name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySheetPage;
