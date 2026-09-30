import React from 'react';
import { 
  Target, 
  CheckCircle2, 
  Percent, 
  Flame, 
  Trophy, 
  Calendar, 
  Clock, 
  Activity 
} from 'lucide-react';

const MetricCards = ({ stats }) => {
  const cards = [
    {
      title: "Today's Plan",
      value: `${stats?.today_planned || 0} hrs`,
      sub: `${stats?.today_plan_count || 0} active goals`,
      icon: Target,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      title: "Today's Actual",
      value: `${stats?.today_actual || 0} hrs`,
      sub: `${stats?.today_completed_count || 0} completed`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Today's Completion",
      value: `${stats?.today_completion_pct || 0}%`,
      sub: "Daily target progress",
      icon: Percent,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Current Streak",
      value: `${stats?.current_streak || 0} Days`,
      sub: "Active consistency",
      icon: Flame,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Best Streak",
      value: `${stats?.best_streak || 0} Days`,
      sub: "All-time personal record",
      icon: Trophy,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Monthly Average",
      value: `${stats?.monthly_average_pct || 0}%`,
      sub: "Overall month performance",
      icon: Calendar,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      title: "Total Planned Hours",
      value: `${stats?.total_planned_hours || 0} hrs`,
      sub: "Cumulative targets",
      icon: Clock,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20"
    },
    {
      title: "Total Actual Hours",
      value: `${stats?.total_actual_hours || 0} hrs`,
      sub: "Recorded execution",
      icon: Activity,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, index) => {
        const Icon = c.icon;
        return (
          <div 
            key={index}
            className={`glass-card glass-card-hover p-5 rounded-2xl border ${c.border} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.title}</span>
              <div className={`p-2.5 rounded-xl ${c.bg} ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-white tracking-tight">{c.value}</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
