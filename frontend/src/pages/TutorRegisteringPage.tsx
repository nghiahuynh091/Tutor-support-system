import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  ChevronDown,
  ChevronRight,
  MapPin,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { TutorCreateClassModal } from "@/components/TutorCreateClassModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  classService,
  type ClassData,
  type GroupedSubject,
} from "@/services/classService";

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
  const adjustedHour = (hour + 5) % 24;
  return `${adjustedHour.toString().padStart(2, "0")}:00`;
};

export function TutorRegisteringPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<GroupedSubject[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(
    null
  );
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Success toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load tutor's registering (unconfirmed) classes from API
  const loadClasses = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const tutorClasses = await classService.getClassesByTutor(user.id);

      // Filter only unconfirmed classes (class_status === 'scheduled' or anything not confirmed/open)
      const registeringClasses = tutorClasses.filter(
        (c) =>
          c.class_status === "scheduled" ||
          (c.class_status !== "confirmed" &&
            c.class_status !== "open" &&
            c.class_status !== "cancelled")
      );

      // Group classes by subject
      const grouped = classService.groupClassesBySubject(registeringClasses);
      setSubjects(grouped);
    } catch (err: any) {
      console.error("Failed to load classes:", err);
      setError(err.response?.data?.detail || "Failed to load classes");
    }
  }, [user?.id]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await loadClasses();
      setLoading(false);
    };

    if (user?.id) {
      initData();
    } else {
      setLoading(false);
    }
  }, [user?.id, loadClasses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleCreateSuccess = async () => {
    // Reload classes after creation
    await loadClasses();
    setIsCreateModalOpen(false);
    showSuccess("Class created successfully!");
  };

  const handleDeleteClass = async (classId: number, className: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete class "${className}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const result = await classService.deleteClass(classId);
      if (result.success) {
        await loadClasses();
        showSuccess(`${className} deleted successfully!`);
      } else {
        alert(result.error || "Failed to delete class");
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete class");
    }
  };

  const toggleSubject = (subjectId: number) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
    if (expandedSubjectId !== subjectId) {
      setExpandedClassId(null);
    }
  };

  const toggleClass = (classId: number) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
  };

  const getScheduleDisplay = (classItem: ClassData): string => {
    const dayName = DAYS_OF_WEEK[classItem.week_day] || classItem.week_day;
    return `${dayName} ${periodToTime(classItem.start_time)} - ${periodToTime(
      classItem.end_time
    )}`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Registering
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your registering classes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to view your classes.
            </p>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-in slide-in-from-right">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
              Registering Classes
            </h1>
            {/* <p className="text-gray-600">
              Create and manage classes awaiting confirmation
            </p> */}
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Class
            </Button>
          </div>
        </div>

        {/* Classes Content */}
        {subjects.length === 0 ? (
          <Card className="border-gray-200 border-dashed">
            <CardContent className="py-16 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Registering Classes
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't created any classes yet. Start by creating your
                first class!
              </p>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => {
              const isSubjectExpanded = expandedSubjectId === subject.id;

              return (
                <Card
                  key={subject.id}
                  className="border-gray-200 hover:border-gray-400 transition-all duration-200 bg-white shadow-sm"
                >
                  {/* Subject Header - Clickable */}
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg"
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isSubjectExpanded ? (
                          <ChevronDown className="h-5 w-5 text-blue-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-blue-600" />
                        )}
                        <div>
                          <CardTitle className="text-xl md:text-2xl text-gray-900">
                            {subject.subject_name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 font-semibold mt-1">
                            {subject.subject_code}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {subject.classes.length}{" "}
                        {subject.classes.length === 1 ? "class" : "classes"}
                      </Badge>
                    </div>
                  </CardHeader>

                  {/* Expanded Classes List */}
                  {isSubjectExpanded && (
                    <CardContent className="pt-0 pb-4 space-y-3">
                      {subject.classes.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No classes for this subject yet.
                        </p>
                      ) : (
                        subject.classes.map((classItem) => {
                          const isClassExpanded =
                            expandedClassId === classItem.id;
                          const isFull =
                            classItem.current_enrolled >= classItem.capacity;

                          return (
                            <div
                              key={classItem.id}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                              {/* Class Header - Clickable */}
                              <div
                                className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleClass(classItem.id)}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    {isClassExpanded ? (
                                      <ChevronDown className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                          Class #{classItem.id}
                                        </h3>
                                        {getStatusBadge(classItem.class_status)}
                                        {classItem.num_of_weeks && (
                                          <Badge
                                            variant="outline"
                                            className="text-purple-700 border-purple-300"
                                          >
                                            {classItem.num_of_weeks} weeks
                                          </Badge>
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="text-gray-600"
                                        >
                                          Semester {classItem.semester}
                                        </Badge>
                                      </div>

                                      {classItem.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                          {classItem.description}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4 text-blue-500" />
                                          <span>
                                            {getScheduleDisplay(classItem)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-4 w-4 text-blue-500" />
                                          <span
                                            className={
                                              isFull
                                                ? "text-red-600 font-semibold"
                                                : ""
                                            }
                                          >
                                            {classItem.current_enrolled}/
                                            {classItem.capacity} students
                                            {isFull && " (Full)"}
                                          </span>
                                        </div>
                                        {classItem.location && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            <span>{classItem.location}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    className="flex gap-2 flex-shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteClass(
                                          classItem.id,
                                          `Class #${classItem.id}`
                                        )
                                      }
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Class Details */}
                              {isClassExpanded && (
                                <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                                  {/* Schedule Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        Schedule Details
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Day:
                                          </span>
                                          <span className="font-medium">
                                            {DAYS_OF_WEEK[classItem.week_day] ||
                                              classItem.week_day}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Time:
                                          </span>
                                          <span className="font-medium">
                                            {periodToTime(classItem.start_time)}{" "}
                                            - {periodToTime(classItem.end_time)}
                                          </span>
                                        </div>
                                        {classItem.num_of_weeks && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">
                                              Duration:
                                            </span>
                                            <span className="font-medium">
                                              {classItem.num_of_weeks} weeks
                                            </span>
                                          </div>
                                        )}
                                        {classItem.registration_deadline && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">
                                              Registration Deadline:
                                            </span>
                                            <span className="font-medium">
                                              {new Date(
                                                classItem.registration_deadline
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4">
                                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-green-600" />
                                        Enrollment
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Enrolled:
                                          </span>
                                          <span className="font-medium">
                                            {classItem.current_enrolled}{" "}
                                            students
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Capacity:
                                          </span>
                                          <span className="font-medium">
                                            {classItem.capacity} students
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Available:
                                          </span>
                                          <span
                                            className={`font-medium ${
                                              isFull
                                                ? "text-red-600"
                                                : "text-green-600"
                                            }`}
                                          >
                                            {isFull
                                              ? "Class Full"
                                              : `${
                                                  classItem.capacity -
                                                  classItem.current_enrolled
                                                } spots`}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Meeting Link */}
                                  {classItem.meeting_link && (
                                    <div className="pt-3 border-t">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                                        asChild
                                      >
                                        <a
                                          href={classItem.meeting_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <ExternalLink className="mr-2 h-4 w-4" />
                                          Meeting Link
                                        </a>
                                      </Button>
                                    </div>
                                  )}

                                  {/* Info Note */}
                                  <div className="pt-3 border-t">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> This class is
                                        pending confirmation. Once confirmed by
                                        the admin, it will be moved to "My
                                        Classes" and you can manage assignments,
                                        progress tracking, and attendance.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Class Modal */}
      <TutorCreateClassModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
