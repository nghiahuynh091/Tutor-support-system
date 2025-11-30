import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  FileText,
  TrendingUp,
  ClipboardList,
  BookOpen,
  ArrowLeft,
  Plus,
  Save,
  X,
  CheckCircle,
  Edit2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { classService, type ClassData } from "@/services/classService";
import {
  sessionService,
  type CalendarSession,
} from "@/services/sessionService";

// Sub-components for each feature section

import LearningResources from "./SessionManager/LearningResources";

const DAYS_OF_WEEK: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const periodToTime = (hour: number): string => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

// Progress Tracking Types
interface ProgressRecord {
  id: number;
  tutor_id: string;
  class_id: number;
  title: string;
  progress_date: string;
}

interface ProgressScore {
  id: number;
  report_id: number;
  mentee_id: string;
  points: number | null;
  comments: string | null;
  created_at: string;
}

interface Student {
  uuid: string;
  name: string;
  avatar: string;
}

// API Mentee interface (from backend)
interface APIMentee {
  mentee_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  enrolled_at: string | null;
}

const BASE_URL = "http://localhost:8002";

// Assignment interface
interface Assignment {
  id: number;
  class_id: number;
  session_id: number;
  assignment_type: "homework" | "quiz";
  title: string;
  description?: string;
  due_date?: string;
  created_at?: string;
}

// Hardcoded example assignments (fallback)
const EXAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    class_id: 1,
    session_id: 1,
    assignment_type: "homework",
    title: "Chapter 3 Exercises",
    description: "Complete exercises 1-10 from Chapter 3",
    due_date: "2025-12-05",
  },
  {
    id: 2,
    class_id: 1,
    session_id: 2,
    assignment_type: "quiz",
    title: "Midterm Quiz",
    description: "Covers chapters 1-4",
    due_date: "2025-12-10",
  },
];

type ActiveTab = "overview" | "progress" | "attendance";

