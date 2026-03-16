import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import TaskColumn from '../components/TaskColumn.jsx';
import TaskDialog from '../components/TaskDialog.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { fetchProject } from '../api/projects.js';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks.js';

const STATUSES = ['New', 'InProgress', 'Done'];

export default function TasksPage() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function loadData() {
    try {
      const [proj, taskList] = await Promise.all([
        fetchProject(projectId),
        fetchTasks(projectId),
      ]);
      setProject(proj);
      setTasks(taskList);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [projectId]);

  function getTasksByStatus(status) {
    return tasks.filter((t) => t.status === status);
  }

  async function handleDragEnd(result) {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = parseInt(draggableId);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(taskId, { ...task, status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      loadData(); // Revert on error
    }
  }

  async function handleSave(formData) {
    try {
      if (editTask) {
        await updateTask(editTask.id, formData);
      } else {
        await createTask(projectId, formData);
      }
      setDialogOpen(false);
      setEditTask(null);
      loadData();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteTask(confirmDelete.id);
      setConfirmDelete(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-nord8 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {project && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-nord0 dark:text-nord6">{project.title}</h2>
          {project.description && (
            <p className="mt-1 text-sm text-nord3 dark:text-nord4">{project.description}</p>
          )}
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
              onAddTask={() => { setEditTask(null); setDialogOpen(true); }}
              onEditTask={(task) => { setEditTask(task); setDialogOpen(true); }}
              onDeleteTask={setConfirmDelete}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskDialog
        open={dialogOpen}
        task={editTask}
        onSave={handleSave}
        onCancel={() => { setDialogOpen(false); setEditTask(null); }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
