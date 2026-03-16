import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function TaskDialog({ open, task, onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '' });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        startDate: task.startDate || '',
        endDate: task.endDate || '',
      });
    } else {
      setForm({ title: '', description: '', startDate: '', endDate: '' });
    }
  }, [task, open]);

  if (!open) return null;

  const isEdit = !!task;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, status: task?.status || 'New' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-backdrop" onClick={onCancel}>
      <div
        className="bg-nord6 dark:bg-nord1 rounded-xl border border-nord4 dark:border-nord2 shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-nord4 dark:border-nord2">
          <h2 className="text-lg font-semibold text-nord0 dark:text-nord6">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-nord0 dark:text-nord4 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-nord4 dark:border-nord2 bg-nord5 dark:bg-nord2 text-nord0 dark:text-nord6 focus:outline-none focus:ring-2 focus:ring-nord8 transition-colors"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nord0 dark:text-nord4 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-nord4 dark:border-nord2 bg-nord5 dark:bg-nord2 text-nord0 dark:text-nord6 focus:outline-none focus:ring-2 focus:ring-nord8 transition-colors resize-none"
              placeholder="Task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-nord0 dark:text-nord4 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-nord4 dark:border-nord2 bg-nord5 dark:bg-nord2 text-nord0 dark:text-nord6 focus:outline-none focus:ring-2 focus:ring-nord8 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nord0 dark:text-nord4 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-nord4 dark:border-nord2 bg-nord5 dark:bg-nord2 text-nord0 dark:text-nord6 focus:outline-none focus:ring-2 focus:ring-nord8 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-nord4 dark:border-nord2 text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-nord9 text-white hover:bg-nord9/90 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
