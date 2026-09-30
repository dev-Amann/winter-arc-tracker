import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#06B6D4');
  const [icon, setIcon] = useState('folder');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, color, icon });
    setName('');
    onClose();
  };

  const presetColors = ['#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#F43F5E', '#6B7280'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            Add Custom Category
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category Name *
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Mindfulness, Side Projects"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-3">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
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
