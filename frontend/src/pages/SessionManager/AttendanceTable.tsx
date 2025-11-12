interface Student {
  id: number;
  firstName: string;
  lastName: string;
  status: string;
}

interface AttendanceTableProps {
  attendance: Student[];
  setAttendance: React.Dispatch<React.SetStateAction<Student[]>>;
  sessionComplete: boolean;
  setSessionComplete: (value: boolean) => void;
  sessionCancelled: boolean;
}

function AttendanceTable({
  attendance,
  setAttendance,
  sessionComplete,
  setSessionComplete,
  sessionCancelled,
}: AttendanceTableProps) {
  const handleStatusChange = (id: number, status: string) => {
    if (sessionCancelled) return; // disabled after cancel
    const updated = attendance.map((a) =>
      a.id === id ? { ...a, status } : a
    );
    setAttendance(updated);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Attendance List</h3>
      {sessionCancelled && (
        <p style={{ color: "#cc0000", fontWeight: "bold" }}>
          ⚠️ This session has been cancelled. Attendance can no longer be updated.
        </p>
      )}
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
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((a) => (
            <tr key={a.id}>
              <td style={{ padding: "8px" }}>{a.id}</td>
              <td style={{ padding: "8px" }}>{a.firstName}</td>
              <td style={{ padding: "8px" }}>{a.lastName}</td>
              <td style={{ padding: "8px" }}>
                <select
                  value={a.status}
                  onChange={(e) => handleStatusChange(a.id, e.target.value)}
                  disabled={sessionComplete || sessionCancelled}
                  style={{
                    padding: "5px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">--Select--</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!sessionCancelled && !sessionComplete && (
        <button
          onClick={() => setSessionComplete(true)}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            marginTop: "10px",
            padding: "8px 15px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Mark Session as Complete
        </button>
      )}

      {sessionComplete && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          Session marked as complete.
        </p>
      )}
    </div>
  );
}

export default AttendanceTable;
