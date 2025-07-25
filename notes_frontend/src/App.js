import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * App implements authentication (login/register/logout), 
 * notes listing, creation, edition, and deletion, with
 * live validation, persistent auth, and a responsive layout.
 */

// PUBLIC_INTERFACE
function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Auth modal/dialog state
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Auth form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Notes state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');

  // Note editor modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ id: null, title: '', content: '' });
  const [noteFormError, setNoteFormError] = useState('');
  const [noteDeletePending, setNoteDeletePending] = useState(null);

  // Search
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const searchRef = useRef();

  // UI theme
  const [theme, setTheme] = useState('light');

  // Backend endpoint base
  const API_BASE = '/api';

  // ---- THEME
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // ---- AUTHENTICATION
  useEffect(() => {
    if (token) {
      // Try fetching user profile OR any simple authenticated req to check validity
      fetchMe(token).then(res => {
        if (res) setUser(res);
        else handleLogout();
      });
    } else {
      setUser(null);
    }
    // eslint-disable-next-line
  }, [token]);
  function handleLoginModal(open = true) {
    setShowLogin(open);
    setAuthError('');
    setLoginForm({ username: '', password: '' });
  }
  function handleRegisterModal(open = true) {
    setShowRegister(open);
    setAuthError('');
    setRegisterForm({ username: '', password: '' });
  }
  function handleLoginSubmit(e) {
    e.preventDefault();
    setAuthError('');
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setAuthError('Please fill in all fields');
      return;
    }
    // POST /login/
    fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginForm.username, password: loginForm.password })
    })
      .then(r => r.ok ? r.json() : r.json().then(data => Promise.reject(data)))
      .then(data => {
        // If backend returns token, store it
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
          setShowLogin(false);
        } else {
          setAuthError('Invalid credentials');
        }
      })
      .catch(err => {
        setAuthError('Login failed: ' + (err.detail || 'Invalid credentials'));
      });
  }
  function handleRegisterSubmit(e) {
    e.preventDefault();
    setAuthError('');
    if (!registerForm.username.trim() || !registerForm.password.trim()) {
      setAuthError('Please fill in all fields');
      return;
    }
    // POST /register/
    fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: registerForm.username, password: registerForm.password })
    })
      .then(r => r.ok ? r.json() : r.json().then(data => Promise.reject(data)))
      .then(data => {
        // Auto-login after registration
        handleLoginModal(true);
        setRegisterForm({ username: '', password: '' });
        setShowRegister(false);
      })
      .catch(err => {
        setAuthError('Registration failed: ' + (err.detail || 'Try another username'));
      });
  }
  // Logout
  function handleLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    // Optionally: call /logout/
    fetch(`${API_BASE}/logout/`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Token ${token}` } : {}
    }).catch(() => {});
  }

  async function fetchMe(_token) {
    // There may not be a profile endpoint; as a workaround, load notes with auth to check
    return fetch(`${API_BASE}/notes/`, {
      headers: { 'Authorization': `Token ${_token}` }
    })
      .then(r => r.ok ? { username: 'user' } : null)
      .catch(() => null);
  }

  // ---- NOTES
  // List notes (with search), whenever logged in or search changes
  useEffect(() => {
    if (!token) {
      setNotes([]);
      return;
    }
    setNotesLoading(true);
    let url = `${API_BASE}/notes/`;
    if (searchDebounced) url += `?search=${encodeURIComponent(searchDebounced)}`;
    fetch(url, {
      headers: { 'Authorization': `Token ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to fetch notes'))
      .then(data => {
        setNotes(data || []);
        setNotesError('');
      })
      .catch((e) => {
        setNotes([]);
        setNotesError('Failed to fetch notes');
      })
      .finally(() => setNotesLoading(false));
  }, [token, searchDebounced]);

  // Debounce search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setSearchDebounced(search), 300);
    return () => searchRef.current && clearTimeout(searchRef.current);
  }, [search]);

  function openNewNoteModal() {
    setIsEditingNote(false);
    setNoteForm({ id: null, title: '', content: '' });
    setNoteFormError('');
    setShowNoteModal(true);
  }
  function openEditNoteModal(note) {
    setIsEditingNote(true);
    setNoteForm({ id: note.id, title: note.title || '', content: note.content || '' });
    setNoteFormError('');
    setShowNoteModal(true);
  }
  function closeNoteModal() {
    setShowNoteModal(false);
    setNoteFormError('');
  }
  function handleNoteFormChange(e) {
    const { name, value } = e.target;
    setNoteForm(f => ({ ...f, [name]: value }));
    if (name === 'title' && value.length < 1) {
      setNoteFormError('Title is required');
    } else {
      setNoteFormError('');
    }
  }
  function handleNoteFormSubmit(e) {
    e.preventDefault();
    if (!noteForm.title.trim()) {
      setNoteFormError('Title is required');
      return;
    }
    const method = isEditingNote ? 'PUT' : 'POST';
    const url = isEditingNote ? `${API_BASE}/notes/${noteForm.id}/` : `${API_BASE}/notes/`;
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ title: noteForm.title.trim(), content: noteForm.content }),
    })
      .then(r => r.ok ? r.json() : r.json().then(data => Promise.reject(data)))
      .then(data => {
        closeNoteModal();
        // Refresh notes
        setSearchDebounced(s => s + '');
      })
      .catch(err => {
        setNoteFormError('Failed to save note: ' + (err?.title?.[0] || err?.detail || 'Unknown error'));
      });
  }
  function handleNoteDelete(note) {
    setNoteDeletePending(note.id);
    fetch(`${API_BASE}/notes/${note.id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
      .then(r => {
        setNoteDeletePending(null);
        setSearchDebounced(s => s + '');
      })
      .catch(() => {
        setNoteDeletePending(null);
        alert('Failed to delete note');
      });
  }

  // ---- RENDER

  return (
    <div className="App">
      {/* NAVBAR */}
      <nav className="navbar" style={navbarStyle}>
        <div className="navbar-brand">
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1976D2', letterSpacing: 1 }}>📝 NotesApp</span>
        </div>
        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <>
              <span style={userLabelStyle}>Hello!</span>
              <button className="btn" style={linkBtnStyle} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn" style={linkBtnStyle} onClick={() => handleLoginModal(true)}>Login</button>
              <button className="btn" style={linkBtnStyle} onClick={() => handleRegisterModal(true)}>Register</button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="container" style={containerStyle}>
        {!user ? (
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <h2>Welcome to NotesApp!</h2>
            <p>Please log in or register to access your notes.</p>
          </div>
        ) : (
          <>
            {/* SEARCH and ADD */}
            <div className="notes-toolbar" style={toolbarStyle}>
              <input
                type="text"
                className="notes-search"
                placeholder="Search notes..."
                style={searchInputStyle}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="btn btn-accent" style={accentBtnStyle} onClick={openNewNoteModal}>+ New Note</button>
            </div>
            {/* NOTE LIST */}
            {notesLoading ? (
              <div>Loading notes...</div>
            ) : notesError ? (
              <div style={{ color: 'red' }}>{notesError}</div>
            ) : notes.length === 0 ? (
              <div>No notes found.</div>
            ) : (
              <div className="notes-list" style={notesListStyle}>
                {notes.map(note => (
                  <div className="note-card" key={note.id} style={noteCardStyle}>
                    <h4 style={noteTitleStyle}>{note.title}</h4>
                    <div style={noteContentStyle}>
                      {note.content ? note.content : <span style={{ opacity: 0.6, fontStyle: 'italic' }}>No content</span>}
                    </div>
                    <div style={noteMetaStyle}>
                      <div style={{ fontSize: 12, color: '#888' }}>
                        {note.updated_at ? new Date(note.updated_at).toLocaleString() : ''}
                      </div>
                      <div>
                        <button className="btn" style={noteBtnStyle}
                          onClick={() => openEditNoteModal(note)}>Edit</button>
                        <button className="btn" style={{ ...noteBtnStyle, color: '#d32f2f' }}
                          disabled={noteDeletePending === note.id}
                          onClick={() => handleNoteDelete(note)}>
                          {noteDeletePending === note.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* LOGIN MODAL */}
      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <h3>Login</h3>
          <form onSubmit={handleLoginSubmit} style={modalFormStyle}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={loginForm.username}
              autoFocus
              autoComplete="username"
              onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              style={inputStyle}
            />
            {authError && <div style={errorTextStyle}>{authError}</div>}
            <button className="btn btn-accent" type="submit" style={accentBtnStyle}>Log In</button>
            <div style={{ marginTop: 10, fontSize: 13 }}>
              Don't have an account?{' '}
              <span
                style={{ color: "#1976D2", cursor: "pointer" }}
                onClick={() => { setShowLogin(false); setTimeout(() => setShowRegister(true), 100) }}>
                Register here
              </span>
            </div>
          </form>
        </Modal>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <Modal onClose={() => setShowRegister(false)}>
          <h3>Register</h3>
          <form onSubmit={handleRegisterSubmit} style={modalFormStyle}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={registerForm.username}
              autoFocus
              autoComplete="username"
              onChange={e => setRegisterForm(f => ({ ...f, username: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Password"
              value={registerForm.password}
              onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
              style={inputStyle}
            />
            {authError && <div style={errorTextStyle}>{authError}</div>}
            <button className="btn btn-accent" type="submit" style={accentBtnStyle}>Register</button>
            <div style={{ marginTop: 10, fontSize: 13 }}>
              Already have an account?{' '}
              <span
                style={{ color: "#1976D2", cursor: "pointer" }}
                onClick={() => { setShowRegister(false); setTimeout(() => setShowLogin(true), 100) }}>
                Login here
              </span>
            </div>
          </form>
        </Modal>
      )}

      {/* NOTE EDIT/CREATE MODAL */}
      {showNoteModal && (
        <Modal onClose={closeNoteModal}>
          <h3>{isEditingNote ? 'Edit Note' : 'Create Note'}</h3>
          <form onSubmit={handleNoteFormSubmit} style={modalFormStyle}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              maxLength={255}
              autoFocus
              value={noteForm.title}
              onChange={handleNoteFormChange}
              style={inputStyle}
              required
            />
            <textarea
              name="content"
              placeholder="Content"
              rows={5}
              value={noteForm.content}
              onChange={handleNoteFormChange}
              style={textareaStyle}
            />
            {noteFormError && <div style={errorTextStyle}>{noteFormError}</div>}
            <div style={{ display: 'flex', gap: '1em', marginTop: 16 }}>
              <button className="btn btn-accent" type="submit" style={accentBtnStyle}>{isEditingNote ? 'Save' : 'Create'}</button>
              <button className="btn" type="button" style={linkBtnStyle} onClick={closeNoteModal}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// -- Reusable Modal component (not PUBLIC_INTERFACE as internal)
function Modal({ children, onClose }) {
  useEffect(() => {
    const escHandler = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
    //eslint-disable-next-line
  }, []);
  return (
    <div className="modal-backdrop" style={modalBackdropStyle} tabIndex={-1}>
      <div className="modal" style={modalStyle}>
        <button className="btn" style={modalCloseStyle} onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}

// ---- STYLES (inline for clarity, included in README for reference)
const navbarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.5rem 2vw',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-color)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};
const userLabelStyle = { margin: '0 1em', color: '#333', fontSize: 15 };
const linkBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#1976D2',
  fontWeight: 600,
  padding: '7px 14px',
  cursor: 'pointer',
  borderRadius: 6,
  transition: 'background 0.2s',
};
const accentBtnStyle = {
  background: '#FFB300',
  color: '#1a1a1a',
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  fontWeight: 600,
  cursor: 'pointer',
  marginLeft: 8,
  fontSize: 15,
};
const containerStyle = { maxWidth: 690, margin: '2rem auto', padding: 12 };
const toolbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 18,
  gap: 10,
};
const searchInputStyle = {
  flex: 1,
  padding: '9px 12px',
  fontSize: 15,
  border: '1px solid var(--border-color)',
  borderRadius: 8,
  outline: 'none',
};
const notesListStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
  gap: '1rem',
};
const noteCardStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 13,
  padding: 16,
  minHeight: 110,
  boxShadow: '0 2px 7px 0 rgba(0,0,0,0.07)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
};
const noteTitleStyle = {
  fontWeight: 600,
  fontSize: 18,
  margin: 0,
  color: '#1976D2',
  marginBottom: 3,
};
const noteContentStyle = {
  flex: 1,
  minHeight: 40,
  fontSize: 15,
  marginBottom: 10,
};
const noteMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginTop: 6,
  fontSize: 13,
};
const noteBtnStyle = {
  margin: '0 2px',
  fontWeight: 600,
  padding: '5px 12px',
  border: 'none',
  background: '#e3e3e3',
  borderRadius: 7,
  cursor: 'pointer',
};
const modalBackdropStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.35)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const modalStyle = {
  background: 'white',
  padding: '2.0rem 1.2rem 1.2rem 1.2rem',
  borderRadius: 12,
  minWidth: 270,
  maxWidth: 370,
  width: '96vw',
  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
  position: 'relative',
};
const modalFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 13,
  marginTop: 21,
};
const inputStyle = {
  padding: '8px',
  fontSize: 15,
  borderRadius: 7,
  border: '1px solid var(--border-color)',
  marginBottom: 4,
  background: 'var(--bg-primary)'
};
const textareaStyle = { ...inputStyle, minHeight: 80, resize: 'vertical' };
const modalCloseStyle = {
  position: 'absolute', top: 12, right: 16, background: 'none', border: 'none',
  fontSize: 23, color: '#888', cursor: 'pointer'
};
const errorTextStyle = { color: '#d32f2f', margin: "4px 0", fontSize: 14 };

export default App;
