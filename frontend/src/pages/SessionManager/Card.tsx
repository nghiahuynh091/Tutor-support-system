import { useState, useEffect } from "react";
import AttendanceTable from "./AttendanceTable";
import MeetingNotes from "./MeetingNotes";
import MakeUpSession from "./MakeUpSession";
import "./Card.css";
import LearningResources from "./LearningResources";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";

export function Card() {
  const { classId } = useParams();

  const [activeSection, setActiveSection] = useState<string | null>(null);

  // 📝 Notes
  const [meetingNote, setMeetingNote] = useState(
    () => localStorage.getItem("meetingNote") || ""
  );
  useEffect(() => {
    localStorage.setItem("meetingNote", meetingNote);
  }, [meetingNote]);

  // 📋 Attendance
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem("attendanceData");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, firstName: "Alice", lastName: "Nguyen", status: "" },
          { id: 2, firstName: "Bob", lastName: "Tran", status: "" },
          { id: 3, firstName: "Charlie", lastName: "Pham", status: "" },
        ];
  });
  useEffect(() => {
    localStorage.setItem("attendanceData", JSON.stringify(attendance));
  }, [attendance]);

  // ✅ Session complete
  const [sessionComplete, setSessionComplete] = useState(
    () => localStorage.getItem("sessionComplete") === "true"
  );
  useEffect(() => {
    localStorage.setItem("sessionComplete", String(sessionComplete));
  }, [sessionComplete]);

  // ❌ Session cancelled
  const [sessionCancelled, setSessionCancelled] = useState(
    () => localStorage.getItem("sessionCancelled") === "true"
  );
  useEffect(() => {
    localStorage.setItem("sessionCancelled", String(sessionCancelled));
  }, [sessionCancelled]);

  // 📩 Invite persistence
  const [inviteStatus, setInviteStatus] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem("inviteStatus");
    return saved ? JSON.parse(saved) : {};
  });
  useEffect(() => {
    localStorage.setItem("inviteStatus", JSON.stringify(inviteStatus));
  }, [inviteStatus]);

  const handleCancelSession = () => {
    if (!sessionCancelled) {
      setSessionCancelled(true);
      alert("⚠️ Session marked as cancelled.");
    }
  };

  const canArrangeMakeUp = sessionComplete || sessionCancelled;

  return (
    <div className="card">
    <Header />
<h2>
  Class ID: {classId || "N/A"} - Mentoring Session
</h2>
<p>Lecturer: Dr. John Doe</p>


      <div className="card-row clickable" onClick={() => setActiveSection("attendance")}>
        📋 Mark Attendance
      </div>

      <div className="card-row clickable" onClick={() => setActiveSection("notes")}>
        📝 Add Meeting Notes
      </div>

      <div
        className={`card-row clickable ${!canArrangeMakeUp ? "disabled" : ""}`}
        onClick={() => canArrangeMakeUp && setActiveSection("makeup")}
        style={{
          color: canArrangeMakeUp ? "#0059b3" : "#999",
          cursor: canArrangeMakeUp ? "pointer" : "not-allowed",
        }}
      >
        📅 Arrange Make-Up Session
      </div>

      <div className="card-row clickable" onClick={() => setActiveSection("resources")}>
      </div>

      <div className="section-content">
        {activeSection === "attendance" && (
          <>
            <AttendanceTable
              attendance={attendance}
              setAttendance={setAttendance}
              sessionComplete={sessionComplete}
              setSessionComplete={setSessionComplete}
              sessionCancelled={sessionCancelled}
            />
            {!sessionCancelled && !sessionComplete && (
              <button
                onClick={handleCancelSession}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  marginTop: "10px",
                  padding: "8px 15px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel Session
              </button>
            )}
          </>
        )}

        {activeSection === "notes" && (
          <MeetingNotes note={meetingNote} onNoteChange={setMeetingNote} />
        )}

        {activeSection === "makeup" && (
          <MakeUpSession
            students={attendance.map((a) => ({
              id: a.id,
              firstName: a.firstName,
              lastName: a.lastName,
            }))}
            inviteStatus={inviteStatus}
            setInviteStatus={setInviteStatus}
            sessionComplete={sessionComplete}
            sessionCancelled={sessionCancelled}
          />
        )}

        {activeSection === "resources" && <LearningResources />}
      </div>
    </div>
  );
}
export default Card;
