import React, { useState, useEffect } from 'react';
import { X, Target, Trophy, Calendar, CheckSquare, Sparkles, Flag, ArrowRight } from 'lucide-react';

const GoalMilestoneModal = ({ isOpen, onClose, onSave, initialData, categories = [], habits = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    type: 'goal',
    target_value: 100,
    current_value: 0,
    unit: 'problems',
    end_date: '',
    status: 'in_progress',
    linked_habit_ids: '',
    description: '',
    is_active: true
  });

  const [selectedHabitIds, setSelectedHabitIds] = useState([]);

  useEffect(() => {
    if (initialData) {
      const linked = initialData.linked_habit_ids 
        ? String(initialData.linked_habit_ids).split(',').map(s => s.trim()).filter(Boolean)
        : [];

      setSelectedHabitIds(linked);
      setFormData({
        name: initialData.name || '',
        category_id: initialData.category_id || (categories?.[0]?.id || ''),
        type: 'goal',
        target_value: initialData.target_value ?? 100,
        current_value: initialData.current_value ?? 0,
        unit: initialData.unit || 'problems',
        end_date: initialData.end_date || '',
        status: initialData.status || 'in_progress',
        linked_habit_ids: initialData.linked_habit_ids || '',
        description: initialData.description || '',
        is_active: initialData.is_active ?? true
      });
    } else {
      setSelectedHabitIds([]);
      setFormData({
        name: '',
        category_id: categories?.[0]?.id || '',
        type: 'goal',
        target_value: 100,
        current_value: 0,
        unit: 'problems',
        end_date: '',
        status: 'in_progress',
        linked_habit_ids: '',
        description: '',
        is_active: true
      });
    }
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const toggleHabitLink = (habitId) => {
    const sId = String(habitId);
    setSelectedHabitIds(prev => {
      const updated = prev.includes(sId) 
        ? prev.filter(id => id !== sId) 
        : [...prev, sId];
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      type: 'goal',
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      target_value: parseFloat(formData.target_value) || 1,
      current_value: parseFloat(formData.current_value) || 0,
      linked_habit_ids: selectedHabitIds.join(','),
      end_date: formData.end_date ? formData.end_date : null,
      start_date: null
    };

    onSave(payload);
    onClose();
  };

  // Calculate live preview percentage
  const currentNum = parseFloat(formData.current_value) || 0;
  const targetNum = parseFloat(formData.target_value) || 1;
  const pct = Math.min(Math.round((currentNum / targetNum) * 100), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {initialData ? 'Edit Outcome Milestone' : 'Set Outcome Milestone Goal'}
              </h3>
              <p className="text-xs text-slate-400">
                A big target result achieved through daily habit consistency.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Goal Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Milestone Goal Title *
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Crack Google / SDE-1 Placement, Solve 300 LeetCode, Reach 75kg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm transition-colors"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Milestone Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
              >
                <option value="in_progress">🚀 In Progress</option>
                <option value="achieved">🏆 Achieved / Conquered</option>
                <option value="paused">⏸️ Paused / On Hold</option>
              </select>
            </div>
          </div>

          {/* Target Value, Current Progress & Unit */}
          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Target Milestone Metrics
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Current Progress
                </label>
                <input 
                  type="number" 
                  step="any"
                  min="0"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Target Goal *
                </label>
                <input 
                  type="number" 
                  step="any"
                  min="0.1"
                  required
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Unit
                </label>
                <input 
                  type="text" 
                  placeholder="problems, kg, books, projects, %"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            {/* Live Progress Bar Preview */}
            <div className="pt-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1.5">
                <span>Milestone Progress:</span>
                <span className="text-amber-400 font-bold">{pct}% ({currentNum} / {targetNum} {formData.unit})</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Target Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Deadline (Optional)
            </label>
            <div className="relative">
              <input 
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Linked Daily Habits (Smart Architecture!) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              🔗 Linked Daily Habits (Which routines drive this goal?)
            </label>
            {habits.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No habits created yet. You can create daily habits on the Habits page.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-800/40 border border-slate-800 rounded-2xl max-h-36 overflow-y-auto">
                {habits.map((h) => {
                  const isChecked = selectedHabitIds.includes(String(h.id));
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHabitLink(h.id)}
                      className={`p-2 rounded-xl text-left border flex items-center gap-2 text-xs transition-all ${
                        isChecked 
                          ? 'bg-amber-500/15 border-amber-500/60 text-amber-200' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                        isChecked ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold' : 'border-slate-600'
                      }`}>
                        {isChecked && '✓'}
                      </span>
                      <span className="truncate font-medium">{h.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description / Action Strategy */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Action Strategy & Motivation (Optional)
            </label>
            <textarea 
              rows={2}
              placeholder="Why this milestone matters and how consistent habits will conquer it..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              {initialData ? 'Update Milestone Goal' : 'Create Milestone Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalMilestoneModal;
