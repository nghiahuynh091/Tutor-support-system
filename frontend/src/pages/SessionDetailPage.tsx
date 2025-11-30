import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCheck, Edit, Save, Trash, PlusCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

import { useAuth } from "@/contexts/AuthContext";
import { sessionService, type CalendarSession } from "@/services/sessionService";

// Interface for combined mentee and attendance data
interface MenteeAttendance {
  id: string; // mentee_id
  name: string;
  attended: boolean;
}

// Interface for a note
interface SessionNote {
  id: number;
  note_title: string;
  note_information: string;
}

export function SessionDetailPage() {
  const { classId, sessionId } = useParams<{ classId: string; sessionId:string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  // State
  const [sessionDetails, setSessionDetails] = useState<CalendarSession | null>(null);
  const [mentees, setMentees] = useState<MenteeAttendance[]>([]);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!classId || !sessionId || !token) return; // Don't fetch if no token
    setLoading(true);
    setError(null);
    try {
      // Fetch mentees, attendance, notes, and session details in parallel
      const [menteesRes, attendanceRes, notesRes, sessionRes] = await Promise.all([
        api.get(`/registrations/class/${classId}/mentees`),
        api.get(`/attendance/session/${classId}/${sessionId}`),
        api.get(`/notes/session/${classId}/${sessionId}`),
        sessionService.getSessionById(parseInt(classId), parseInt(sessionId)),
      ]);

      // Process Session Details
      setSessionDetails(sessionRes);

      // Process Mentees and Attendance
      const enrolledMentees = menteesRes.data.mentees || [];
      const attendanceData = attendanceRes.data.attendance || [];
      
      const combinedMentees: MenteeAttendance[] = enrolledMentees.map((mentee: any) => {
        const attendanceRecord = attendanceData.find((att: any) => att.mentee_id === mentee.mentee_id);
        return {
          id: mentee.mentee_id,
          name: mentee.full_name,
          attended: attendanceRecord ? attendanceRecord.attendance_mark : false,
        };
      });
      setMentees(combinedMentees);

      // Process Notes
      setNotes(notesRes.data.notes || []);

    } catch (err) {
      console.error("Failed to fetch session data:", err);
      setError("Failed to load session data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [classId, sessionId, token]); // Add token to dependency array

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleAttendance = (menteeId: string) => {
    setMentees(mentees.map(m =>
      m.id === menteeId ? { ...m, attended: !m.attended } : m
    ));
  };

  const handleNoteChange = (noteId: number, field: 'title' | 'information', value: string) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, [field === 'title' ? 'note_title' : 'note_information']: value } : n));
  };

  const handleSaveNote = async (noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // If the note has a temporary (negative) ID, it's a new note to be created.
    if (note.id < 0) {
      try {
        await api.post('/notes/', {
          class_id: parseInt(classId!),
          session_id: parseInt(sessionId!),
          note_title: note.note_title,
          note_information: note.note_information
        });
        await fetchData(); // Refetch all notes to get the real ID
      } catch (err) {
        console.error("Failed to create note:", err);
        alert("Failed to create the new note.");
      }
    } else {
      // Otherwise, it's an existing note to be updated.
      try {
        await api.put(`/notes/${note.id}`, { 
          note_title: note.note_title,
          note_information: note.note_information 
        });
        setEditingNoteId(null); // Exit edit mode
        alert("Note saved successfully!");
      } catch (err) {
        console.error("Failed to update note:", err);
        alert("Failed to save the note.");
      }
    }
  };

  const handleAddNote = () => {
    // Create a new note locally with a temporary negative ID
    const tempId = -Date.now();
    const newNote: SessionNote = {
      id: tempId,
      note_title: 'New Note Title',
      note_information: ' '
    };
    setNotes([...notes, newNote]);
    setEditingNoteId(tempId); // Immediately enter edit mode for the new note
  };

  const handleDeleteNote = async (noteId: number) => {
    // If it's a temporary note that hasn't been saved, just remove it from state
    if (noteId < 0) {
      setNotes(notes.filter(n => n.id !== noteId));
      return;
    }
    
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId)); // Optimistic update
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Failed to delete the note.");
    }
  };

  const handleSaveAttendance = async () => {
    if (!classId || !sessionId) return;
    try {
      // Save Attendance
      const attendancePayload = mentees.map(m => ({ mentee_id: m.id, attended: m.attended }));
      await api.post(`/attendance/session/${classId}/${sessionId}`, attendancePayload);

      alert("Attendance saved successfully!");
    } catch (err) {
      console.error("Failed to save attendance:", err);
      alert("An error occurred while saving attendance. Please try again.");
    }
  };

  const handleEndSession = async () => {
    if (!classId || !sessionId || !confirm("Are you sure you want to end this session? This action cannot be undone.")) return;
    try {
      await api.patch(`/sessions/${classId}/${sessionId}/complete`);
      alert("Session marked as completed!");
      fetchData(); // Refetch all data to update session status
    } catch (err) {
      console.error("Failed to end session:", err);
      alert("Failed to end session. Please try again.");
    }
  };
  
  if (loading) {
    return <div>Loading session details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 md:px-8 py-8">
        <Button
          onClick={() => navigate(`/tutor/class/${classId}#attendance`)}
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Class Details
        </Button>

        <h1 className="text-3xl font-bold text-gray-800">
          Manage Session
        </h1>
        {sessionDetails && (
          <div className="flex items-center space-x-4 text-gray-500 mt-2">
            <span>Date: {sessionDetails.date.toLocaleDateString()}</span>
            <span>Time: {sessionDetails.start_time} - {sessionDetails.end_time}</span>
            <span>Location: {sessionDetails.location}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left Column: Attendance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mentees.length > 0 ? mentees.map((mentee) => (
                    <div
                      key={mentee.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-100"
                    >
                      <p className="font-medium">{mentee.name}</p>
                      <Button
                        variant={mentee.attended ? "default" : "outline"}
                        onClick={() => handleToggleAttendance(mentee.id)}
                        className={!mentee.attended ? "text-gray-700" : ""}
                      >
                        {mentee.attended ? "Attended" : "Mark as Attended"}
                      </Button>
                    </div>
                  )) : <p>No mentees registered for this class.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Notes */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-green-600" />
                    Session Notes
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleAddNote}>
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notes.length > 0 ? notes.map((note) => (
                  <div key={note.id} className="p-3 border rounded-lg bg-white">
                    {editingNoteId === note.id ? (
                      // Edit Mode
                      <div className="space-y-2">
                        <input 
                          type="text"
                          value={note.note_title}
                          onChange={(e) => handleNoteChange(note.id, 'title', e.target.value)}
                          className="w-full p-2 border rounded font-semibold"
                        />
                        <textarea
                          className="w-full p-2 border rounded"
                          value={note.note_information}
                          onChange={(e) => handleNoteChange(note.id, 'information', e.target.value)}
                          rows={4}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingNoteId(null)} className="text-gray-700">Cancel</Button>
                          <Button size="sm" onClick={() => handleSaveNote(note.id)}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-800">{note.note_title}</h4>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingNoteId(note.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteNote(note.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">{note.note_information}</p>
                      </div>
                    )}
                  </div>
                )) : <p>No notes for this session yet. Click '+' to add one.</p>}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          {sessionDetails?.status === 'scheduled' && (
            <Button size="lg" variant="destructive" onClick={handleEndSession}>
              End Session
            </Button>
          )}
          <Button size="lg" onClick={handleSaveAttendance}>
            <Save className="mr-2 h-4 w-4" />
            Save Attendance
          </Button>
        </div>
      </main>
    </div>
  );
}

export default SessionDetailPage;