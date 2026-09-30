import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const HeatmapGrid = ({ heatmapData, onSelectDay, year, onYearChange }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const currentYear = year || new Date().getFullYear();

  // Map heatmap data array into a date lookup dictionary
  const dataByDate = {};
  if (Array.isArray(heatmapData)) {
    heatmapData.forEach((item) => {
      dataByDate[item.date] = item;
    });
  }

  // Generate all days of selected year
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);

  const days = [];
  let curr = new Date(startDate);
  while (curr <= endDate) {
    const isoDate = curr.toISOString().split('T')[0];
    days.push({
      date: isoDate,
      dayOfWeek: curr.getDay(),
      month: curr.getMonth(),
      data: dataByDate[isoDate] || null
    });
    curr.setDate(curr.getDate() + 1);
  }

  const getColorClass = (achPct) => {
    if (achPct === undefined || achPct === null) return 'bg-slate-900 border-slate-800/80';
    if (achPct >= 99.9) return 'bg-cyan-400 border-cyan-300 shadow-sm shadow-cyan-400/40';
    if (achPct >= 80) return 'bg-cyan-500/80 border-cyan-400';
    if (achPct >= 50) return 'bg-cyan-700/60 border-cyan-600';
    if (achPct > 0) return 'bg-cyan-950 border-cyan-800';
    return 'bg-slate-900 border-slate-800/80';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Year selector list from 2020 through 2030
  const yearOptions = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Title & Year Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
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
              ACTIVITY HEATMAP ({currentYear})
            </h3>
            <p className="text-xs text-slate-400">Past, current, and future performance across days</p>
          </div>
        </div>
        
        {/* Color Legend */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
          <div className="w-3 h-3 rounded bg-cyan-950 border border-cyan-800" />
          <div className="w-3 h-3 rounded bg-cyan-700/60 border-cyan-600" />
          <div className="w-3 h-3 rounded bg-cyan-500/80 border-cyan-400" />
          <div className="w-3 h-3 rounded bg-cyan-400 border border-cyan-300" />
          <span>100%</span>
        </div>
      </div>

      {/* Month Headers */}
      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-2 px-1">
        {months.map((m, idx) => (
          <span key={idx}>{m}</span>
        ))}
      </div>

      {/* Grid Container */}
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
        {days.map((dayObj, index) => {
          const ach = dayObj.data ? dayObj.data.achievement_pct : 0;
          return (
            <div
              key={index}
              onClick={() => onSelectDay && onSelectDay(dayObj.date)}
              onMouseEnter={() => setHoveredDay(dayObj)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`w-3.5 h-3.5 rounded-[3px] border ${getColorClass(dayObj.data ? ach : undefined)} cursor-pointer transition-all hover:scale-125 hover:z-20`}
            />
          );
        })}
      </div>

      {/* Tooltip Overlay */}
      {hoveredDay && (
        <div className="mt-3 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 flex items-center justify-between shadow-xl">
          <span className="font-bold text-cyan-400">{hoveredDay.date}</span>
          {hoveredDay.data ? (
            <div className="flex gap-4">
              <span>Planned: <strong className="text-white">{hoveredDay.data.planned}</strong></span>
              <span>Actual: <strong className="text-white">{hoveredDay.data.actual}</strong></span>
              <span>Achievement: <strong className="text-cyan-400">{hoveredDay.data.achievement_pct}%</strong></span>
            </div>
          ) : (
            <span className="text-slate-500">No activity logged for this date</span>
          )}
        </div>
      )}
    </div>
  );
};

export default HeatmapGrid;
