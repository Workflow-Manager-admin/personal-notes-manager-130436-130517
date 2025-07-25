import React from "react";

// PUBLIC_INTERFACE
/**
 * NavigationBar provides the fixed top navigation UI and controls theme, login/logout/register actions.
 * @param {{
 *   user: object,
 *   onLogin: function,
 *   onLogout: function,
 *   onRegister: function,
 *   theme: "light"|"dark",
 *   onToggleTheme: function
 * }} props
 */
function NavigationBar({ user, onLogin, onLogout, onRegister, theme, onToggleTheme }) {
  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 2vw",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}
    >
      <div className="navbar-brand">
        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1976D2', letterSpacing: 1 }}>📝 NotesApp</span>
      </div>
      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {user ? (
          <>
            <span style={{ margin: "0 1em", color: "#333", fontSize: 15 }}>Hello!</span>
            <button className="btn" style={{
              background: "transparent",
              border: "none",
              color: "#1976D2",
              fontWeight: 600,
              padding: "7px 14px",
              cursor: 'pointer',
              borderRadius: 6
            }} onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn" style={{
              background: "transparent",
              border: "none",
              color: "#1976D2",
              fontWeight: 600,
              padding: "7px 14px",
              cursor: 'pointer',
              borderRadius: 6
            }} onClick={onLogin}>Login</button>
            <button className="btn" style={{
              background: "transparent",
              border: "none",
              color: "#1976D2",
              fontWeight: 600,
              padding: "7px 14px",
              cursor: 'pointer',
              borderRadius: 6
            }} onClick={onRegister}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavigationBar;
