import React, { useState, useEffect } from 'react';
import { X, Target, Check, AlertCircle } from 'lucide-react';

const GoalModal = ({ isOpen, onClose, onSave, initialData, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    type: 'habit',
    frequency: 'daily',
    target_value: 1,
    unit: 'hours',
    goal_direction: 'higher_is_better',
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category_id: initialData.category_id || (categories?.[0]?.id || ''),
        type: initialData.type || 'habit',
        frequency: initialData.frequency || 'daily',
        target_value: initialData.target_value ?? 1,
        unit: initialData.unit || 'hours',
        goal_direction: initialData.goal_direction || 'higher_is_better',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        is_active: initialData.is_active ?? true
      });
    } else {
      setFormData({
        name: '',
        category_id: categories?.[0]?.id || '',
        type: 'habit',
        frequency: 'daily',
        target_value: 1,
        unit: 'hours',
        goal_direction: 'higher_is_better',
        start_date: '',
        end_date: '',
        is_active: true
      });
    }
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            {initialData ? 'Edit Habit / Goal' : 'Create New Habit / Goal'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Goal / Habit Name *
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Coding, DSA, Instagram, Exercise"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
            />
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Target Value & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Amount *
              </label>
              <input 
                type="number" 
                step="any"
                required
                min="0.1"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Unit
              </label>
              <input 
                type="text" 
                placeholder="hours, problems, minutes, pages"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Goal Direction (Crucial Requirement!) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Goal Direction *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, goal_direction: 'higher_is_better' })}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  formData.goal_direction === 'higher_is_better'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>📈 Higher is Better</span>
                <span className="text-[10px] font-normal opacity-80">(e.g. Coding hours, DSA)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, goal_direction: 'lower_is_better' })}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  formData.goal_direction === 'lower_is_better'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>📉 Lower is Better</span>
                <span className="text-[10px] font-normal opacity-80">(e.g. Instagram max limit)</span>
              </button>
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Start Date (Optional)
              </label>
              <input 
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                End Date (Optional)
              </label>
              <input 
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
            <label htmlFor="is_active" className="text-xs font-medium text-slate-300">
              Active Habit / Goal (Show on daily logging dashboard)
            </label>
          </div>

          {/* Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
