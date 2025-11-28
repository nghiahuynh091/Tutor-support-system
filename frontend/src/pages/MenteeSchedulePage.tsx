import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  X,
  Calendar,
  BookOpen,
  ExternalLink,
} from "lucide-react";

// Types for calendar sessions
interface CalendarSession {
  id: string;
  class_id: string;
  subject_name: string;
  subject_code: string;
  class_code: string;
  tutor_name: string;
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  meeting_link: string | null;
  status: "scheduled" | "completed" | "cancelled";
}

// Mock data - replace with API call
const generateMockSessions = (weekStart: Date): CalendarSession[] => {
  const sessions: CalendarSession[] = [];
  const subjects = [
    {
      name: "Calculus 1",
      code: "MT1003",
      tutor: "Prof. Phung Trong Thuc",
      classCode: "CC01",
    },
    {
      name: "Physics 1",
      code: "PH1003",
      tutor: "Prof. Dau The Phiet",
      classCode: "CC03",
    },
    {
      name: "Programming",
      code: "CS1001",
      tutor: "Dr. Nguyen Van A",
      classCode: "CC05",
    },
  ];

  // Generate some sessions for the week
  const sessionPatterns = [
    {
      dayOffset: 0,
      startTime: "08:00",
      endTime: "10:00",
      subjectIdx: 0,
      location: "Room A101",
    },
    {
      dayOffset: 1,
      startTime: "14:00",
      endTime: "16:00",
      subjectIdx: 1,
      location: "Lab B202",
    },
    {
      dayOffset: 2,
      startTime: "09:00",
      endTime: "11:00",
      subjectIdx: 2,
      location: "Room C303",
    },
    {
      dayOffset: 3,
      startTime: "10:00",
      endTime: "12:00",
      subjectIdx: 0,
      location: "Room A101",
    },
    {
      dayOffset: 4,
      startTime: "13:00",
      endTime: "15:00",
      subjectIdx: 1,
      location: "Lab B202",
    },
  ];

  sessionPatterns.forEach((pattern, idx) => {
    const sessionDate = new Date(weekStart);
    sessionDate.setDate(sessionDate.getDate() + pattern.dayOffset);

    const subject = subjects[pattern.subjectIdx];
    sessions.push({
      id: `session-${idx}`,
      class_id: `class-${pattern.subjectIdx}`,
      subject_name: subject.name,
      subject_code: subject.code,
      class_code: subject.classCode,
      tutor_name: subject.tutor,
      date: sessionDate,
      start_time: pattern.startTime,
      end_time: pattern.endTime,
      location: pattern.location,
      description: `Weekly session for ${subject.name}. Please bring your materials and be prepared for the lecture.`,
      meeting_link:
        idx % 2 === 0 ? "https://meet.google.com/abc-defg-hij" : null,
      status: sessionDate < new Date() ? "completed" : "scheduled",
    });
  });

  return sessions;
};

// Get the start of the week (Monday)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export function MenteeSchedulePage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getWeekStart(new Date())
  );
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<CalendarSession | null>(null);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  // Load sessions when week changes
  useEffect(() => {
    const mockSessions = generateMockSessions(currentWeekStart);
    setSessions(mockSessions);
  }, [currentWeekStart]);

  // Navigation functions
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  // Get sessions for a specific day
  const getSessionsForDay = (date: Date): CalendarSession[] => {
    return sessions.filter(
      (session) => session.date.toDateString() === date.toDateString()
    );
  };

  // Get status color
  const getStatusColor = (status: CalendarSession["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBgColor = (status: CalendarSession["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      case "completed":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      case "cancelled":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                My Schedule
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage your weekly class schedule
              </p>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="px-4"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                className="flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Week Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
            </h2>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day, index) => {
              const daySessions = getSessionsForDay(day);
              const dayIsToday = isToday(day);

              return (
                <Card
                  key={index}
                  className={`min-h-[300px] p-3 ${
                    dayIsToday
                      ? "ring-2 ring-blue-500 bg-blue-50/50"
                      : "bg-white"
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`text-center pb-2 mb-3 border-b ${
                      dayIsToday ? "border-blue-300" : "border-gray-200"
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        dayIsToday ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                    {dayIsToday && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Sessions */}
                  <div className="space-y-2">
                    {daySessions.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">
                        No sessions
                      </p>
                    ) : (
                      daySessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all ${getStatusBgColor(
                            session.status
                          )}`}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(
                                session.status
                              )}`}
                            />
                            <span className="text-xs font-semibold text-gray-700 truncate">
                              {session.start_time}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {session.subject_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.location}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div
              className={`p-4 ${getStatusColor(
                selectedSession.status
              )} text-white`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase">
                    {selectedSession.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedSession.subject_name}
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedSession.subject_code} • Class{" "}
                {selectedSession.class_code}
              </p>

              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatFullDate(selectedSession.date)}
                    </p>
                    <p className="text-gray-600">
                      {selectedSession.start_time} - {selectedSession.end_time}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Location</p>
                    <p className="text-gray-600">{selectedSession.location}</p>
                  </div>
                </div>

                {/* Tutor */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Tutor</p>
                    <p className="text-gray-600">
                      {selectedSession.tutor_name}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t">
                  <p className="font-semibold text-gray-900 mb-2">
                    Description
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedSession.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex space-x-3">
                {selectedSession.meeting_link &&
                  selectedSession.status === "scheduled" && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      asChild
                    >
                      <a
                        href={selectedSession.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Session
                      </a>
                    </Button>
                  )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedSession(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
