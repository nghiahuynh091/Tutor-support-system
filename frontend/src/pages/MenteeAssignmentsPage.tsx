import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, AlertCircle, ChevronDown, Calendar, BookOpen } from "lucide-react";

// --- Types ---
interface Submission {
  id: number;
  created_at: string;
  score: number | null;      // Actual points obtained
  max_score: number;         // Total points possible
}

interface Assignment {
  id: number;
  class_id: number;
  session_id: number;
  type: "homework" | "quiz";
  title: string;
  description: string;
}

// --- Mock Data: Assignments Only ---
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 101,
    class_id: 1,
    session_id: 1,
    type: "quiz",
    title: "Introduction Quiz",
    description: "Basic concepts check.",
  },
  {
    id: 102,
    class_id: 1,
    session_id: 2,
    type: "homework",
    title: "Setup Environment",
    description: "Install VS Code and Node.js.",
  },
  {
    id: 103,
    class_id: 1,
    session_id: 3,
    type: "quiz",
    title: "Mid-Session Check",
    description: "React Hooks understanding.",
  },
  {
    id: 201,
    class_id: 202302,
    session_id: 2,
    type: "homework",
    title: "Database Design",
    description: "Draw an ERD for the project.",
  },
];

const SESSION_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export const MenteeAssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isLoading: authLoading } = useAuth();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State to track selected session for EACH class
  const [selectedSessions, setSelectedSessions] = useState<Record<number, number>>({});

  // State: Stores submission history
  const [submissionMap, setSubmissionMap] = useState<Record<string, Submission[]>>({});
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // 1. Fetch Assignments
  useEffect(() => {
    if (authLoading) return;

    const fetchAssignments = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600)); 
        setAssignments(MOCK_ASSIGNMENTS);
        initializeSessionState(MOCK_ASSIGNMENTS);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Failed to load assignments.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAssignments();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  // 2. Initialize default session
  const initializeSessionState = (data: Assignment[]) => {
    const uniqueClasses = Array.from(new Set(data.map((a) => a.class_id)));
    const initialstate: Record<number, number> = {};
    uniqueClasses.forEach((id) => {
      initialstate[id] = 1;
    });
    setSelectedSessions(initialstate);
  };

  // 3. Fetch Submissions
  useEffect(() => {
    const fetchVisibleSubmissions = async () => {
      if (!token || assignments.length === 0) return;

      setSubmissionLoading(true);
      const uniqueClasses = Array.from(new Set(assignments.map((a) => a.class_id)));
      
      const fetchPromises = uniqueClasses.map(async (classId) => {
        const sessionId = selectedSessions[classId] || 1;
        const mapKey = `${classId}-${sessionId}`;

        try {
          const response = await axios.get(
            `http://localhost:8002/submission/history/${classId}/${sessionId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return { key: mapKey, data: response.data };
        } catch (err) {
          console.error(`Failed to fetch submissions for ${classId}-${sessionId}`, err);
          return { key: mapKey, data: [] };
        }
      });

      const results = await Promise.all(fetchPromises);

      setSubmissionMap((prev) => {
        const next = { ...prev };
        results.forEach((res) => {
          if (res) {
            next[res.key] = res.data;
          }
        });
        return next;
      });

      setSubmissionLoading(false);
    };

    fetchVisibleSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessions, assignments, token]);

  const handleSessionChange = (classId: number, sessionId: number) => {
    setSelectedSessions((prev) => ({
      ...prev,
      [classId]: sessionId,
    }));
  };

  const handleAttemptQuiz = (classId: number, sessionId: number) => {
    navigate(`/mentee/quiz/${classId}/${sessionId}`);
  };

  // Group assignments
  const groupedAssignments = assignments.reduce((acc, curr) => {
    if (!acc[curr.class_id]) {
      acc[curr.class_id] = [];
    }
    acc[curr.class_id].push(curr);
    return acc;
  }, {} as Record<number, Assignment[]>);

  const uniqueClassIds = Object.keys(groupedAssignments).map(Number);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Loading Assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow p-8 container mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">Assignments</h1>
            <p className="text-gray-600">Select a session to view tasks</p>
          </div>
          <button
            onClick={() => navigate("/mentee/schedule")}
            className="bg-white text-blue-600 border border-blue-200 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition shadow-sm"
          >
            View Schedule
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {assignments.length === 0 && !error ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No assignments found.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {uniqueClassIds.map((classId) => {
              const currentSession = selectedSessions[classId] || 1;
              const classAssignments = groupedAssignments[classId];
              const filteredAssignments = classAssignments.filter(
                (a) => a.session_id === currentSession
              );

              const currentSubmissions = submissionMap[`${classId}-${currentSession}`] || [];

              return (
                <div key={classId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Class Header */}
                  <div className="bg-gray-50 p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Class {classId}</h2>
                        <p className="text-sm text-gray-500">Manage your tasks for this class</p>
                      </div>
                    </div>

                    {/* Session Dropdown */}
                    <div className="relative">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                        Select Session
                      </label>
                      <div className="relative">
                        <select
                          value={currentSession}
                          onChange={(e) => handleSessionChange(classId, Number(e.target.value))}
                          className="appearance-none bg-white border border-gray-300 hover:border-blue-400 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 cursor-pointer transition-colors"
                        >
                          {SESSION_OPTIONS.map((sessionNum) => (
                            <option key={sessionNum} value={sessionNum}>
                              Session {sessionNum}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignments Content */}
                  <div className="p-6 bg-gray-50/30">
                    {filteredAssignments.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                        <div className="inline-flex bg-gray-100 p-3 rounded-full mb-3">
                          <Calendar className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-gray-600 font-medium">No assignment available</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          There are no tasks for Class {classId}, Session {currentSession}.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {filteredAssignments.map((a) => (
                          <div
                            key={a.id}
                            className="bg-white shadow-sm hover:shadow-md rounded-xl p-6 border border-gray-200 transition-all duration-200"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                  <span
                                    className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${
                                      a.type === "quiz"
                                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                                        : "bg-orange-100 text-orange-700 border border-orange-200"
                                    }`}
                                  >
                                    {a.type}
                                  </span>
                                  <h3 className="text-lg font-bold text-gray-800">{a.title}</h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {a.description}
                                </p>
                              </div>

                              {a.type === "quiz" && (
                                <button
                                  onClick={() => handleAttemptQuiz(a.class_id, a.session_id)}
                                  className="shrink-0 w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                                >
                                  Attempt Quiz
                                </button>
                              )}
                            </div>

                            {/* Submissions Table */}
                            {submissionLoading ? (
                                <div className="mt-6 p-4 flex justify-center items-center bg-gray-50 rounded-lg">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                </div>
                            ) : (
                                currentSubmissions.length > 0 && (
                                  <div className="mt-6 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-2 border-b border-gray-200 bg-gray-100/50">
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Your Submission
                                      </h4>
                                    </div>
                                    <table className="w-full text-sm">
                                      <tbody>
                                        {currentSubmissions.map((s) => {
                                          // --- CALCULATION LOGIC ---
                                          const isPending = s.score === null;
                                          // Use percentage purely for color coding
                                          const percentage = !isPending && s.max_score > 0 
                                            ? (s.score! / s.max_score) * 100 
                                            : 0;

                                          return (
                                            <tr key={s.id}>
                                              <td className="p-3 text-gray-600 border-r border-gray-100">
                                                {new Date(s.created_at).toLocaleString()}
                                              </td>
                                              <td className="p-3 text-right">
                                                {isPending ? (
                                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                    Pending
                                                  </span>
                                                ) : (
                                                  <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                      percentage >= 50
                                                        ? "bg-green-100 text-green-800 border-green-200"
                                                        : "bg-red-100 text-red-800 border-red-200"
                                                    }`}
                                                  >
                                                    {/* CHANGED: Display Score/MaxScore instead of % */}
                                                    {s.score}/{s.max_score}
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};