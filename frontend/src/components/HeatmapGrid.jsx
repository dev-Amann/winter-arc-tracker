import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const HeatmapGrid = ({ heatmapData, onSelectDay, year, onYearChange }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const currentYear = year || new Date().getFullYear();
  const todayStr = new Date().toISOString().split('T')[0];

  // Map heatmap data array into a date lookup dictionary
  const dataByDate = {};
  if (Array.isArray(heatmapData)) {
    heatmapData.forEach((item) => {
      dataByDate[item.date] = item;
    });
  }

  const getColorClass = (achPct, isFuture) => {
    if (isFuture) return 'bg-slate-900/40 border-slate-800/40 text-slate-600 opacity-60';
    if (achPct === undefined || achPct === null || achPct <= 0) return 'bg-slate-900 border-slate-800/80 text-slate-500 hover:border-slate-600';
    if (achPct >= 99.9) return 'bg-cyan-400 border-cyan-300 text-slate-950 font-bold shadow-sm shadow-cyan-400/40';
    if (achPct >= 80) return 'bg-cyan-500/80 border-cyan-400 text-white font-semibold';
    if (achPct >= 50) return 'bg-cyan-700/60 border-cyan-600 text-cyan-100';
    return 'bg-cyan-950 border-cyan-800 text-cyan-300';
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const yearOptions = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  // Build grid data for each month
  const monthFrames = months.map((monthName, monthIndex) => {
    const firstDay = new Date(currentYear, monthIndex, 1);
    const lastDay = new Date(currentYear, monthIndex + 1, 0);
    const totalDays = lastDay.getDate();

    // Monday-based day of week (0 = Monday, 6 = Sunday)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];
    // Padding before 1st of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ isPadding: true, key: `pad-${i}` });
    }

    let monthTotalAch = 0;
    let daysWithLogs = 0;

    // Actual month days
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(monthIndex + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const isoDate = `${currentYear}-${monthStr}-${dayStr}`;
      const logData = dataByDate[isoDate] || null;
      const isFuture = isoDate > todayStr;

      if (logData && !isFuture) {
        monthTotalAch += logData.achievement_pct;
        daysWithLogs++;
      }

      days.push({
        isPadding: false,
        dayNumber: d,
        date: isoDate,
        data: logData,
        isFuture,
        isToday: isoDate === todayStr,
        key: isoDate
      });
    }

    const monthAvg = daysWithLogs > 0 ? Math.round(monthTotalAch / daysWithLogs) : 0;

    return {
      monthName,
      monthIndex,
      days,
      monthAvg
    };
  });

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => onYearChange && onYearChange(currentYear - 1)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentYear}
              onChange={(e) => onYearChange && onYearChange(parseInt(e.target.value))}
              className="bg-transparent text-white font-bold text-xs px-2 py-1 focus:outline-none cursor-pointer"
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900 text-white">
                  {yr}
                </option>
              ))}
            </select>

            <button
              onClick={() => onYearChange && onYearChange(currentYear + 1)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              ANNUAL ACTIVITY HEATMAP ({currentYear})
            </h3>
            <p className="text-xs text-slate-400">12 distinctly framed months — spot monthly starts and endings at a glance</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <span>0%</span>
          <div className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
          <div className="w-3 h-3 rounded bg-cyan-950 border border-cyan-800" />
          <div className="w-3 h-3 rounded bg-cyan-700/60 border border-cyan-600" />
          <div className="w-3 h-3 rounded bg-cyan-500/80 border border-cyan-400" />
          <div className="w-3 h-3 rounded bg-cyan-400 border border-cyan-300" />
          <span>100%</span>
        </div>
      </div>

      {/* 12 Framed Month Containers Grid (3 columns on md, 4 columns on xl) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {monthFrames.map((m) => (
          <div
            key={m.monthIndex}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            {/* Month Header Frame */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
              <span className="text-xs font-bold text-white tracking-wide uppercase">{m.monthName}</span>
              {m.monthAvg > 0 ? (
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  {m.monthAvg}% avg
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">0% avg</span>
              )}
            </div>

            {/* Weekday Columns */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 mb-1.5">
              {weekDays.map((w, idx) => (
                <span key={idx}>{w}</span>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {m.days.map((day) => {
                if (day.isPadding) {
                  return <div key={day.key} className="w-full aspect-square" />;
                }

                const ach = day.data ? day.data.achievement_pct : 0;

                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled={day.isFuture}
                    onClick={() => onSelectDay && onSelectDay(day.date)}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-full aspect-square rounded-md border text-[10px] flex items-center justify-center transition-all ${
                      getColorClass(ach, day.isFuture)
                    } ${day.isToday ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900' : ''} ${
                      day.isFuture ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110 hover:z-10'
                    }`}
                  >
                    {day.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip Overlay */}
      {hoveredDay && (
        <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl text-xs text-slate-200 flex items-center justify-between shadow-2xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-400">{hoveredDay.date}</span>
            {hoveredDay.isToday && (
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">TODAY</span>
            )}
            {hoveredDay.isFuture && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">Upcoming (Future Date)</span>
            )}
          </div>
          {hoveredDay.data && !hoveredDay.isFuture ? (
            <div className="flex gap-4">
              <span>Planned: <strong className="text-white">{hoveredDay.data.planned}</strong></span>
              <span>Actual: <strong className="text-white">{hoveredDay.data.actual}</strong></span>
              <span>Achievement: <strong className="text-cyan-400">{hoveredDay.data.achievement_pct}%</strong></span>
            </div>
          ) : (
            <span className="text-slate-500">{hoveredDay.isFuture ? 'No future logging allowed' : 'No performance logged'}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default HeatmapGrid;
