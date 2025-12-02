import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  ChevronDown,
  ChevronRight,
  MapPin,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
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

export function TutorMyClassesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<GroupedSubject[]>([]);
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load tutor's confirmed classes from API
  const loadClasses = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const tutorClasses = await classService.getClassesByTutor(user.id);

      // Filter only confirmed classes (class_status === 'confirmed' or 'open')
      const confirmedClasses = tutorClasses.filter(
        (c) => c.class_status === "confirmed" || c.class_status === "open"
      );

      // Group classes by subject
      const grouped = classService.groupClassesBySubject(confirmedClasses);
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

  const toggleSubject = (subjectId: number) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
  };

  const getScheduleDisplay = (classItem: ClassData): string => {
    const dayName = DAYS_OF_WEEK[classItem.week_day] || classItem.week_day;
    return `${dayName} ${periodToTime(classItem.start_time)} - ${periodToTime(
      classItem.end_time
    )}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your classes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-900">
              My Classes
            </h1>

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
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Classes Content */}
        {subjects.length === 0 ? (
          <Card className="border-blue-200 border-dashed">
            <CardContent className="py-16 text-center">
              <Calendar className="h-16 w-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Confirmed Classes Yet
              </h3>
              <p className="text-gray-500 mb-6">
                You don't have any confirmed classes yet. Once your registered
                classes are confirmed, they will appear here.
              </p>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/tutor/registering")}
              >
                View Registering Classes
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
                  className="border-blue-200 hover:border-blue-400 transition-all duration-200 bg-white shadow-sm"
                >
                  {/* Subject Header - Clickable */}
                  <CardHeader
                    className="cursor-pointer hover:bg-blue-50 transition-colors rounded-t-lg"
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
                          <CardTitle className="text-xl md:text-2xl text-blue-900">
                            {subject.subject_name}
                          </CardTitle>
                          <p className="text-sm text-blue-600 font-semibold mt-1">
                            {subject.subject_code}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600">
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
                          const isFull =
                            classItem.current_enrolled >= classItem.capacity;

                          return (
                            <div
                              key={classItem.id}
                              className="border border-blue-200 rounded-lg overflow-hidden bg-gradient-to-r from-blue-50 to-white p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Class Info */}
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold text-blue-900">
                                      Class #{classItem.id}
                                    </h3>
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

                                {/* View Details Button */}
                                <Button
                                  onClick={() =>
                                    navigate(`/tutor/class/${classItem.id}`)
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  View Details
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
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
    </div>
  );
}
