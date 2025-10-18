// src/api/client.js
const BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

// Remove trailing /api if it exists to prevent double /api/api paths
const cleanBase = BASE.endsWith('/api') ? BASE.slice(0, -4) : BASE;

// Debug log for production
if (import.meta.env.PROD) {
  console.log('API Base URL:', cleanBase);
  console.log('Frontend deployed at:', new Date().toISOString());
}

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const api = {
  get: async (path) => {
    const res = await fetch(`${cleanBase}/api${path}`, { headers: { ...authHeader() } });
    return res;
  },

  post: (path, body, isFormData = false) =>
    fetch(`${cleanBase}/api${path}`, {
      method: 'POST',
      headers: isFormData
        ? { ...authHeader() } // browser sets Content-Type + boundary for FormData
        : { 'Content-Type': 'application/json', ...authHeader() },
      body: isFormData ? body : JSON.stringify(body),
    }),

  put: (path, body, isFormData = false) =>
    fetch(`${cleanBase}/api${path}`, {
      method: 'PUT',
      headers: isFormData
        ? { ...authHeader() }
        : { 'Content-Type': 'application/json', ...authHeader() },
      body: isFormData ? body : JSON.stringify(body),
    }),

  del: (path) =>
    fetch(`${cleanBase}/api${path}`, { method: 'DELETE', headers: { ...authHeader() } }),
};