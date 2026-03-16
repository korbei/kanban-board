import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard.jsx';

const columnConfig = {
  New: { accent: 'bg-nord9', label: 'New' },
  InProgress: { accent: 'bg-nord13', label: 'In Progress' },
  Done: { accent: 'bg-nord14', label: 'Done' },
};

export default function TaskColumn({ status, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const config = columnConfig[status] || columnConfig.New;

  return (
    <div className="flex flex-col bg-nord5/50 dark:bg-nord1/50 rounded-xl border border-nord4 dark:border-nord2 min-h-[400px]">
      {/* Column header */}
      <div className="p-4 border-b border-nord4 dark:border-nord2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${config.accent}`} />
            <h3 className="font-semibold text-nord0 dark:text-nord6">{config.label}</h3>
            <span className="text-xs font-medium text-nord3 dark:text-nord4 bg-nord4/50 dark:bg-nord2/50 rounded-full px-2 py-0.5">
              {tasks.length}
            </span>
          </div>
          {status === 'New' && (
            <button
              onClick={onAddTask}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nord14 text-nord0 text-sm font-medium hover:bg-nord14/85 transition-colors shadow-sm"
              title="Add new task"
            >
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-2 transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-nord8/5 dark:bg-nord8/5' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <TaskCard
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    provided={dragProvided}
                    isDragging={dragSnapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
