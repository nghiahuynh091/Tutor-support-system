interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface MakeUpSessionProps {
  students: Student[];
  inviteStatus: Record<number, boolean>;
  setInviteStatus: (status: Record<number, boolean>) => void;
  sessionComplete: boolean;
  sessionCancelled: boolean;
}

function MakeUpSession({
  students,
  inviteStatus,
  setInviteStatus,
  sessionComplete,
  sessionCancelled,
}: MakeUpSessionProps) {
  const canShow = sessionComplete || sessionCancelled;

  const handleInvite = (id: number) => {
    const updated = { ...inviteStatus, [id]: true };
    setInviteStatus(updated);
    alert(`📩 Invitation sent to student ID ${id}`);
  };

  if (!canShow) {
    return (
      <div style={{ marginTop: 20, color: "#666" }}>
        ⚠️ You can only arrange a make-up session after the session is either
        <strong> marked complete</strong> or <strong>cancelled</strong>.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Make-Up Session Attendance</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>First Name</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Last Name</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td style={{ padding: "8px" }}>{s.id}</td>
              <td style={{ padding: "8px" }}>{s.firstName}</td>
              <td style={{ padding: "8px" }}>{s.lastName}</td>
              <td style={{ padding: "8px" }}>
                {inviteStatus[s.id] ? (
                  <span style={{ color: "green" }}> Invited</span>
                ) : (
                  <button
                    onClick={() => handleInvite(s.id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#007BFF",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Invite
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MakeUpSession;
