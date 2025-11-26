"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  MessageSquare,
  User,
  CalendarDays,
  MapPin,
  Star
} from "lucide-react";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";

// ------------------------------------------------------------------
// 🧩 TYPES (Based on your PostgreSQL Schema)
// ------------------------------------------------------------------

type SessionStatus = "scheduled" | "completed" | "cancelled";

interface Session {
  class_id: number;
  session_id: number;       // matches schema
  session_date_time: string; // timestamp with time zone (ISO string)
  session_status: SessionStatus;
  location: string;
  meeting_notes?: string;
  // UI specific fields 
  attended: boolean; 
  topic: string; 
  duration_mins: number; 
}

interface ClassWithSessions {
  id: number;               // matches schema classes.id
  subject_name: string;     // joined from subjects table
  subject_code: string;     // joined from subjects table
  tutor_name: string;       // joined from users table
  num_of_weeks: number;
  current_enrolled: number;
  class_status: string;
  sessions: Session[];      // The 1:N relationship
}

// ------------------------------------------------------------------
// 🧩 MOCK DATA 
// ------------------------------------------------------------------

const MOCK_CLASSES: ClassWithSessions[] = [
  {
    id: 1,
    subject_name: "Advanced Mathematics",
    subject_code: "MATH301",
    tutor_name: "Dr. Sarah Johnson",
    num_of_weeks: 4,
    current_enrolled: 5,
    class_status: "active",
    sessions: [
      {
        class_id: 1,
        session_id: 1,
        session_date_time: "2025-11-01T09:00:00+07:00",
        session_status: "completed",
        location: "Online (Google Meet)",
        attended: true,
        topic: "Limits and Continuity",
        duration_mins: 90,
      },
      {
        class_id: 101,
        session_id: 2,
        session_date_time: "2025-11-08T09:00:00+07:00",
        session_status: "completed",
        location: "Online (Google Meet)",
        attended: true,
        topic: "Derivatives Introduction",
        duration_mins: 90,
      },
      {
        class_id: 101,
        session_id: 3,
        session_date_time: "2025-11-15T09:00:00+07:00",
        session_status: "scheduled",
        location: "Online (Google Meet)",
        attended: false,
        topic: "Applications of Derivatives",
        duration_mins: 90,
      },
      {
        class_id: 101,
        session_id: 4,
        session_date_time: "2025-11-22T09:00:00+07:00",
        session_status: "scheduled",
        location: "Online (Google Meet)",
        attended: false,
        topic: "Integrals Overview",
        duration_mins: 90,
      },
    ],
  },
  {
    id: 205,
    subject_name: "Data Structures & Algo",
    subject_code: "CS202",
    tutor_name: "Prof. Michael Chen",
    num_of_weeks: 6,
    current_enrolled: 8,
    class_status: "active",
    sessions: [
      {
        class_id: 205,
        session_id: 1,
        session_date_time: "2025-11-02T14:00:00+07:00",
        session_status: "completed",
        location: "Room H6-202",
        attended: false, // Missed
        topic: "Linked Lists & Arrays",
        duration_mins: 120,
      },
      {
        class_id: 205,
        session_id: 2,
        session_date_time: "2025-11-09T14:00:00+07:00",
        session_status: "scheduled",
        location: "Room H6-202",
        attended: false,
        topic: "Stacks and Queues",
        duration_mins: 120,
      },
    ],
  },
];

// ------------------------------------------------------------------
// 🛠️ HELPER FUNCTIONS
// ------------------------------------------------------------------

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    fullDate: date.toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })
  };
};

// ------------------------------------------------------------------
// ⚛️ COMPONENT
// ------------------------------------------------------------------

