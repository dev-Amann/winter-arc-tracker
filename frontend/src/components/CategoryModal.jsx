import React, { useState } from 'react';
import { X, FolderPlus, Pipette, Check } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#06B6D4');
  const [icon, setIcon] = useState('folder');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, icon });
    setName('');
    onClose();
  };

  const presetColors = [
    '#06B6D4', '#3B82F6', '#10B981', '#F59E0B', 
    '#EC4899', '#8B5CF6', '#F43F5E', '#14B8A6',
    '#EAB308', '#6366F1', '#A855F7', '#64748B'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            Add Custom Category
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category Name *
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Deep Work, Fitness, Side Hustle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-colors"
            />
          </div>

          {/* Dynamic Color Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Category Color Theme
              </label>
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                {color}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                    color.toLowerCase() === c.toLowerCase() 
                      ? 'border-white scale-110 shadow-lg shadow-cyan-500/20' 
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color.toLowerCase() === c.toLowerCase() && (
                    <Check className="w-4 h-4 text-white stroke-[3] drop-shadow" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Interactive Color Picker Input */}
            <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center gap-3">
              <div className="relative flex items-center">
                <input 
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                  title="Click to open color spectrum picker"
                />
              </div>

              <div className="flex-1">
                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                  <Pipette className="w-3 h-3 text-cyan-400" />
                  <span>Dynamic Spectrum Picker / Custom Hex</span>
                </div>
                <input 
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  maxLength={7}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Color Swatch Preview */}
              <div 
                className="w-8 h-8 rounded-xl border border-slate-700 shadow-inner shrink-0" 
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          {/* Live Preview Badge */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-400">Live Preview:</span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                 style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}40`, borderWidth: 1 }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {name.trim() || 'Category Name'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
