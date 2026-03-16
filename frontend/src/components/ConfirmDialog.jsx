import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-backdrop" onClick={onCancel}>
      <div
        className="bg-nord6 dark:bg-nord1 rounded-xl border border-nord4 dark:border-nord2 shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-nord11/10 rounded-lg">
            <AlertTriangle size={20} className="text-nord11" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-nord0 dark:text-nord6">{title}</h3>
            <p className="mt-1 text-sm text-nord3 dark:text-nord4">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-nord4 dark:border-nord2 text-nord3 dark:text-nord4 hover:bg-nord4/50 dark:hover:bg-nord2/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-nord11 text-white hover:bg-nord11/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
