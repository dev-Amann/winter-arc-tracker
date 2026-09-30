import React from 'react';
import { Calendar, Flame, TrendingUp } from 'lucide-react';

const Header = ({ stats }) => {
  const currentDateStr = stats?.current_date 
    ? new Date(stats.current_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-5 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4">
      {/* Title & Date */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">WINTER ARC 2026</h2>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-cyan-400" />
            Active Arc
          </span>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentDateStr}</span>
        </p>
      </div>

      {/* Top Section Summary Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2 flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-amber-500" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Streak</div>
            <div className="text-sm font-bold text-amber-400">{stats?.current_streak || 0} Days</div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Today</div>
          <div className="text-sm font-bold text-cyan-400">{stats?.today_completion_pct || 0}%</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">This Week</div>
          <div className="text-sm font-bold text-blue-400">{stats?.week_completion_pct || 0}%</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">This Month</div>
          <div className="text-sm font-bold text-emerald-400">{stats?.month_completion_pct || 0}%</div>
        </div>

        <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-xl px-4 py-2">
          <div className="text-[10px] uppercase tracking-wider text-cyan-300 font-medium">Winter Arc</div>
          <div className="text-sm font-bold text-white">{stats?.overall_winter_arc_pct || 0}%</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
