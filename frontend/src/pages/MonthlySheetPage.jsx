import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

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
  const [reflections, setReflections] = useState({
    athlete_name: 'Aman',
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

      setGoals(goalsRes);

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

  // Sleep Cell Click: ONLY allowed for TODAY
  const handleSleepClick = async (hrs, dayNum) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    if (dateStr !== todayDateStr) {
      return;
    }

    const sleepGoal = goals.find((g) => g.name.toLowerCase().includes('sleep'));
    if (!sleepGoal) {
      alert('Sleep habit not found in goals.');
      return;
    }

    try {
      const status = hrs >= sleepGoal.target_value ? 'complete' : (hrs >= 5 ? 'partial' : 'missed');
      const updated = await saveLog({
        goal_id: sleepGoal.id,
        log_date: dateStr,
        target_value: sleepGoal.target_value,
        actual_value: hrs,
        status: status
      });

      setLogsMap((prev) => ({
        ...prev,
        [`${sleepGoal.id}_${dateStr}`]: updated
      }));
      setSleepMap((prev) => ({
        ...prev,
        [dateStr]: hrs
      }));
    } catch (err) {
      console.error('Failed to log sleep:', err);
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
            <input 
              type="text"
              value={reflections.athlete_name}
              onChange={(e) => setReflections((prev) => ({ ...prev, athlete_name: e.target.value }))}
              placeholder="Your Name"
              className="bg-transparent border-b border-dashed border-slate-600 focus:border-cyan-400 text-white font-semibold text-sm px-2 py-0.5 outline-none"
            />
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
                    let completedDaysCount = 0;
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
                          const isPast = dStr < todayDateStr;

                          const key = `${g.id}_${dStr}`;
                          const log = logsMap[key];
                          const status = log ? log.status : 'missed';

                          if (status === 'complete') completedDaysCount++;

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
                          {completedDaysCount}d
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. MIDDLE SLEEP TRACKER GRID */}
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wider uppercase text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                SLEEP DURATION MATRIX (HOURS)
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Standard Sleep Target: 8 Hours
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800">
                    <th className="p-3 text-left font-serif font-bold uppercase tracking-wider text-slate-300 min-w-[180px] sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                      Sleep Duration
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
                  {sleepHours.map((hrs) => (
                    <tr 
                      key={hrs}
                      className="border-b border-slate-800/60 hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="p-2.5 font-bold text-slate-300 sticky left-0 bg-slate-950/90 z-10 border-r border-slate-800 flex items-center justify-between">
                        <span>{hrs} hrs</span>
                        {hrs === 8 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Target
                          </span>
                        )}
                      </td>

                      {daysArray.map((d) => {
                        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const isToday = dStr === todayDateStr;
                        const isFuture = dStr > todayDateStr;
                        const loggedSleep = sleepMap[dStr];
                        const isSelected = loggedSleep === hrs;

                        return (
                          <td
                            key={d}
                            onClick={() => isToday && handleSleepClick(hrs, d)}
                            className={`p-1.5 text-center border-r border-slate-800/60 ${
                              isToday 
                                ? 'bg-cyan-500/10 cursor-pointer hover:bg-indigo-500/20' 
                                : isFuture 
                                ? 'bg-slate-950/40 cursor-not-allowed opacity-30'
                                : 'cursor-default'
                            }`}
                          >
                            <div className="w-6 h-6 mx-auto rounded flex items-center justify-center">
                              {isSelected ? (
                                <div className="w-5 h-5 rounded bg-indigo-500 border border-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/30">
                                  <Moon className="w-3 h-3 text-white" />
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySheetPage;
