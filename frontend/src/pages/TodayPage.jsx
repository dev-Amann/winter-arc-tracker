import React, { useState, useEffect } from 'react';
import { getGoals, getLogs, saveLogsBatch } from '../services/api';
import { CalendarCheck, ChevronLeft, ChevronRight, Save, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';

const TodayPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [goals, setGoals] = useState([]);
  const [logsMap, setLogsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, logsRes] = await Promise.all([
        getGoals({ is_active: true }),
        getLogs({ log_date: selectedDate })
      ]);

      setGoals(goalsRes);

      // Build logs map
      const map = {};
      logsRes.forEach(l => {
        map[l.goal_id] = {
          actual_value: l.actual_value,
          target_value: l.target_value,
          notes: l.notes || '',
          status: l.status,
          achievement_pct: l.achievement_pct
        };
      });

      // Default unset goals to target value 0
      goalsRes.forEach(g => {
        if (!map[g.id]) {
          map[g.id] = {
            actual_value: 0,
            target_value: g.target_value,
            notes: '',
            status: 'missed',
            achievement_pct: 0
          };
        }
      });

      setLogsMap(map);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleDateChange = (daysOffset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + daysOffset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleInputChange = (goalId, field, value) => {
    setLogsMap(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const batchItems = Object.entries(logsMap).map(([goalId, val]) => ({
        goal_id: parseInt(goalId),
        actual_value: parseFloat(val.actual_value) || 0,
        target_value: parseFloat(val.target_value),
        notes: val.notes,
        status: val.status
      }));

      await saveLogsBatch({
        log_date: selectedDate,
        logs: batchItems
      });

      setSuccessMessage('Daily log saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadData();
    } catch (err) {
      console.error('Failed to save batch logs:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <CalendarCheck className="w-7 h-7 text-cyan-400" />
            DAILY PERFORMANCE LOG
          </h2>
          <p className="text-xs text-slate-400 mt-1">Record your actual performance against planned targets</p>
        </div>

        {/* Date Selector controls */}
        <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button 
            onClick={() => handleDateChange(-1)} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-white font-bold text-sm focus:outline-none px-2 cursor-pointer"
          />

          <button 
            onClick={() => handleDateChange(1)} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Goals Logging List */}
      <div className="space-y-4">
        {goals.map((g) => {
          const logData = logsMap[g.id] || { actual_value: 0, notes: '', status: 'missed' };
          const categoryName = g.category ? g.category.name : 'General';
          const categoryColor = g.category ? g.category.color : '#3B82F6';

          return (
            <div 
              key={g.id}
              className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 transition-all hover:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-10 rounded-full" 
                    style={{ backgroundColor: categoryColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{g.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {categoryName}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md ${
                        g.goal_direction === 'lower_is_better' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {g.goal_direction === 'lower_is_better' ? 'Lower is Better' : 'Higher is Better'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Planned Target: <strong className="text-cyan-400">{g.target_value} {g.unit}</strong>
                    </div>
                  </div>
                </div>

                {/* Status Selector Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleInputChange(g.id, 'status', 'complete');
                      handleInputChange(g.id, 'actual_value', g.target_value);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      logData.status === 'complete'
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Complete
                  </button>

                  <button
                    onClick={() => {
                      handleInputChange(g.id, 'status', 'partial');
                      handleInputChange(g.id, 'actual_value', Math.round((g.target_value / 2) * 10) / 10);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      logData.status === 'partial'
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Partial
                  </button>

                  <button
                    onClick={() => {
                      handleInputChange(g.id, 'status', 'missed');
                      handleInputChange(g.id, 'actual_value', 0);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      logData.status === 'missed'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Missed
                  </button>
                </div>
              </div>

              {/* Actual Input & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Actual Performance
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={logData.actual_value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const st = val <= 0 ? 'missed' : (val >= g.target_value ? 'complete' : 'partial');
                        handleInputChange(g.id, 'actual_value', e.target.value);
                        handleInputChange(g.id, 'status', st);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{g.unit}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Notes & Reflections
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Worked on React dashboard, solved 3 LeetCode mediums..."
                    value={logData.notes}
                    onChange={(e) => handleInputChange(g.id, 'notes', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Save Bar */}
      <div className="sticky bottom-6 glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-2xl z-20">
        <span className="text-xs text-slate-400 font-medium">
          Ready to commit your log for <strong className="text-white">{selectedDate}</strong>?
        </span>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Daily Logs'}
        </button>
      </div>
    </div>
  );
};

export default TodayPage;