export function MySessionsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [classes] = useState<ClassWithSessions[]>(MOCK_CLASSES);
  // Default expanded to show the sessions immediately if desired, or keep empty
  const [expandedClassIds, setExpandedClassIds] = useState<Set<number>>(new Set());

  const toggleClassExpansion = (classId: number) => {
    setExpandedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  const handleFeedbackClick = (classId: number, sessionId: number) => {
    // Navigate to the specific feedback route
    navigate(`/mentee/sessions/feedback/${classId}/${sessionId}`);
  };

  // Filter Logic
  const filteredClasses = classes.filter((cls) =>
    cls.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.tutor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Classes & Sessions</h1>
          <p className="text-gray-500 mt-1">Review your learned sessions and provide feedback.</p>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by subject or tutor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg bg-white border-gray-200 shadow-sm rounded-xl"
          />
        </div>

        {/* Classes List */}
        <div className="space-y-6">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No classes found.</p>
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const isExpanded = expandedClassIds.has(cls.id);
              const completedCount = cls.sessions.filter(s => s.session_status === 'completed').length;

              return (
                <Card 
                  key={cls.id} 
                  className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all bg-white"
                >
                  {/* 1. Class Header Row */}
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {cls.subject_code}
                        </Badge>
                        <h2 className="text-xl font-bold text-gray-900">{cls.subject_name}</h2>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{cls.tutor_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <span>{cls.num_of_weeks} Weeks</span>
                          </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <span className="text-xs text-gray-500 uppercase font-semibold">Progress</span>
                          <div className="text-sm">
                             <span className="font-bold text-gray-900">{completedCount}</span>
                             <span className="text-gray-400"> / </span>
                             <span>{cls.sessions.length} Sessions</span>
                          </div>
                        </div>
                        <Button 
                          // Use a different variant (or none) since we are fully customizing the background
                          variant="default" // or remove this if you rely purely on className
                          onClick={() => toggleClassExpansion(cls.id)}
                          // New ClassName: White text (text-white) on a blue background (bg-blue-600) 
                          // with a dark blue hover effect (hover:bg-blue-700).
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {isExpanded ? "Hide Sessions" : "View Sessions"}
                          {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                  </div>

                  {/* 2. Sessions List (Accordion Body) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4 md:p-6 space-y-3">
                      {cls.sessions.map((session) => {
                        const { date, time } = formatDateTime(session.session_date_time);
                        const isCompleted = session.session_status === 'completed';
                        const isScheduled = session.session_status === 'scheduled';

                        return (
                          <div 
                            key={`${session.class_id}-${session.session_id}`}
                            className="flex flex-col md:flex-row items-center bg-white border border-gray-200 rounded-lg p-4 gap-4"
                          >
                            {/* Date Badge */}
                            <div className={`flex-shrink-0 w-full md:w-auto flex md:flex-col items-center justify-center md:w-20 h-12 md:h-16 rounded-md border gap-2 md:gap-0
                              ${isCompleted ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}
                            `}>
                               <span className="text-xs font-bold uppercase">{date.split(' ')[0]}</span>
                               <span className="text-lg font-bold">{date.split(' ')[1]}</span>
                            </div>

                            {/* Session Info */}
                            <div className="flex-1 w-full text-center md:text-left">
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  Session {session.session_id}: {session.topic}
                                </h4>
                                {/* Status Badges */}
                                {isCompleted && (
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0">
                                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" /> 
                                    {session.attended ? "Completed" : "Missed"}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {time} ({session.duration_mins}m)
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {session.location}
                                </span>
                              </div>
                            </div>

                            {/* Actions - Button Logic */}
                            <div className="flex-shrink-0 w-full md:w-auto">
                              {isScheduled ? null : (
                                <Button 
                                  variant={isCompleted ? "default" : "outline"} // Highlight feedback for completed
                                  className={`w-full md:w-auto ${isCompleted ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'border-gray-300 text-gray-700'}`}
                                  onClick={() => handleFeedbackClick(session.class_id, session.session_id)}
                                >
                                   {isCompleted ? <Star className="w-4 h-4 mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                                   Give Feedback
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}