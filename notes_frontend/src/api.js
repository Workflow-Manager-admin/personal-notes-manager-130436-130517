/**
 * api.js: Centralizes communication with the backend Django REST API.
 * Handles authentication (login/register/logout) and CRUD for notes.
 */

const API_BASE = "/api";

// PUBLIC_INTERFACE
/**
 * Login with username and password, returns {token}
 */
export async function apiLogin({ username, password }) {
  return fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(async (r) => {
    if (!r.ok) throw await r.json();
    return r.json();
  });
}

// PUBLIC_INTERFACE
/**
 * Register new user, returns status
 */
export async function apiRegister({ username, password }) {
  return fetch(`${API_BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(async (r) => {
    if (!r.ok) throw await r.json();
    return r.json();
  });
}

/**
 * Logout (optional, for invalidating on backend)
 * @param {string} token
 */
export async function apiLogout(token) {
  return fetch(`${API_BASE}/logout/`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Token ${token}` } : {}
  }).then(() => {});
}

// PUBLIC_INTERFACE
/**
 * Fetch notes (optionally with search), returns a list of notes
 * @param {string} token Authorization token
 * @param {string?} search Search query
 */
export async function apiFetchNotes(token, search = "") {
  let url = `${API_BASE}/notes/`;
  if (search) url += `?search=${encodeURIComponent(search)}`;
  const r = await fetch(url, {
    headers: { 'Authorization': `Token ${token}` }
  });
  if (!r.ok) throw new Error('Failed to fetch notes');
  return r.json();
}

// PUBLIC_INTERFACE
/**
 * Create a note
 */
export async function apiCreateNote(token, { title, content }) {
  const r = await fetch(`${API_BASE}/notes/`, {
    method: 'POST',
    headers: {
      'Content-Type': "application/json",
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({ title, content })
  });
  if (!r.ok) throw await r.json();
  return r.json();
}

// PUBLIC_INTERFACE
/**
 * Update an existing note
 */
export async function apiUpdateNote(token, noteId, { title, content }) {
  const r = await fetch(`${API_BASE}/notes/${noteId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': "application/json",
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({ title, content })
  });
  if (!r.ok) throw await r.json();
  return r.json();
}

// PUBLIC_INTERFACE
/**
 * Delete a note
 */
export async function apiDeleteNote(token, noteId) {
  const r = await fetch(`${API_BASE}/notes/${noteId}/`, {
    method: "DELETE",
    headers: { 'Authorization': `Token ${token}` }
  });
  if (!r.ok) throw new Error('Failed to delete note');
  return true;
}
