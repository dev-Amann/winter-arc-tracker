import React, { useState, useEffect } from 'react';
import { 
  getPlannedVsActual, 
  getMonthlyAnalytics, 
  getCategoryPerformance, 
  getPeriodComparison 
} from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  PieChart as PieIcon, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid,
  Legend
} from 'recharts';

const GOAL_COLORS = ['#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#F43F5E'];

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' or 'comparison'
  const [timeFrame, setTimeFrame] = useState('month');
  const [pvData, setPvData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [catData, setCatData] = useState([]);
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [pvRes, mRes, cRes, compRes] = await Promise.all([
        getPlannedVsActual({ time_frame: timeFrame }),
        getMonthlyAnalytics(new Date().getFullYear()),
        getCategoryPerformance(),
        getPeriodComparison({ period_type: 'month' })
      ]);

      setPvData(pvRes);
      setMonthlyData(mRes);
      setCatData(cRes);
      setCompData(compRes);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeFrame]);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            ANALYTICS & PERFORMANCE INSIGHTS
          </h2>
          <p className="text-xs text-slate-400 mt-1">Vibrant multi-dimensional charts, trends, and comparative metrics</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'charts' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Charts & Visualizations
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'comparison' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Period Comparison
          </button>
        </div>
      </div>

      {activeTab === 'charts' ? (
        <div className="space-y-8">
          {/* Timeframe Filter Bar */}
          <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Timeframe Filter
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {['day', 'week', 'month', 'quarter', 'year'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFrame(tf)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    timeFrame === tf
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Row 1: Planned vs Actual Bar Chart & Monthly Achievement Area Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Planned vs Actual Multi-Color Bar Chart */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  1. Planned vs Actual Target Comparison
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  Target vs Performance
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pvData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="target" fill="#38BDF8" name="Planned Target" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="actual" fill="#10B981" name="Actual Performance" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Monthly Achievement Area Chart with Gradient */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  2. 12-Month Achievement Trend Area Chart
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Percentage Curve
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="achieveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month_name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="achievement_pct" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#achieveGrad)" name="Achievement %" dot={{ fill: '#06B6D4', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Category Performance Breakdown & Monthly Goals Completed vs Missed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 3: Category Performance Multi-Color Breakdown */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-purple-400" />
                  3. Category Performance & Habit Count
                </h3>
                <span className="text-[10px] text-purple-400 font-semibold uppercase bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                  By Category
                </span>
              </div>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={11} />
                    <YAxis dataKey="category_name" type="category" stroke="#64748B" fontSize={11} width={110} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="avg_achievement_pct" name="Average Achievement %" radius={[0, 6, 6, 0]}>
                      {catData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || GOAL_COLORS[index % GOAL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Monthly Goals Completed vs Missed Stacked Bar Chart */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  4. Monthly Completed vs Missed Goals
                </h3>
                <span className="text-[10px] text-amber-400 font-semibold uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Consistency Volume
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month_name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="completed_goals" fill="#10B981" name="Completed Goals" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="missed_goals" fill="#F43F5E" name="Missed Goals" stackId="a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 3: Cumulative Hours Growth & Habit Success Rates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 5: Planned vs Actual Hours Dual Line Chart */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-400" />
                  5. Planned vs Actual Volume (Hours / Units)
                </h3>
                <span className="text-[10px] text-rose-400 font-semibold uppercase bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                  Execution Volume
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month_name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="planned" stroke="#38BDF8" strokeWidth={2.5} name="Planned Target" dot={{ fill: '#38BDF8', r: 3 }} />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2.5} name="Actual Recorded" dot={{ fill: '#10B981', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Average Daily Completion Rate by Month */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  6. Average Daily Completion Rate Across Months
                </h3>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  Consistency %
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month_name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="avg_daily_completion" fill="#6366F1" name="Avg Daily Completion %" radius={[6, 6, 0, 0]}>
                      {monthlyData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.avg_daily_completion >= 80 ? '#10B981' : entry.avg_daily_completion >= 50 ? '#06B6D4' : '#6366F1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Period Comparison Tab */
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">PERIOD COMPARISON ENGINE</h3>
            <span className="text-xs text-cyan-400 font-semibold">{compData?.period_previous_name} vs {compData?.period_current_name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {compData?.metrics?.map((m, idx) => (
              <div key={idx} className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.metric_name}</span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-white">{m.current_value} <span className="text-xs text-slate-400">{m.unit}</span></div>
                    <div className="text-xs text-slate-500 mt-1">Previous: {m.previous_value} {m.unit}</div>
                  </div>
                  <div className={`p-2.5 rounded-xl font-bold text-sm flex items-center gap-1 ${
                    m.change_pct >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {m.change_pct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {m.change_pct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
