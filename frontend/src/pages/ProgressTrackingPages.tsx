import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Plus, Calendar, Save, Edit2, X, CheckCircle, BookOpen, Users, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
interface ClassSession {
  id: number;
  name: string;
  code: string; // e.g., "CS101"
  schedule: string; // e.g., "Mon/Wed 10:00 AM"
  studentCount: number;
  semester: string;
}

export function ProgressClassSelectionPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Mock API Call ---
  useEffect(() => {
    // In a real app: const res = await fetch('/api/tutor/my-classes');
    const fetchClasses = async () => {
      try {
        // Simulating network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockData: ClassSession[] = [
          {
            id: 1,
            name: "Introduction to Computer Science",
            code: "CS101",
            schedule: "Mon/Wed 09:00 AM",
            studentCount: 24,
            semester: "Fall 2024",
          },
          {
            id: 2,
            name: "Data Structures & Algorithms",
            code: "CS201",
            schedule: "Tue/Thu 02:00 PM",
            studentCount: 18,
            semester: "Fall 2024",
          },
          {
            id: 3,
            name: "Web Development Bootcamp",
            code: "WD300",
            schedule: "Fridays 10:00 AM",
            studentCount: 12,
            semester: "Fall 2024",
          },
        ];
        setClasses(mockData);
      } catch (error) {
        console.error("Failed to fetch classes", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // --- Handlers ---
  const handleClassSelect = (classId: number) => {
    // Navigate to the dashboard with the specific class ID
    navigate(`/tutor/progress/${classId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              Progress Tracking
            </h1>
            <p className="text-gray-600">
              Select a class below to manage reports, view student scores, and track performance.
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-gray-500">Loading your classes...</p>
            </div>
          ) : (
            /* Class Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => handleClassSelect(cls.id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer 
                             hover:shadow-md hover:border-blue-400 transition-all duration-200 group relative overflow-hidden"
                >
                  {/* Decorative Header Bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <BookOpen size={24} />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {cls.code}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                    {cls.name}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      {cls.schedule}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users size={16} className="mr-2 text-gray-400" />
                      {cls.studentCount} Students
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    View Progress <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {!isLoading && classes.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No Classes Found</h3>
                  <p className="text-gray-500 mt-1">You typically need to be assigned to a class to track progress.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
// --- Constants ---
const BASE_URL = "http://localhost:8002";

// --- Types ---

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

// --- Mock Roster Data ---
const MOCK_STUDENTS: Student[] = [
  { uuid: "80127470-f708-467a-81a9-4a614646ee14", name: "Kane Lee", avatar: "https://i.pravatar.cc/150?img=47" },
  { uuid: "123e4567-e89b-12d3-a456-426614174001", name: "Jane Doe", avatar: "https://i.pravatar.cc/150?img=32" },
];

export function ProgressTrackingPage() {
  const { classId } = useParams<{ classId: string }>();
  const { token } = useAuth();
  
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(null);
  const [scores, setScores] = useState<ProgressScore[]>([]);
  
  // UI States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- API Helper ---
  // Returns the standard headers needed for authenticated JSON requests
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  });

  // 1. Fetch Records (Class Notes)
  const fetchRecords = async () => {
    if (!classId || !token) return;
    try {
      const response = await fetch(`${BASE_URL}/progress/class/${classId}/notes`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch records");
      
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error(error);
      setRecords([]); 
    }
  };

  // 2. Fetch Scores for a specific Record
  const fetchScores = async (recordId: number) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/progress/record/${recordId}/scores`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch scores");

      const data = await response.json();
      setScores(data);
    } catch (error) {
      console.error(error);
      setScores([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchRecords();
  }, [classId, token]);

  // --- Handlers ---

  const handleCreateRecord = async () => {
    if (!newTitle || !classId || !token) return;

    try {
      const payload = {
        class_id: parseInt(classId),
        title: newTitle
      };

      const response = await fetch(`${BASE_URL}/progress/record`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create record");
      
      await fetchRecords();
      setIsCreateOpen(false);
      setNewTitle("");
    } catch (error) {
      console.error(error);
      alert("Failed to create new report.");
    }
  };

  const handleSelectRecord = (record: ProgressRecord) => {
    setSelectedRecord(record);
    fetchScores(record.id);
  };

  const handleScoreUpdate = () => {
    if (selectedRecord) fetchScores(selectedRecord.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h2 className="text-3xl font-bold text-blue-900">Class Progress Tracking</h2>
             <p className="text-gray-500">Manage reports and scores for Class ID: {classId}</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <Plus size={20} /> New Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: List of Reports */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Progress Reports</h3>
            <div className="space-y-3">
              {records.map((rec) => (
                <div 
                  key={rec.id}
                  onClick={() => handleSelectRecord(rec)}
                  className={`p-4 rounded-lg border cursor-pointer transition hover:shadow-md ${
                    selectedRecord?.id === rec.id 
                      ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" 
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    {selectedRecord?.id === rec.id && <CheckCircle size={16} className="text-blue-500"/>}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar size={14} className="mr-1" />
                    {new Date(rec.progress_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {records.length === 0 && <p className="text-gray-400 italic">No reports created yet.</p>}
            </div>
          </div>

          {/* RIGHT COLUMN: Details & Scores */}
          <div className="lg:col-span-2">
            {selectedRecord ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="border-b pb-4 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedRecord.title}</h3>
                  <p className="text-sm text-gray-500">Date: {new Date(selectedRecord.progress_date).toLocaleString()}</p>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-10">
                     <Loader2 className="animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {MOCK_STUDENTS.map((student) => {
                      const existingScore = scores.find(s => s.mentee_id === student.uuid);
                      return (
                        <ScoreRow 
                          key={student.uuid} 
                          student={student} 
                          initialScore={existingScore} 
                          reportId={selectedRecord.id}
                          onUpdate={handleScoreUpdate}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-10">
                <Edit2 size={48} className="mb-4 opacity-50" />
                <p>Select a report to view or edit scores</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Create New Report</h3>
              <button onClick={() => setIsCreateOpen(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            <input 
              type="text" 
              placeholder="Report Title (e.g., Week 5 Summary)" 
              className="w-full border rounded p-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleCreateRecord} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// --- Sub-Component: Score Row ---
interface ScoreRowProps {
    student: Student;
    initialScore?: ProgressScore;
    reportId: number;
    onUpdate: () => void;
}

function ScoreRow({ student, initialScore, reportId, onUpdate }: ScoreRowProps) {
  const [points, setPoints] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();

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
        comments: comments
    };

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    try {
        let response;
        if (initialScore) {
            // CASE 1: UPDATE EXISTING SCORE (PATCH)
            response = await fetch(`${BASE_URL}/progress/score/${initialScore.id}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify(payload)
            });
        } else {
            // CASE 2: CREATE NEW SCORE (POST)
            response = await fetch(`${BASE_URL}/progress/record/${reportId}/score`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    mentee_id: student.uuid,
                    points: payload.points,
                    comments: payload.comments
                })
            });
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
      {/* Student Info */}
      <div className="flex items-center gap-3 w-48 shrink-0">
        <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-semibold text-gray-900">{student.name}</p>
          <p className="text-xs text-gray-500">ID: {student.uuid.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-1">
            <label className="block text-xs text-gray-500 mb-1">Points</label>
            <input 
                type="number" 
                value={points}
                onChange={(e) => { setPoints(e.target.value); setIsDirty(true); }}
                className="w-full border rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                placeholder="0-100"
            />
        </div>
        <div className="sm:col-span-3">
            <label className="block text-xs text-gray-500 mb-1">Comments</label>
            <input 
                type="text" 
                value={comments}
                onChange={(e) => { setComments(e.target.value); setIsDirty(true); }}
                className="w-full border rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none"
                placeholder="Enter feedback..."
            />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-end justify-end w-24">
        <button 
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition ${
                isDirty 
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
            <Save size={16} />
            {isSaving ? "..." : "Save"}
        </button>
      </div>
    </div>
  );
}