import React from 'react';
import { Calendar, Flame, TrendingUp } from 'lucide-react';

const Header = ({ stats }) => {
  const currentDate = stats?.current_date ? new Date(stats.current_date) : new Date();
  const currentYear = currentDate.getFullYear();
  const currentDateStr = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const isArcActive = stats?.winter_arc_active ?? (currentDate.getMonth() >= 9 && currentDate.getMonth() <= 11);
  const arcYear = stats?.winter_arc_year || currentYear;

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-5 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4">
      {/* Title & Date */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            WINTER ARC <span className="text-cyan-400 font-bold">{arcYear}</span>
          </h2>
          {isArcActive ? (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm shadow-amber-500/20 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Active Mode (Oct 1 – Dec 31)
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              Annual Mode (Activates Oct 1)
            </span>
          )}
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
