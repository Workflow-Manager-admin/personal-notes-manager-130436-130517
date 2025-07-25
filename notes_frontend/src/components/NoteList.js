import React from "react";
import NoteCard from "./NoteCard";

// PUBLIC_INTERFACE
/**
 * NoteList displays the user's notes in a grid with search and controls.
 * @param {{
 *   notes: Array,
 *   isLoading: boolean,
 *   error: string,
 *   onEdit: function,
 *   onDelete: function,
 *   deletePendingId: number|null
 * }} props
 */
function NoteList({ notes, isLoading, error, onEdit, onDelete, deletePendingId }) {
  if (isLoading) return <div>Loading notes...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!notes || notes.length === 0) return <div>No notes found.</div>;
  return (
    <div className="notes-list" style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
      gap: "1rem"
    }}>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          isDeleting={deletePendingId === note.id}
          onEdit={() => onEdit(note)}
          onDelete={() => onDelete(note)}
        />
      ))}
    </div>
  );
}

export default NoteList;
