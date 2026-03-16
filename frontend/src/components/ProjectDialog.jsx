import { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Trash2, Download } from 'lucide-react';
import { downloadFile } from '../api/files.js';
import CountrySelect from './CountrySelect.jsx';

const statusOptions = ['New', 'InProgress', 'Done', 'On Hold'];

export default function ProjectDialog({ open, project, onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'New', startDate: '', endDate: '', deadline: '', country: '' });
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'Active',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        deadline: project.deadline || '',
        country: project.country || '',
      });
      setExistingFiles(project.files || []);
    } else {
      setForm({ title: '', description: '', status: 'New', startDate: new Date().toISOString().split('T')[0], endDate: '', deadline: '', country: '' });
      setExistingFiles([]);
    }
    setFiles([]);
    setFilesToDelete([]);
  }, [project, open]);

  if (!open) return null;

  const isEdit = !!project;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileSelect(e) {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  }

  function removeNewFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingFile(fileId) {
    setFilesToDelete((prev) => [...prev, fileId]);
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, newFiles: files, filesToDelete });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-backdrop" onClick={onCancel}>
      <div
        className="bg-nord6 dark:bg-nord1 rounded-xl border border-nord4 dark:border-nord2 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-nord4 dark:border-nord2">
          <h2 className="text-lg font-semibold text-nord0 dark:text-nord6">
            {isEdit ? 'Edit Project' : 'New Project'}
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
              placeholder="Project title"
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
              placeholder="Project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nord0 dark:text-nord4 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-nord4 dark:border-nord2 bg-nord5 dark:bg-nord2 text-nord0 dark:text-nord6 focus:outline-none focus:ring-2 focus:ring-nord8 transition-colors"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s === 'InProgress' ? 'In Progress' : s === 'OnHold' ? 'On Hold' : s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-nord0 dark:text-nord4 mb-1">Country</label>
            <CountrySelect
              value={form.country}
              onChange={(code) => setForm((prev) => ({ ...prev, country: code }))}
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

          <div>
            <label className="block text-sm font-medium text-nord0 dark:text-nord4 mb-1">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-nord4 dark:border-nord2 bg-nord5 dark:bg-nord2 text-nord0 dark:text-nord6 focus:outline-none focus:ring-2 focus:ring-nord8 transition-colors"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-nord0 dark:text-nord4 mb-1">Attachments</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-nord3 dark:border-nord3 text-nord3 dark:text-nord4 hover:border-nord8 hover:text-nord8 transition-colors text-sm"
            >
              <Upload size={16} />
              Choose files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Existing files */}
            {existingFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {existingFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm text-nord3 dark:text-nord4 bg-nord5/50 dark:bg-nord2/50 rounded-lg px-2 py-1">
                    <FileText size={14} />
                    <a
                      href={downloadFile(f.id)}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 truncate hover:text-nord8 transition-colors"
                      title={`Download ${f.originalName}`}
                    >
                      {f.originalName}
                    </a>
                    <a
                      href={downloadFile(f.id)}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="text-nord9 hover:text-nord8 transition-colors"
                      title="Download"
                    >
                      <Download size={14} />
                    </a>
                    <button type="button" onClick={() => removeExistingFile(f.id)} className="text-nord11 hover:text-nord11/80">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New files */}
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-nord8 bg-nord8/10 rounded-lg px-2 py-1">
                    <FileText size={14} />
                    <span className="flex-1 truncate">{f.name}</span>
                    <button type="button" onClick={() => removeNewFile(i)} className="text-nord11 hover:text-nord11/80">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
