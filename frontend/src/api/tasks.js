import { get, post, put, del } from './client.js';

export function fetchTasks(projectId) {
  return get(`/projects/${projectId}/tasks`);
}

export function createTask(projectId, data) {
  return post(`/projects/${projectId}/tasks`, data);
}

export function updateTask(id, data) {
  return put(`/tasks/${id}`, data);
}

export function deleteTask(id) {
  return del(`/tasks/${id}`);
}
