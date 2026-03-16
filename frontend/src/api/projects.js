import { get, post, put, del } from './client.js';

export function fetchProjects() {
  return get('/projects');
}

export function fetchProject(id) {
  return get(`/projects/${id}`);
}

export function createProject(data) {
  return post('/projects', data);
}

export function updateProject(id, data) {
  return put(`/projects/${id}`, data);
}

export function deleteProject(id) {
  return del(`/projects/${id}`);
}
