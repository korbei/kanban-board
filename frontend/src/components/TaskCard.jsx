import { Calendar, Pencil, Trash2 } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TaskCard({ task, onEdit, onDelete, provided, isDragging }) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`group relative bg-nord6 dark:bg-nord1 rounded-lg border border-nord4 dark:border-nord2 p-3 transition-all duration-150 ${
        isDragging ? 'shadow-lg ring-2 ring-nord8/50 rotate-1' : 'hover:shadow-md'
      }`}
    >
      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          className="p-1.5 rounded-lg text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50 hover:text-nord9 transition-colors"
          title="Edit task"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          className="p-1.5 rounded-lg text-nord3 dark:text-nord4 hover:bg-nord11/10 hover:text-nord11 transition-colors"
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h4 className="text-sm font-medium text-nord0 dark:text-nord6 pr-12 line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 text-xs text-nord3 dark:text-nord4 line-clamp-2">
          {task.description}
        </p>
      )}

      {(task.startDate || task.endDate) && (
        <div className="mt-2 flex items-center gap-1 text-xs text-nord3 dark:text-nord4">
          <Calendar size={10} />
          <span>
            {formatDate(task.startDate)}
            {task.startDate && task.endDate && ' - '}
            {formatDate(task.endDate)}
          </span>
        </div>
      )}
    </div>
  );
}
