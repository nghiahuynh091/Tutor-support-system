import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  Calendar,
  BookOpen,
  ExternalLink,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  sessionService,
  type CalendarSession,
} from "@/services/sessionService";

type ViewMode = "week" | "month";

// Get the start of the week (Monday)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get the start of the month
const getMonthStart = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get calendar grid start (Monday of the week containing the 1st)
const getCalendarGridStart = (date: Date): Date => {
  const monthStart = getMonthStart(date);
  return getWeekStart(monthStart);
};

// Format week range for display (e.g., "24-30 November 2025")
const formatWeekRange = (startDate: Date, endDate: Date): string => {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = endDate.toLocaleDateString("en-US", { month: "long" });
  const year = endDate.getFullYear();

  // Check if week spans two months
  if (startDate.getMonth() !== endDate.getMonth()) {
    const startMonth = startDate.toLocaleDateString("en-US", { month: "long" });
    return `${startDay} ${startMonth} - ${endDay} ${month} ${year}`;
  }

  return `${startDay}-${endDay} ${month} ${year}`;
};

const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// Check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Check if date is in current month
const isCurrentMonth = (date: Date, referenceDate: Date): boolean => {
  return (
    date.getMonth() === referenceDate.getMonth() &&
    date.getFullYear() === referenceDate.getFullYear()
  );
};

