import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, Clock, Pencil, Trash2, Paperclip, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { downloadFile } from '../api/files.js';
import { fetchProjectFiles } from '../api/files.js';
import { countries, countryFlag } from '../data/countries.js';
import ProgressBar from './ProgressBar.jsx';

const statusConfig = {
  New: { bg: 'bg-nord9', text: 'text-white', label: 'New' },
  Active: { bg: 'bg-nord10', text: 'text-white', label: 'Active' },
  InProgress: { bg: 'bg-nord13', text: 'text-nord0', label: 'In Progress' },
  Done: { bg: 'bg-nord14', text: 'text-nord0', label: 'Done' },
  'On Hold': { bg: 'bg-nord12', text: 'text-white', label: 'On Hold' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isDeadlineWithinWeek(deadlineStr) {
  if (!deadlineStr) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);
  const diffMs = deadline - now;
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const status = statusConfig[project.status] || statusConfig.New;
  const urgent = project.status !== 'Done' && isDeadlineWithinWeek(project.deadline);
  const [filesOpen, setFilesOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesLoaded, setFilesLoaded] = useState(false);

  async function toggleFiles(e) {
    e.stopPropagation();
    if (!filesOpen && !filesLoaded) {
      try {
        const data = await fetchProjectFiles(project.id);
        setFiles(data);
        setFilesLoaded(true);
      } catch (err) {
        console.error('Failed to load files:', err);
      }
    }
    setFilesOpen((prev) => !prev);
  }

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}/tasks`)}
      className={`group flex flex-col rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${urgent ? 'bg-nord11/15 dark:bg-nord11/20 border-nord11/50 dark:border-nord11/40 hover:border-nord11/70 dark:hover:border-nord11/60' : 'bg-nord6 dark:bg-nord1 border-nord4 dark:border-nord2 hover:border-nord8/50 dark:hover:border-nord8/30'}`}
    >
      {/* Card body */}
      <div className="p-5 flex-1">
        {/* Title + Status */}
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-nord0 dark:text-nord6 line-clamp-1 flex-1 min-w-0">
            {project.title}
          </h3>
          <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>

        {/* Country + Description */}
        {project.country && (
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-nord0 dark:text-nord4">
            <span className="text-base">{countryFlag(project.country)}</span>
            <span>{countries.find((c) => c.code === project.country)?.name}</span>
          </div>
        )}
        <p className="mt-1 text-sm text-nord3 dark:text-nord4 line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description'}
        </p>

        {/* Date range */}
        {(project.startDate || project.endDate) && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-nord3 dark:text-nord4">
            <Calendar size={12} />
            <span>
              {formatDate(project.startDate)}
              {project.startDate && project.endDate && ' - '}
              {formatDate(project.endDate)}
            </span>
          </div>
        )}

        {/* Deadline */}
        {project.deadline && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-nord11 dark:text-nord12 font-medium">
            <Clock size={12} />
            <span>Deadline: {formatDate(project.deadline)}</span>
          </div>
        )}

        {/* Attachments */}
        <div className="mt-3">
          <button
            onClick={toggleFiles}
            className="flex items-center gap-1.5 text-xs text-nord3 dark:text-nord4 hover:text-nord8 dark:hover:text-nord8 transition-colors"
          >
            <Paperclip size={12} />
            <span>Attachments</span>
            {filesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {filesOpen && (
            <div className="mt-1.5 space-y-1">
              {files.length === 0 ? (
                <p className="text-xs text-nord3 dark:text-nord4 italic pl-4">No files attached</p>
              ) : (
                files.map((f) => (
                  <a
                    key={f.id}
                    href={downloadFile(f.id)}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs text-nord9 hover:text-nord8 transition-colors pl-4 py-0.5"
                    title={`Download ${f.originalName}`}
                  >
                    <Download size={11} />
                    <span className="truncate">{f.originalName}</span>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-3">
          <ProgressBar completed={project.completedTasks || 0} total={project.totalTasks || 0} />
        </div>
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-end gap-1 px-5 py-3 border-t border-nord4 dark:border-nord2">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(project); }}
          className="p-1.5 rounded-lg text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50 hover:text-nord9 transition-colors"
          title="Edit project"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(project); }}
          className="p-1.5 rounded-lg text-nord3 dark:text-nord4 hover:bg-nord11/10 hover:text-nord11 transition-colors"
          title="Delete project"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
