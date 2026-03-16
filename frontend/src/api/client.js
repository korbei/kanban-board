const BASE_URL = '/api';

async function request(url, options = {}) {
  const config = {
    headers: {},
    ...options,
  };

  if (config.body && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response;
}

export function get(url) {
  return request(url, { method: 'GET' });
}

export function post(url, body) {
  return request(url, { method: 'POST', body });
}

export function put(url, body) {
  return request(url, { method: 'PUT', body });
}

export function del(url) {
  return request(url, { method: 'DELETE' });
}

export function postFormData(url, formData) {
  return request(url, { method: 'POST', body: formData });
}
