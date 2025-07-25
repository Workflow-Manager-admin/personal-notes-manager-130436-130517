import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * AuthForm provides authentication form for login/register, with real-time validation and feedback.
 * @param {{
 *   mode: "login"|"register",
 *   onSubmit: function,
 *   onClose: function,
 *   error: string,
 *   isLoading: boolean
 * }} props
 */
function AuthForm({ mode, onSubmit, onClose, error, isLoading }) {
  const [fields, setFields] = useState({ username: "", password: "" });
  const [validation, setValidation] = useState({ username: "", password: "" });

  // Real-time validation
  function handleChange(e) {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
    setValidation(v => ({
      ...v,
      [name]: (!value.trim() ? "Required" : (name === "password" && value.length < 4 ? "Min 4 chars" : ""))
    }));
  }

  function submit(event) {
    event.preventDefault();
    // Trigger validation
    const nextValidation = {
      username: !fields.username.trim() ? "Required" : "",
      password: !fields.password.trim() ? "Required" : (fields.password.length < 4 ? "Min 4 chars" : "")
    };
    setValidation(nextValidation);
    if (nextValidation.username || nextValidation.password) return;
    onSubmit(fields);
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
      <input
        name="username"
        type="text"
        autoComplete="username"
        placeholder="Username"
        value={fields.username}
        onChange={handleChange}
        autoFocus
        style={{
          padding: '8px',
          fontSize: 15,
          borderRadius: 7,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-primary)'
        }}
        disabled={isLoading}
      />
      {validation.username && <div style={{ color: "#d32f2f", fontSize: 13 }}>{validation.username}</div>}

      <input
        name="password"
        type="password"
        autoComplete={mode === "register" ? "new-password" : "current-password"}
        placeholder="Password"
        value={fields.password}
        onChange={handleChange}
        style={{
          padding: '8px',
          fontSize: 15,
          borderRadius: 7,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-primary)'
        }}
        disabled={isLoading}
      />
      {validation.password && <div style={{ color: "#d32f2f", fontSize: 13 }}>{validation.password}</div>}
      {error && <div style={{ color: "#d32f2f", fontSize: 14 }}>{error}</div>}
      <button className="btn btn-accent" type="submit" style={{
        background: "#FFB300",
        color: "#1a1a1a",
        border: 'none',
        borderRadius: 8,
        padding: '8px 18px',
        fontWeight: 600,
        fontSize: 15,
        cursor: isLoading ? "not-allowed" : "pointer",
        marginTop: 6,
        opacity: isLoading ? 0.5 : 1
      }} disabled={isLoading}>{isLoading ? "Loading..." : (mode === "register" ? "Register" : "Login")}</button>
      <button type="button" className="btn" style={{
        background: "transparent",
        color: "#424242",
        fontSize: 14,
        border: "none",
        marginTop: 4,
        cursor: "pointer"
      }} onClick={onClose}>Cancel</button>
    </form>
  );
}
export default AuthForm;
