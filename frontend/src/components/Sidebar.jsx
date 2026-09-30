import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Repeat, 
  Target, 
  BarChart3, 
  CalendarDays, 
  Flame, 
  Settings,
  Snowflake
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Today', path: '/today', icon: CalendarCheck },
    { name: 'Habits', path: '/habits', icon: Repeat },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Winter Arc', path: '/winter-arc', icon: Flame, badge: '2026' },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <Snowflake className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide leading-none">WINTER ARC</h1>
          <span className="text-xs text-cyan-400 font-medium tracking-wider uppercase">Tracker 2026</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Plan • Do • Record • Compare • Improve
      </div>
    </aside>
  );
};

export default Sidebar;
