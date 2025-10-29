import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, Users, ExternalLink } from "lucide-react";
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
  tutor_name: string;
  isRegistered?: boolean;
};

// Hard-coded mock data
const MOCK_SESSIONS: Session[] = [
  {
    id: "1",
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
    tutor_name: "Dr. Sarah Johnson",
    isRegistered: false,
  },
  {
    id: "2",
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
    tutor_name: "Prof. Michael Chen",
    isRegistered: false,
  },
  {
    id: "3",
    subject_id: 3,
    subject_name: "Physics I",
    subject_code: "PHYS101",
    description: "Mechanics and Thermodynamics fundamentals",
    session_date: "2025-11-07T15:30:00",
    duration_minutes: 60,
    meeting_link: "https://meet.google.com/xyz-abcd-efg",
    current_enrolled: 10,
    max_enrolled: 10,
    status: "scheduled",
    tutor_name: "Dr. Emily Brown",
    isRegistered: false,
  },
  {
    id: "4",
    subject_id: 4,
    subject_name: "Database Systems",
    subject_code: "CS305",
    description: "SQL queries and database design principles",
    session_date: "2025-11-08T13:00:00",
    duration_minutes: 90,
    meeting_link: "https://teams.microsoft.com/l/meetup-join/abc123",
    current_enrolled: 6,
    max_enrolled: 15,
    status: "scheduled",
    tutor_name: "Prof. David Lee",
    isRegistered: false,
  },
  {
    id: "5",
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
    tutor_name: "Ms. Jessica Martinez",
    isRegistered: false,
  },
  {
    id: "6",
    subject_id: 6,
    subject_name: "Statistics",
    subject_code: "STAT201",
    description: "Probability distributions and hypothesis testing",
    session_date: "2025-11-10T11:00:00",
    duration_minutes: 75,
    meeting_link: null,
    current_enrolled: 4,
    max_enrolled: 8,
    status: "scheduled",
    tutor_name: "Dr. Robert Wilson",
    isRegistered: false,
  },
];

export function MenteeSessions() {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    filterSessions();
  }, [searchQuery, sessions]);

  const filterSessions = () => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sessions.filter(
      (session) =>
        session.subject_name.toLowerCase().includes(query) ||
        session.subject_code.toLowerCase().includes(query) ||
        session.tutor_name.toLowerCase().includes(query)
    );
    setFilteredSessions(filtered);
  };

  const handleRegister = (sessionId: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            isRegistered: true,
            current_enrolled: session.current_enrolled + 1,
          };
        }
        return session;
      })
    );

    // Show success message (you can add a toast component later)
    alert("Successfully registered for the session!");
  };

  const handleCancelRegistration = (sessionId: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            isRegistered: false,
            current_enrolled: Math.max(0, session.current_enrolled - 1),
          };
        }
        return session;
      })
    );

    // Show success message
    alert("Registration cancelled successfully!");
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-900">Available Sessions</h1>
          <p className="text-gray-600">Find and register for tutoring sessions</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by subject name, code, or tutor"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                {searchQuery ? "No sessions found matching your search." : "No available sessions at the moment."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const isFull = session.current_enrolled >= session.max_enrolled;
              const canRegister = !session.isRegistered && !isFull;

              return (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">{session.subject_name}</CardTitle>
                    <CardDescription className="text-blue-600 font-semibold">
                      {session.subject_code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Tutor:</span> {session.tutor_name}
                    </div>

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
                    
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      <span className={isFull ? "text-red-600 font-medium" : "text-gray-600"}>
                        {session.current_enrolled} / {session.max_enrolled} enrolled
                        {isFull && " (Full)"}
                      </span>
                    </div>

                    <div className="pt-2 space-y-2">
                      {session.isRegistered ? (
                        <>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleCancelRegistration(session.id)}
                          >
                            Cancel Registration
                          </Button>
                          {session.meeting_link && (
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              asChild
                            >
                              <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                                Join Meeting <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={!canRegister}
                          onClick={() => handleRegister(session.id)}
                        >
                          {isFull ? "Session Full" : "Register"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
