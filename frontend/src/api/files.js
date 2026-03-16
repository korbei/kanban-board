import { get, del, postFormData } from './client.js';

export function fetchProjectFiles(projectId) {
  return get(`/projects/${projectId}/files`);
}

export function uploadProjectFiles(projectId, files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  return postFormData(`/projects/${projectId}/files`, formData);
}

export function downloadFile(fileId) {
  return `/api/files/${fileId}/download`;
}

export function deleteFile(fileId) {
  return del(`/files/${fileId}`);
}
