import React, { useState } from 'react';

const HeatmapGrid = ({ heatmapData, onSelectDay }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Map heatmap data array into a date lookup dictionary
  const dataByDate = {};
  if (Array.isArray(heatmapData)) {
    heatmapData.forEach((item) => {
      dataByDate[item.date] = item;
    });
  }

  // Generate 365 days of current year or 52 weeks
  const today = new Date();
  const year = today.getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

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

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-visible">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">ACTIVITY HEATMAP ({year})</h3>
          <p className="text-xs text-slate-400">Completion intensity across days</p>
        </div>
        
        {/* Color Legend */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
          <div className="w-3 h-3 rounded bg-cyan-950 border border-cyan-800" />
          <div className="w-3 h-3 rounded bg-cyan-700/60 border border-cyan-600" />
          <div className="w-3 h-3 rounded bg-cyan-500/80 border border-cyan-400" />
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
