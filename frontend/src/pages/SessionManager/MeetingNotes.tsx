import { useState } from "react";

interface MeetingNotesProps {
  note: string;
  onNoteChange: (newNote: string) => void;
}

function MeetingNotes({ note, onNoteChange }: MeetingNotesProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (note.trim() === "") {
      alert("Please enter some notes before saving.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <h3>Meeting Notes</h3>
      <textarea
        placeholder="Type your meeting notes here..."
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        rows={6}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          resize: "vertical",
          fontSize: "14px",
          fontFamily: "Arial, sans-serif",
        }}
      ></textarea>

      <button
        onClick={handleSave}
        style={{
          marginTop: 10,
          padding: "8px 15px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#007BFF",
          color: "white",
          cursor: "pointer",
        }}
      >
        Save Note
      </button>

      {saved && <p style={{ color: "green" }}> Note saved successfully!</p>}
    </div>
  );
}

export default MeetingNotes;
