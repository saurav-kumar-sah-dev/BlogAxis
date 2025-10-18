// src/api/client.js
const BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const api = {
  get: async (path) => {
    const res = await fetch(`${BASE}${path}`, { headers: { ...authHeader() } });
    return res;
  },

  post: (path, body, isFormData = false) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: isFormData
        ? { ...authHeader() } // browser sets Content-Type + boundary for FormData
        : { 'Content-Type': 'application/json', ...authHeader() },
      body: isFormData ? body : JSON.stringify(body),
    }),

  put: (path, body, isFormData = false) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: isFormData
        ? { ...authHeader() }
        : { 'Content-Type': 'application/json', ...authHeader() },
      body: isFormData ? body : JSON.stringify(body),
    }),

  del: (path) =>
    fetch(`${BASE}${path}`, { method: 'DELETE', headers: { ...authHeader() } }),
};