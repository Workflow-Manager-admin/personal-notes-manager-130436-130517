import React from "react";

// PUBLIC_INTERFACE
/**
 * NoteCard renders a single note in a card with edit/delete buttons.
 * @param {{
 *   note: object,
 *   onEdit: function,
 *   onDelete: function,
 *   isDeleting: boolean
 * }} props
 */
function NoteCard({ note, onEdit, onDelete, isDeleting }) {
  return (
    <div className="note-card" style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: 13,
      padding: 16,
      minHeight: 110,
      boxShadow: "0 2px 7px 0 rgba(0,0,0,0.07)",
      position: "relative",
      display: "flex",
      flexDirection: "column"
    }}>
      <h4 style={{
        fontWeight: 600,
        fontSize: 18,
        margin: 0,
        color: "#1976D2",
        marginBottom: 3
      }}>{note.title}</h4>
      <div style={{
        flex: 1,
        minHeight: 40,
        fontSize: 15,
        marginBottom: 10
      }}>
        {note.content ? note.content : <span style={{ opacity: 0.6, fontStyle: "italic" }}>No content</span>}
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 6,
        fontSize: 13
      }}>
        <div style={{ fontSize: 12, color: "#888" }}>
          {note.updated_at ? new Date(note.updated_at).toLocaleString() : ""}
        </div>
        <div>
          <button className="btn" style={{
            margin: "0 2px",
            fontWeight: 600,
            padding: "5px 12px",
            border: "none",
            background: "#e3e3e3",
            borderRadius: 7,
            cursor: "pointer"
          }}
            onClick={onEdit}
          >Edit</button>
          <button className="btn" style={{
            margin: "0 2px",
            fontWeight: 600,
            padding: "5px 12px",
            border: "none",
            background: "#FFD6D6",
            borderRadius: 7,
            cursor: isDeleting ? "not-allowed" : "pointer",
            color: "#d32f2f",
            opacity: isDeleting ? 0.7 : 1
          }}
            onClick={onDelete}
            disabled={isDeleting}
          >{isDeleting ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}
export default NoteCard;