export function TutorClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Class data
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#attendance") {
      setActiveTab("attendance");
    }
  }, []);

  // Attendance states (managed per session, not globally)

  // Progress tracking states
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(
    null
  );
  const [progressScores, setProgressScores] = useState<ProgressScore[]>([]);
  const [isCreateProgressOpen, setIsCreateProgressOpen] = useState(false);
  const [newProgressTitle, setNewProgressTitle] = useState("");
  const [progressLoading, setProgressLoading] = useState(false);

  // Assignment states
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // Class mentees (students) state
  const [classMentees, setClassMentees] = useState<Student[]>([]);
  const [menteesLoading, setMenteesLoading] = useState(false);

  // Progress chart states
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Load class data
  const loadClassData = useCallback(async () => {
    if (!user?.id || !classId) return;

    try {
      setError(null);
      const tutorClasses = await classService.getClassesByTutor(user.id);
      const foundClass = tutorClasses.find((c) => c.id === parseInt(classId));

      if (foundClass) {
        setClassData(foundClass);
        // Load sessions for this class
        try {
          const classSessions = await sessionService.getSessionsByClass(
            parseInt(classId)
          );
          setSessions(classSessions);
        } catch {
          console.log("No sessions found for this class");
        }
      } else {
        setError("Class not found");
      }
    } catch (err: any) {
      console.error("Failed to load class:", err);
      setError(err.response?.data?.detail || "Failed to load class");
    } finally {
      setLoading(false);
    }
  }, [user?.id, classId]);

  // Load assignments for the class
  const loadAssignments = useCallback(async () => {
    if (!classId) return;
    setAssignmentsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/assignments/class/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.length > 0 ? data : EXAMPLE_ASSIGNMENTS);
      } else {
        // Use example assignments as fallback
        setAssignments(EXAMPLE_ASSIGNMENTS);
      }
    } catch {
      // Use example assignments as fallback
      setAssignments(EXAMPLE_ASSIGNMENTS);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [classId]);

  // Load mentees enrolled in this class
  const loadMentees = useCallback(async () => {
    if (!classId) return;
    setMenteesLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/registrations/class/${classId}/mentees`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.mentees) {
          // Transform API mentees to Student interface
          const students: Student[] = data.mentees.map((m: APIMentee) => ({
            uuid: m.mentee_id,
            name: m.full_name,
            avatar:
              m.avatar_url || `https://i.pravatar.cc/150?u=${m.mentee_id}`,
          }));
          setClassMentees(students);
        }
      }
    } catch (err) {
      console.error("Failed to load mentees:", err);
    } finally {
      setMenteesLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadClassData();
    loadAssignments();
    loadMentees();
  }, [loadClassData, loadAssignments, loadMentees]);

  // Progress tracking API functions
  const getHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchProgressRecords = useCallback(async () => {
    if (!classId || !token) return;
    try {
      const response = await fetch(
        `${BASE_URL}/progress/class/${classId}/notes`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();
      setProgressRecords(data);
    } catch (error) {
      console.error(error);
      setProgressRecords([]);
    }
  }, [classId, token, getHeaders]); // Include getHeaders as a dependency

  // Effect to fetch all progress records on component load
  useEffect(() => {
    if (classId) {
      fetchProgressRecords();
    }
  }, [classId, fetchProgressRecords]);

  const fetchAllScoresForRecords = useCallback(async () => {
    if (progressRecords.length > 0 && token) {
      setProgressLoading(true);
      const allScores: ProgressScore[] = [];
      for (const record of progressRecords) {
        try {
          const response = await fetch(
            `${BASE_URL}/progress/record/${record.id}/scores`,
            {
              method: "GET",
              headers: getHeaders(),
            }
          );
          if (!response.ok)
            throw new Error(`Failed to fetch scores for record ${record.id}`);
          const scoresForRecord: ProgressScore[] = await response.json();
          allScores.push(...scoresForRecord);
        } catch (error) {
          console.error(
            `Error fetching scores for record ${record.id}:`,
            error
          );
        }
      }
      setProgressScores(allScores);
      setProgressLoading(false);
    } else if (progressRecords.length === 0) {
      setProgressScores([]);
      setProgressLoading(false);
    }
  }, [progressRecords, token, getHeaders]);

  // Effect to fetch all scores for all records
  useEffect(() => {
    fetchAllScoresForRecords();
  }, [fetchAllScoresForRecords]);

  // Create a new progress report
  const handleCreateProgressRecord = async () => {
    if (!classId || !token || !newProgressTitle.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/progress/record`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          class_id: parseInt(classId),
          title: newProgressTitle.trim(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create progress report");
      setNewProgressTitle("");
      setIsCreateProgressOpen(false);
      fetchProgressRecords();
    } catch (error) {
      console.error("Error creating progress report:", error);
      alert("Failed to create progress report.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading class details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || "Class not found"}</p>
            <Button
              onClick={() => navigate("/tutor/my-classes")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Classes
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "attendance", label: "Sessions", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* Back Button & Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tutor/my-classes")}
            className="mb-4 text-white hover:text-gray-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Classes
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
                {classData.subject_name}
              </h1>
              <p className="text-blue-600 font-semibold mt-1">
                {classData.subject_code} • Class #{classData.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {classData.num_of_weeks && (
                <Badge
                  variant="outline"
                  className="text-purple-700 border-purple-300"
                >
                  {classData.num_of_weeks} weeks
                </Badge>
              )}
              <Badge variant="outline" className="text-gray-600">
                Semester {classData.semester}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Combined Class Information Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Users className="h-5 w-5" />
                    Class Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
                  {/* Column 1 */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Day:</span>
                      <span className="font-medium">
                        {DAYS_OF_WEEK[classData.week_day] || classData.week_day}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {periodToTime(classData.start_time)} -{" "}
                        {periodToTime(classData.end_time)}
                      </span>
                    </div>
                    {classData.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">
                          {classData.location}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Column 2 */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enrollment:</span>
                      <span className="font-medium">
                        {classData.current_enrolled} / {classData.capacity}
                      </span>
                    </div>
                    {classData.num_of_weeks && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {classData.num_of_weeks} weeks
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span
                        className={`font-medium ${
                          classData.current_enrolled >= classData.capacity
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {classData.current_enrolled >= classData.capacity
                          ? "Class Full"
                          : `${
                              classData.capacity - classData.current_enrolled
                            } spots`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Link */}
              {classData.meeting_link && (
                <Card className="lg:col-span-2">
                  <CardContent className="pt-6">
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                      asChild
                    >
                      <a
                        href={classData.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Join Meeting Link
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Session */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Calendar className="h-5 w-5" />
                    Upcoming Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.filter((s) => s.date >= new Date()).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No upcoming sessions scheduled.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sessions
                        .filter((s) => s.date >= new Date()) // Filter for future sessions
                        .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort chronologically
                        .slice(0, 1) // Take only the next one
                        .map((session) => (
                          <div
                            key={session.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-center w-12 shrink-0">
                                <p className="font-bold text-lg text-blue-700">
                                  {session.date.getDate()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {session.date.toLocaleString("en-US", {
                                    month: "short",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {session.date.toLocaleDateString("en-US", {
                                    weekday: "long",
                                  })}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {session.start_time} - {session.end_time}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Location: {session.location}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`mt-2 sm:mt-0 ${
                                session.status === "completed"
                                  ? "bg-gray-100 text-gray-700"
                                  : session.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assignments Section - Now in Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <FileText className="h-5 w-5" />
                      Assignments
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          navigate(`/assignment/homework/${classId}/1`)
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Homework
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          navigate(`/assignment/quiz/${classId}/1`)
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Quiz
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {assignmentsLoading ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
                      <p className="text-gray-500 mt-2">
                        Loading assignments...
                      </p>
                    </div>
                  ) : assignments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No assignments created yet. Click the buttons above to
                      create one.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                assignment.assignment_type === "quiz"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {assignment.title}
                              </p>
                              {assignment.description && (
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {assignment.description}
                                </p>
                              )}
                              {assignment.due_date && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Due:{" "}
                                  {new Date(
                                    assignment.due_date
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() =>
                              navigate(
                                `/assignment/${assignment.assignment_type}/${classId}/${assignment.session_id}`
                              )
                            }
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learning Resources Section - Moved from its own tab */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <BookOpen className="h-5 w-5" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LearningResources classId={parseInt(classId || "0")} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progress Tracking Tab */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              {/* Student Progress Table - Scalable for many students */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <TrendingUp className="h-5 w-5" />
                      Overview
                    </CardTitle>
                    {/* Search and Filter */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                      />
                      <select
                        value={selectedStudentId || ""}
                        onChange={(e) =>
                          setSelectedStudentId(e.target.value || null)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Students</option>
                        {classMentees.map((student) => (
                          <option key={student.uuid} value={student.uuid}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {menteesLoading || progressLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="animate-spin h-8 w-8 text-blue-500 mr-3" />
                      <span>Loading student progress...</span>
                    </div>
                  ) : classMentees.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No students enrolled in this class yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm table-fixed">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 w-48">
                              Student
                            </th>
                            {progressRecords.map((record) => (
                              <th
                                key={record.id}
                                className="text-center py-3 px-2 font-semibold text-gray-700 w-24"
                              >
                                <span
                                  className="block truncate"
                                  title={record.title}
                                >
                                  {record.title}
                                </span>
                              </th>
                            ))}
                            <th className="text-center py-3 px-4 font-semibold text-gray-700 w-24">
                              Average
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {classMentees
                            .filter((student) =>
                              selectedStudentId
                                ? student.uuid === selectedStudentId
                                : student.name
                                    .toLowerCase()
                                    .includes(studentSearchQuery.toLowerCase())
                            )
                            .slice(0, 20) // Show max 20 at a time for performance
                            .map((student) => {
                              // Get scores for this student across all reports
                              const studentScores = progressScores.filter(
                                (s) => s.mentee_id === student.uuid
                              );
                              const avgScore =
                                studentScores.length > 0
                                  ? Math.round(
                                      studentScores.reduce(
                                        (a, s) => a + (s.points || 0),
                                        0
                                      ) / studentScores.length
                                    )
                                  : null;

                              return (
                                <tr
                                  key={student.uuid}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={student.avatar}
                                        alt={student.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                      <span className="font-medium text-gray-900">
                                        {student.name}
                                      </span>
                                    </div>
                                  </td>
                                  {progressRecords.map((record) => {
                                    const score = progressScores.find(
                                      (s) =>
                                        s.mentee_id === student.uuid &&
                                        s.report_id === record.id
                                    );
                                    return (
                                      <td
                                        key={record.id}
                                        className="text-center py-3 px-2"
                                      >
                                        {score?.points !== undefined &&
                                        score?.points !== null ? (
                                          <span className="text-gray-900">
                                            {score.points}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">
                                            -
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="text-center py-3 px-4">
                                    {avgScore !== null ? (
                                      <span className="font-semibold text-gray-900">
                                        {avgScore}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                      {classMentees.length > 20 &&
                        !selectedStudentId &&
                        !studentSearchQuery && (
                          <p className="text-sm text-gray-500 text-center mt-4">
                            Showing 20 of {classMentees.length} students. Use
                            search or filter to find specific students.
                          </p>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reports and Scores Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Reports List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-700">
                      Progress Reports
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateProgressOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Report
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {progressRecords.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => {
                          setSelectedRecord(rec);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition hover:shadow-md ${
                          selectedRecord?.id === rec.id
                            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900">
                            {rec.title}
                          </h4>
                          {selectedRecord?.id === rec.id && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(rec.progress_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {progressRecords.length === 0 && (
                      <p className="text-gray-400 italic">
                        No reports created yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Scores Editor */}
                <div className="lg:col-span-2">
                  {selectedRecord ? (
                    <Card>
                      <CardHeader className="border-b">
                        <CardTitle>{selectedRecord.title}</CardTitle>
                        <p className="text-sm text-gray-500">
                          Date:{" "}
                          {new Date(
                            selectedRecord.progress_date
                          ).toLocaleString()}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {progressLoading ? (
                          <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-500" />
                          </div>
                        ) : classMentees.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No students enrolled in this class.
                          </p>
                        ) : (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {classMentees.map((student) => {
                              const existingScore = progressScores.find(
                                (s) => s.mentee_id === student.uuid
                              );
                              return (
                                <ScoreRow
                                  key={student.uuid}
                                  student={student}
                                  initialScore={existingScore}
                                  reportId={selectedRecord.id}
                                  token={token}
                                  onUpdate={fetchAllScoresForRecords}
                                />
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-10">
                      <Edit2 className="h-12 w-12 mb-4 opacity-50" />
                      <p>Select a report to view or edit scores</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "attendance" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle>
                      Session on{" "}
                      {session.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          {session.start_time} - {session.end_time}
                        </p>
                        <p className="text-sm text-gray-500">
                          Location: {session.location}
                        </p>
                      </div>
                      <Badge
                        className={
                          session.status === "completed"
                            ? "bg-green-500 text-white"
                            : session.status === "cancelled"
                            ? "bg-red-500 text-white"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                    {session.status === "scheduled" && (
                      <Button
                        className="w-full mt-4"
                        onClick={() =>
                          navigate(`/class/${classId}/session/${session.id}`)
                        }
                      >
                        Manage Session
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Progress Report Modal */}
      {isCreateProgressOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Create New Report</h3>
              <button onClick={() => setIsCreateProgressOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Report Title (e.g., Week 5 Summary)"
              className="w-full border rounded p-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newProgressTitle}
              onChange={(e) => setNewProgressTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateProgressOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProgressRecord}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Score Row Component for Progress Tracking
interface ScoreRowProps {
  student: Student;
  initialScore?: ProgressScore;
  reportId: number;
  token: string | null;
  onUpdate: () => void;
}

function ScoreRow({
  student,
  initialScore,
  reportId,
  token,
  onUpdate,
}: ScoreRowProps) {
  const [points, setPoints] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPoints(initialScore?.points?.toString() || "");
    setComments(initialScore?.comments || "");
    setIsDirty(false);
  }, [initialScore]);

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);

    const payload = {
      points: points ? parseInt(points) : null,
      comments: comments,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let response;
      if (initialScore) {
        response = await fetch(
          `${BASE_URL}/progress/score/${initialScore.id}`,
          {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(
          `${BASE_URL}/progress/record/${reportId}/score`,
          {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
              mentee_id: student.uuid,
              points: payload.points,
              comments: payload.comments,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to save`);
      }

      setIsDirty(false);
      onUpdate();
    } catch (e) {
      console.error("Error saving score:", e);
      alert("Failed to save score.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-3 w-48 shrink-0">
        <img
          src={student.avatar}
          alt={student.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-gray-900">{student.name}</p>
          <p className="text-xs text-gray-500">
            ID: {student.uuid.slice(0, 8)}...
          </p>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-xs text-gray-500 mb-1">Points</label>
          <input
            type="number"
            value={points}
            onChange={(e) => {
              setPoints(e.target.value);
              setIsDirty(true);
            }}
            className="w-full border rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
            placeholder="0-100"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs text-gray-500 mb-1">Comments</label>
          <input
            type="text"
            value={comments}
            onChange={(e) => {
              setComments(e.target.value);
              setIsDirty(true);
            }}
            className="w-full border rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
            placeholder="Enter feedback..."
          />
        </div>
      </div>

      <div className="flex items-end justify-end w-24">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={isDirty ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default TutorClassDetailPage;
