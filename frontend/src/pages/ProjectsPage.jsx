import { useState, useEffect } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectDialog from '../components/ProjectDialog.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { fetchProjects, createProject, updateProject, deleteProject } from '../api/projects.js';
import { uploadProjectFiles, fetchProjectFiles, deleteFile } from '../api/files.js';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleSave(formData) {
    try {
      const { newFiles, filesToDelete, ...projectData } = formData;

      if (editProject) {
        await updateProject(editProject.id, projectData);
        // Delete removed files
        if (filesToDelete?.length > 0) {
          await Promise.all(filesToDelete.map((id) => deleteFile(id)));
        }
        // Upload new files
        if (newFiles?.length > 0) {
          await uploadProjectFiles(editProject.id, newFiles);
        }
      } else {
        const created = await createProject(projectData);
        if (newFiles?.length > 0) {
          await uploadProjectFiles(created.id, newFiles);
        }
      }

      setDialogOpen(false);
      setEditProject(null);
      loadProjects();
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  }

  async function handleEdit(project) {
    try {
      const files = await fetchProjectFiles(project.id);
      setEditProject({ ...project, files });
      setDialogOpen(true);
    } catch (err) {
      console.error('Failed to load project files:', err);
      setEditProject(project);
      setDialogOpen(true);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteProject(confirmDelete.id);
      setConfirmDelete(null);
      loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-nord0 dark:text-nord6">Projects</h2>
        <button
          onClick={() => { setEditProject(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nord9 text-white font-medium text-sm hover:bg-nord9/90 transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-nord3 dark:text-nord4">
          <FolderOpen size={48} className="mb-3 opacity-50" />
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={setConfirmDelete}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        project={editProject}
        onSave={handleSave}
        onCancel={() => { setDialogOpen(false); setEditProject(null); }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This will also delete all tasks and files.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