export function TutorSchedulePage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [allSessions, setAllSessions] = useState<CalendarSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<CalendarSession | null>(null);
  const [showMoreModal, setShowMoreModal] = useState<{
    date: Date;
    sessions: CalendarSession[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate start date based on view mode (memoized to prevent infinite loops)
  const startDate = useMemo(() => {
    return viewMode === "week"
      ? getWeekStart(currentDate)
      : getCalendarGridStart(currentDate);
  }, [viewMode, currentDate]);

  // Generate days array
  const days = useMemo(() => {
    return viewMode === "week"
      ? Array.from({ length: 7 }, (_, i) => {
          const day = new Date(startDate);
          day.setDate(day.getDate() + i);
          return day;
        })
      : Array.from({ length: 35 }, (_, i) => {
          const day = new Date(startDate);
          day.setDate(day.getDate() + i);
          return day;
        });
  }, [viewMode, startDate]);

  // Load all sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await sessionService.getTutorSessions();
        setAllSessions(data);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError("Failed to load your schedule. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filter sessions based on current view when date or view changes
  useEffect(() => {
    if (allSessions.length === 0) return;

    const endDate = new Date(startDate);
    if (viewMode === "week") {
      endDate.setDate(endDate.getDate() + 6);
    } else {
      endDate.setDate(endDate.getDate() + 34);
    }
    endDate.setHours(23, 59, 59, 999);

    const filteredSessions = sessionService.filterSessionsByDateRange(
      allSessions,
      startDate,
      endDate
    );
    setSessions(filteredSessions);
  }, [allSessions, startDate, viewMode]);

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
        return "bg-gray-400";
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
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
      case "cancelled":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  // Max sessions to show per day
  const maxVisibleSessions = viewMode === "week" ? 3 : 2;

  // Navigate to session detail or class page
  const handleViewDetails = (session: CalendarSession) => {
    // For tutor, navigate to the mark attendance page for this class
    navigate(`/tutor/mark_attendance/${session.class_id}`);
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
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* View Mode Toggle */}
              <div
                className="rounded-lg border border-gray-300 bg-gray-100"
                style={{
                  padding: "2px",
                  display: "inline-flex",
                  alignItems: "center",
                  height: "fit-content",
                }}
              >
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === "week"
                      ? "bg-blue-500 text-gray-50 shadow-sm"
                      : "text-black hover:text-white bg-white"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === "month"
                      ? "bg-blue-500 text-gray-50 shadow-sm"
                      : "text-black hover:text-white bg-white"
                  }`}
                >
                  Month
                </button>
              </div>

              {/* Navigation - Always visible */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  className="flex items-center gap-1 text-gray-700 border-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="px-4 text-gray-700 border-gray-300"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  className="flex items-center gap-1 text-gray-700 border-gray-300"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Date Range Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              {viewMode === "week"
                ? formatWeekRange(days[0], days[6])
                : formatMonthYear(currentDate)}
            </h2>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading your schedule...</p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="p-12 bg-red-50 border-red-200">
              <div className="flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600 mb-4" />
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Calendar Grid */}
          {!isLoading && !error && (
            <>
              <div
                className={`grid ${
                  viewMode === "week" ? "grid-cols-7" : "grid-cols-7"
                } gap-2`}
              >
                {/* Day Headers for Month View */}
                {viewMode === "month" && (
                  <>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center py-2 text-sm font-medium text-gray-500"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </>
                )}

                {days.map((day, index) => {
                  const daySessions = getSessionsForDay(day);
                  const dayIsToday = isToday(day);
                  const inCurrentMonth =
                    viewMode === "month"
                      ? isCurrentMonth(day, currentDate)
                      : true;
                  const visibleSessions = daySessions.slice(
                    0,
                    maxVisibleSessions
                  );
                  const hiddenCount = daySessions.length - maxVisibleSessions;

                  return (
                    <Card
                      key={index}
                      className={`${
                        viewMode === "week" ? "min-h-[300px]" : "min-h-[120px]"
                      } p-2 ${
                        dayIsToday
                          ? "ring-2 ring-blue-500 bg-blue-50/50"
                          : inCurrentMonth
                          ? "bg-white"
                          : "bg-gray-50/50"
                      }`}
                    >
                      {/* Day Header */}
                      <div
                        className={`text-center pb-1 mb-2 ${
                          viewMode === "week" ? "border-b" : ""
                        } ${
                          dayIsToday ? "border-blue-300" : "border-gray-200"
                        }`}
                      >
                        {viewMode === "week" && (
                          <p className="text-xs font-medium text-gray-500 uppercase">
                            {day.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </p>
                        )}
                        <p
                          className={`${
                            viewMode === "week" ? "text-2xl" : "text-lg"
                          } font-bold ${
                            dayIsToday
                              ? "text-blue-600"
                              : inCurrentMonth
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {day.getDate()}
                        </p>
                      </div>

                      {/* Sessions */}
                      <div className="space-y-1">
                        {daySessions.length === 0 ? (
                          <p
                            className={`text-center text-gray-400 text-xs ${
                              viewMode === "week" ? "py-4" : "py-1"
                            }`}
                          >
                            No sessions
                          </p>
                        ) : (
                          <>
                            {visibleSessions.map((session) => (
                              <div
                                key={session.id}
                                onClick={() => setSelectedSession(session)}
                                className={`p-1.5 rounded border cursor-pointer transition-all ${getStatusBgColor(
                                  session.status
                                )}`}
                              >
                                <div className="flex items-center space-x-1">
                                  <div
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(
                                      session.status
                                    )}`}
                                  />
                                  <span className="text-xs font-semibold text-gray-700 truncate">
                                    {session.start_time}
                                  </span>
                                </div>
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {session.subject_name}
                                </p>
                                {viewMode === "week" && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {session.location}
                                  </p>
                                )}
                              </div>
                            ))}
                            {hiddenCount > 0 && (
                              <button
                                onClick={() =>
                                  setShowMoreModal({
                                    date: day,
                                    sessions: daySessions,
                                  })
                                }
                                className="w-full text-xs font-medium py-1 rounded transition-colors bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                              >
                                +{hiddenCount} more
                              </button>
                            )}
                          </>
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
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">Cancelled</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* "More Sessions" Modal */}
      {showMoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-gray-100 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">
                  {showMoreModal.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-sm text-gray-500">
                  {showMoreModal.sessions.length} sessions
                </p>
              </div>
              <button
                onClick={() => setShowMoreModal(null)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Sessions List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {showMoreModal.sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setShowMoreModal(null);
                    setSelectedSession(session);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${getStatusBgColor(
                    session.status
                  )}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        session.status
                      )}`}
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      {session.start_time} - {session.end_time}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {session.subject_name}
                  </p>
                  <p className="text-sm text-gray-500">{session.location}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

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
                      {selectedSession.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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

                {/* Class Info */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Class</p>
                    <p className="text-gray-600">
                      {selectedSession.class_code}
                    </p>
                  </div>
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
                        Start Session
                      </a>
                    </Button>
                  )}
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleViewDetails(selectedSession)}
                >
                  Manage Session
                </Button>
                <Button
                  variant="outline"
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
