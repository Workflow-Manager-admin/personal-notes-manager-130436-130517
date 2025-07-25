import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
/**
 * NoteModal displays a modal form for creating/editing a note.
 * @param {{
 *   initialNote: {id: number|null, title: string, content: string},
 *   isOpen: boolean,
 *   isEditing: boolean,
 *   error: string,
 *   isLoading: boolean,
 *   onSubmit: function,
 *   onCancel: function
 * }} props
 */
function NoteModal({ initialNote, isOpen, isEditing, error, isLoading, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialNote || { title: "", content: "" });
  const [validation, setValidation] = useState("");

  useEffect(() => {
    setForm(initialNote || { title: "", content: "" });
    setValidation("");
  }, [initialNote, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Basic validation
    if (name === "title" && value.length < 1) {
      setValidation("Title is required");
    } else {
      setValidation("");
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setValidation("Title is required");
      return;
    }
    onSubmit(form);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.35)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="modal" style={{
        background: 'white',
        padding: '2.0rem 1.2rem 1.2rem 1.2rem',
        borderRadius: 12,
        minWidth: 270,
        maxWidth: 370,
        width: '96vw',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        position: 'relative'
      }}>
        <button className="btn" style={{
          position: 'absolute', top: 12, right: 16, background: 'none', border: 'none',
          fontSize: 23, color: '#888', cursor: 'pointer'
        }} onClick={onCancel} aria-label="Close">&times;</button>
        <h3>{isEditing ? "Edit Note" : "Create Note"}</h3>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 21 }}>
          <input
            name="title"
            type="text"
            placeholder="Title"
            value={form.title}
            maxLength={255}
            autoFocus
            onChange={handleChange}
            style={{
              padding: '8px',
              fontSize: 15,
              borderRadius: 7,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)'
            }}
            required
            disabled={isLoading}
          />
          <textarea
            name="content"
            placeholder="Content"
            rows={5}
            value={form.content}
            onChange={handleChange}
            style={{ padding: '8px', fontSize: 15, borderRadius: 7, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
            disabled={isLoading}
          />
          {validation && <div style={{ color: "#d32f2f", fontSize: 14 }}>{validation}</div>}
          {error && <div style={{ color: "#d32f2f", fontSize: 14 }}>{error}</div>}
          <div style={{ display: 'flex', gap: '1em', marginTop: 6 }}>
            <button className="btn btn-accent" type="submit" style={{
              background: "#FFB300",
              color: "#1a1a1a",
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: 15,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1
            }} disabled={isLoading}>{isLoading ? "Saving..." : (isEditing ? "Save" : "Create")}</button>
            <button className="btn" type="button" style={{
              background: "transparent",
              color: "#424242",
              fontSize: 14,
              border: "none",
              cursor: "pointer"
            }} onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default NoteModal;
