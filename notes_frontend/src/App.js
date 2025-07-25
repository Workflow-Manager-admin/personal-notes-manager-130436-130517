import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import NavigationBar from './components/NavigationBar';
import AuthForm from './components/AuthForm';
import NoteList from './components/NoteList';
import NoteModal from './components/NoteModal';
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiFetchNotes,
  apiCreateNote,
  apiUpdateNote,
  apiDeleteNote,
} from './api';

/**
 * App implements authentication (login/register/logout), 
 * notes listing, creation, edition, and deletion, with
 * live validation, persistent auth, and a responsive layout.
 * Now uses centralized api.js methods and decoupled UI components for robust frontend-backend integration.
 */

// PUBLIC_INTERFACE
function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Auth modals/forms
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [deletePendingId, setDeletePendingId] = useState(null);

  // New/Edit Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteModalError, setNoteModalError] = useState('');
  const [noteModalLoading, setNoteModalLoading] = useState(false);
  const [activeNote, setActiveNote] = useState({ id: null, title: '', content: '' });

  // Search
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const searchRef = useRef();

  // UI Theme
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const handleToggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // ---- AUTHENTICATION ----
  useEffect(() => {
    if (!token) {
      setUser(null);
      setNotes([]);
      localStorage.removeItem('token');
      return;
    }
    // Check login by attempting to fetch notes
    (async () => {
      try {
        await apiFetchNotes(token, '');
        setUser({ username: "user" }); // There's no profile endpoint
      } catch {
        handleLogout();
      }
    })();
    // eslint-disable-next-line
  }, [token]);

  const handleLoginModal = () => {
    setShowLogin(true);
    setShowRegister(false);
    setAuthError('');
  };
  const handleRegisterModal = () => {
    setShowRegister(true);
    setShowLogin(false);
    setAuthError('');
  };
  // Login
  const handleLogin = async ({ username, password }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const resp = await apiLogin({ username, password });
      setToken(resp.token);
      localStorage.setItem('token', resp.token);
      setShowLogin(false);
      setUser({ username });
    } catch (err) {
      setAuthError(err.detail || 'Invalid credentials');
    }
    setAuthLoading(false);
  };
  // Register
  const handleRegister = async ({ username, password }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await apiRegister({ username, password });
      setShowRegister(false);
      handleLoginModal();
    } catch (err) {
      setAuthError(err.detail || 'Registration failed');
    }
    setAuthLoading(false);
  };
  // Logout
  const handleLogout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    try {
      await apiLogout(token); // fire & forget
    } catch {}
    setNotes([]);
  };

  // ---- NOTES ----
  // Fetch notes (debounced search or on login)
  useEffect(() => {
    if (!token) {
      setNotes([]);
      return;
    }
    setNotesLoading(true);
    setNotesError('');
    apiFetchNotes(token, searchDebounced)
      .then(data => {
        setNotes(data || []);
        setNotesError('');
      })
      .catch(() => {
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

  // New/Edit Modal Handlers
  const openNewNoteModal = () => {
    setShowNoteModal(true);
    setIsEditingNote(false);
    setNoteModalError('');
    setActiveNote({ id: null, title: '', content: '' });
  };
  const openEditNoteModal = (note) => {
    setShowNoteModal(true);
    setIsEditingNote(true);
    setNoteModalError('');
    setActiveNote({ id: note.id, title: note.title, content: note.content || '' });
  };
  const closeNoteModal = () => {
    setShowNoteModal(false);
    setNoteModalError('');
    setActiveNote({ id: null, title: '', content: '' });
    setNoteModalLoading(false);
  };
  // Create/Update Note (modal submit)
  const handleNoteModalSubmit = async (form) => {
    setNoteModalLoading(true);
    setNoteModalError('');
    try {
      if (isEditingNote) {
        await apiUpdateNote(token, activeNote.id, { title: form.title.trim(), content: form.content });
      } else {
        await apiCreateNote(token, { title: form.title.trim(), content: form.content });
      }
      closeNoteModal();
      // Refresh notes
      setSearchDebounced(s => s + '');
    } catch (err) {
      setNoteModalError(
        err?.title?.[0] || err?.detail || 'Failed to save note'
      );
    }
    setNoteModalLoading(false);
  };
  // Delete Note
  const handleNoteDelete = async (note) => {
    setDeletePendingId(note.id);
    try {
      await apiDeleteNote(token, note.id);
      setSearchDebounced(s => s + '');
    } catch {
      alert('Failed to delete note');
    }
    setDeletePendingId(null);
  };

  // ---- RENDER ----
  return (
    <div className="App">
      {/* NavigationBar */}
      <NavigationBar
        user={user}
        onLogin={handleLoginModal}
        onLogout={handleLogout}
        onRegister={handleRegisterModal}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="container" style={containerStyle}>
        {!user ? (
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <h2>Welcome to NotesApp!</h2>
            <p>Please log in or register to access your notes.</p>
          </div>
        ) : (
          <>
            {/* Search/add toolbar */}
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
            {/* NoteList */}
            <NoteList
              notes={notes}
              isLoading={notesLoading}
              error={notesError}
              onEdit={openEditNoteModal}
              onDelete={handleNoteDelete}
              deletePendingId={deletePendingId}
            />
          </>
        )}
      </main>
      {/* Auth Modals */}
      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <h3>Login</h3>
          <AuthForm
            mode="login"
            onSubmit={handleLogin}
            onClose={() => setShowLogin(false)}
            error={authError}
            isLoading={authLoading}
          />
          <div style={{ marginTop: 15, fontSize: 13 }}>
            Don't have an account?{' '}
            <span
              style={{ color: "#1976D2", cursor: "pointer" }}
              onClick={() => { setShowLogin(false); setTimeout(() => setShowRegister(true), 100); }}
            >
              Register here
            </span>
          </div>
        </Modal>
      )}
      {showRegister && (
        <Modal onClose={() => setShowRegister(false)}>
          <h3>Register</h3>
          <AuthForm
            mode="register"
            onSubmit={handleRegister}
            onClose={() => setShowRegister(false)}
            error={authError}
            isLoading={authLoading}
          />
          <div style={{ marginTop: 15, fontSize: 13 }}>
            Already have an account?{' '}
            <span
              style={{ color: "#1976D2", cursor: "pointer" }}
              onClick={() => { setShowRegister(false); setTimeout(() => setShowLogin(true), 100); }}
            >
              Login here
            </span>
          </div>
        </Modal>
      )}
      {/* Note modal for edit/new */}
      <NoteModal
        initialNote={activeNote}
        isOpen={showNoteModal}
        isEditing={isEditingNote}
        error={noteModalError}
        isLoading={noteModalLoading}
        onSubmit={handleNoteModalSubmit}
        onCancel={closeNoteModal}
      />
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
