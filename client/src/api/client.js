// src/api/client.js
const BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 
  (import.meta.env.PROD ? 'https://blogaxis.onrender.com' : '/api');

// Remove trailing /api if it exists to prevent double /api/api paths
const cleanBase = BASE.endsWith('/api') ? BASE.slice(0, -4) : BASE;

// Debug log for production
if (import.meta.env.PROD) {
  console.log('Original BASE:', BASE);
  console.log('Cleaned BASE:', cleanBase);
  console.log('Frontend deployed at:', new Date().toISOString());
}

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const api = {
  get: async (path) => {
    const url = `${cleanBase}/api${path}`;
    if (import.meta.env.PROD) {
      console.log('Making GET request to:', url);
    }
    const res = await fetch(url, { headers: { ...authHeader() } });
    if (import.meta.env.PROD) {
      console.log('Response status:', res.status, 'for URL:', url);
    }
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

  del: (path, body) =>
    fetch(`${cleanBase}/api${path}`, { 
      method: 'DELETE', 
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: body ? JSON.stringify(body) : undefined
    }),
};