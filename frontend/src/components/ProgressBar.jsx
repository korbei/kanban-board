export default function ProgressBar({ completed, total }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-nord3 dark:text-nord4">
          {completed}/{total} tasks
        </span>
        <span className="text-xs font-medium text-nord3 dark:text-nord4">
          {percent}%
        </span>
      </div>
      <div className="w-full h-2 bg-nord4 dark:bg-nord2 rounded-full overflow-hidden">
        <div
          className="h-full bg-nord14 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
