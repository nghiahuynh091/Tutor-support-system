import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, Trash2, Users } from "lucide-react";
import { Header } from "@/components/Header";

type Session = {
  id: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  description: string | null;
  session_date: string;
  duration_minutes: number;
  meeting_link: string | null;
  current_enrolled: number;
  max_enrolled: number;
  status: string;
};

// Hard-coded mock data for tutor's sessions
const MOCK_TUTOR_SESSIONS: Session[] = [
  {
    id: "t1",
    subject_id: 1,
    subject_name: "Advanced Mathematics",
    subject_code: "MATH301",
    description: "Calculus and Linear Algebra review session",
    session_date: "2025-11-05T14:00:00",
    duration_minutes: 90,
    meeting_link: "https://meet.google.com/abc-defg-hij",
    current_enrolled: 5,
    max_enrolled: 10,
    status: "scheduled",
  },
  {
    id: "t2",
    subject_id: 2,
    subject_name: "Data Structures",
    subject_code: "CS202",
    description: "Trees, Graphs, and Algorithm Analysis",
    session_date: "2025-11-06T10:00:00",
    duration_minutes: 120,
    meeting_link: "https://zoom.us/j/123456789",
    current_enrolled: 8,
    max_enrolled: 12,
    status: "scheduled",
  },
  {
    id: "t3",
    subject_id: 5,
    subject_name: "Web Development",
    subject_code: "CS401",
    description: "React and TypeScript best practices",
    session_date: "2025-11-09T16:00:00",
    duration_minutes: 120,
    meeting_link: "https://meet.google.com/web-dev-session",
    current_enrolled: 7,
    max_enrolled: 12,
    status: "scheduled",
  },
];

export function TutorSessions() {
  const [sessions, setSessions] = useState<Session[]>(MOCK_TUTOR_SESSIONS);

  const handleDeleteSession = (id: string) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      setSessions((prevSessions) => prevSessions.filter((session) => session.id !== id));
      alert("Session deleted successfully!");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-900">My Tutoring Sessions</h1>
            <p className="text-gray-600">Create and manage your tutoring sessions</p>
          </div>
          
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => alert("Create session feature coming soon!")}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Session
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">You haven't created any sessions yet.</p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => alert("Create session feature coming soon!")}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-blue-900">{session.subject_name}</CardTitle>
                      <CardDescription className="text-blue-600 font-semibold">
                        {session.subject_code}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {session.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(session.session_date)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(session.session_date)} ({session.duration_minutes} min)
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {session.current_enrolled} / {session.max_enrolled} enrolled
                  </div>

                  {session.meeting_link && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      asChild
                    >
                      <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                        Join Meeting
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
