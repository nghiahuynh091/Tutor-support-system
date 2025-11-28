import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  ExternalLink,
  Calendar,
  Loader2,
  Filter,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  registrationService,
  type Subject,
  type Class,
  type ConflictDetail,
} from "@/services/registrationService";
import { useAuth } from "@/contexts/AuthContext";

const getDayName = (day: number | string): string => {
  if (typeof day === "string") {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  }
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day] || "Unknown";
};

const periodToTime = (period: number): string => {
  const hour = period + 5;
  return `${hour.toString().padStart(2, "0")}:00`;
};

const formatDeadline = (deadline: string): string => {
  const date = new Date(deadline);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isDeadlinePassed = (deadline: string): boolean => {
  return new Date(deadline) < new Date();
};

interface ConflictInfo {
  hasConflict: boolean;
  conflicts?: ConflictDetail[];
}

export function MenteeRegistrationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(
    new Set()
  );
  const [registeredClasses, setRegisteredClasses] = useState<Set<number>>(
    new Set()
  );
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [myClassesExpanded, setMyClassesExpanded] = useState<Set<number>>(
    new Set()
  );

  // Get current mentee ID
  const menteeId = user?.id || "";

  useEffect(() => {
    if (menteeId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [menteeId]);

  const loadData = async () => {
    if (!menteeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load all classes and registered classes in parallel
      const [allClasses, myRegistrations] = await Promise.all([
        registrationService.getAllClasses(),
        registrationService.getMyRegistrations(menteeId),
      ]);

      console.log("📚 All classes loaded:", allClasses.length);
      console.log("✅ My registrations:", myRegistrations);
      console.log(
        "📋 Registration IDs:",
        myRegistrations.map((r) => r.id)
      );

      // Group classes by subject
      const subjectsMap = new Map<number, Subject>();

      allClasses.forEach((cls: Class) => {
        if (!subjectsMap.has(cls.subject_id)) {
          subjectsMap.set(cls.subject_id, {
            id: cls.subject_id,
            subject_name: cls.subject_name,
            subject_code: cls.subject_code,
            classes: [],
          });
        }
        subjectsMap.get(cls.subject_id)!.classes.push(cls);
      });

      const groupedSubjects = Array.from(subjectsMap.values());
      setSubjects(groupedSubjects);
      setFilteredSubjects(groupedSubjects);

      // Extract registered class IDs
      const registeredIds = new Set(myRegistrations.map((cls) => cls.id));
      console.log("🎯 Registered class IDs Set:", Array.from(registeredIds));
      setRegisteredClasses(registeredIds);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter subjects based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubjects(subjects);
      setExpandedSubjects(new Set());
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = subjects.filter(
      (subject) =>
        subject.subject_name.toLowerCase().includes(query) ||
        subject.subject_code.toLowerCase().includes(query) ||
        subject.classes.some((classItem) =>
          classItem.tutor_name?.toLowerCase().includes(query)
        )
    );
    setFilteredSubjects(filtered);
    setExpandedSubjects(new Set());
  }, [searchQuery, subjects]);

  const toggleSubject = (subjectId: number) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleRegister = async (classId: number, classItem: Class) => {
    if (!menteeId) {
      alert("Please login to register for classes.");
      navigate("/login");
      return;
    }

    // Check if registration deadline has passed
    if (
      classItem.registration_deadline &&
      isDeadlinePassed(classItem.registration_deadline)
    ) {
      alert(`Registration deadline has passed for this class.`);
      return;
    }

    // Check if already registered for this subject in same semester
    const alreadyRegistered = subjects.some(
      (subject) =>
        subject.id === classItem.subject_id &&
        subject.classes.some(
          (c) =>
            registeredClasses.has(c.id) && c.semester === classItem.semester
        )
    );

    if (alreadyRegistered) {
      alert(
        `You are already registered for a ${classItem.subject_name} class in semester ${classItem.semester}.`
      );
      return;
    }

    try {
      setRegistering(classId);

      // Call registration API
      const result = await registrationService.register(classId, menteeId);

      if (result.success) {
        // Reload data to get updated state
        await loadData();

        setSuccessMessage(`Successfully registered for Class ${classId}!`);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        // Handle errors
        if (result.conflicts && result.conflicts.length > 0) {
          setConflictInfo({
            hasConflict: true,
            conflicts: result.conflicts,
          });
          setShowConflictModal(true);
        } else {
          alert(result.error || "Registration failed. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      alert(error.message || "Failed to register. Please try again.");
    } finally {
      setRegistering(null);
    }
  };

  const handleCancelRegistration = async (classId: number) => {
    if (!menteeId) return;

    if (
      !window.confirm(
        `Are you sure you want to cancel registration for Class ${classId}?`
      )
    ) {
      return;
    }

    try {
      const result = await registrationService.cancel(classId, menteeId);

      if (result.success) {
        // Reload data to get updated state
        await loadData();

        setSuccessMessage(`Registration cancelled for Class ${classId}!`);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        alert(result.error || "Failed to cancel registration.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel registration. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading classes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!menteeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Please login to view and register for classes.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Classes</h1>
            <button
              onClick={() => navigate("/mentee/schedule")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              My Schedule
            </button>
          </div>

          {/* Search Bar with Filter */}
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by subject name, code, or tutor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  className="h-12 px-4 border-blue-200 hover:bg-blue-50 flex items-center gap-2"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Filter</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      filterOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      {[
                        { value: "all", label: "All Classes" },
                        { value: "available", label: "Available Only" },
                        { value: "hasSpace", label: "Has Space" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedFilter(option.value);
                            setFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                            selectedFilter === option.value
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Toast */}
          {showSuccessModal && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-in slide-in-from-right">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Conflict Modal */}
          {showConflictModal &&
            conflictInfo &&
            conflictInfo.conflicts &&
            conflictInfo.conflicts.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-2xl w-full mx-4 p-6 bg-white max-h-[80vh] overflow-y-auto">
                  <div className="flex items-start space-x-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-600 mb-2">
                        Schedule Conflict Detected
                      </h3>
                      <p className="text-gray-700 mb-4">
                        This class overlaps with {conflictInfo.conflicts.length}{" "}
                        class{conflictInfo.conflicts.length > 1 ? "es" : ""} in
                        your schedule.
                      </p>

                      <div className="space-y-3">
                        {conflictInfo.conflicts.map((conflict, idx) => (
                          <div
                            key={idx}
                            className="bg-red-50 border border-red-200 rounded p-4"
                          >
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="font-semibold text-red-800 mb-2">
                                  Current Class:
                                </p>
                                <div className="text-sm text-red-700 space-y-1">
                                  <p>
                                    <strong>Subject:</strong>{" "}
                                    {conflict.conflicting_subject_code} -{" "}
                                    {conflict.conflicting_subject}
                                  </p>
                                  <p>
                                    <strong>Day:</strong>{" "}
                                    {getDayName(conflict.conflicting_week_day)}
                                  </p>
                                  <p>
                                    <strong>Time:</strong>{" "}
                                    {periodToTime(
                                      conflict.conflicting_start_time
                                    )}{" "}
                                    -{" "}
                                    {periodToTime(
                                      conflict.conflicting_end_time
                                    )}
                                  </p>
                                  <p>
                                    <strong>Location:</strong>{" "}
                                    {conflict.conflicting_location || "TBA"}
                                  </p>
                                  <p>
                                    <strong>Tutor:</strong>{" "}
                                    {conflict.conflicting_tutor_name}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="font-semibold text-orange-800 mb-2">
                                  New Class:
                                </p>
                                <div className="text-sm text-orange-700 space-y-1">
                                  <p>
                                    <strong>Subject:</strong>{" "}
                                    {conflict.new_subject_code} -{" "}
                                    {conflict.new_subject}
                                  </p>
                                  <p>
                                    <strong>Day:</strong>{" "}
                                    {getDayName(conflict.new_week_day)}
                                  </p>
                                  <p>
                                    <strong>Time:</strong>{" "}
                                    {periodToTime(conflict.new_start_time)} -{" "}
                                    {periodToTime(conflict.new_end_time)}
                                  </p>
                                  <p>
                                    <strong>Location:</strong>{" "}
                                    {conflict.new_location || "TBA"}
                                  </p>
                                  <p>
                                    <strong>Tutor:</strong>{" "}
                                    {conflict.new_tutor_name}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowConflictModal(false)}
                    className="w-full bg-gray-600 hover:bg-gray-700 mt-4"
                  >
                    Close
                  </Button>
                </Card>
              </div>
            )}

          {/* ===== MY CLASSES SECTION ===== */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              My Classes
            </h2>

            {subjects.filter((subject) =>
              subject.classes.some((cls) => registeredClasses.has(cls.id))
            ).length === 0 ? (
              <Card className="border-gray-200 bg-gray-50">
                <div className="py-8 text-center">
                  <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No registered classes yet</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {subjects
                  .filter((subject) =>
                    subject.classes.some((cls) => registeredClasses.has(cls.id))
                  )
                  .map((subject) => {
                    const registeredClassesInSubject = subject.classes.filter(
                      (cls) => registeredClasses.has(cls.id)
                    );
                    const isExpanded = myClassesExpanded.has(subject.id);

                    return (
                      <Card
                        key={subject.id}
                        className="border-green-200 bg-white overflow-hidden"
                      >
                        {/* Subject Header - Horizontal */}
                        <div
                          className="px-4 py-3 bg-green-50 hover:bg-green-100 cursor-pointer transition-colors flex items-center justify-between"
                          onClick={() => {
                            const newExpanded = new Set(myClassesExpanded);
                            if (newExpanded.has(subject.id)) {
                              newExpanded.delete(subject.id);
                            } else {
                              newExpanded.add(subject.id);
                            }
                            setMyClassesExpanded(newExpanded);
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {subject.subject_name}
                            </h3>
                            <span className="text-sm text-green-600 font-semibold flex-shrink-0">
                              {subject.subject_code}
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0 ml-2">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {registeredClassesInSubject.length} enrolled
                          </span>
                        </div>

                        {/* Expanded - Table Layout */}
                        {isExpanded && (
                          <div className="px-4 py-3">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-green-200 text-left text-gray-600">
                                  <th className="pb-2 font-semibold w-20">
                                    Class
                                  </th>
                                  <th className="pb-2 font-semibold w-32">
                                    Tutor
                                  </th>
                                  <th className="pb-2 font-semibold w-40">
                                    Schedule
                                  </th>
                                  <th className="pb-2 font-semibold w-28">
                                    Location
                                  </th>
                                  <th className="pb-2 font-semibold w-16">
                                    Weeks
                                  </th>
                                  <th className="pb-2 font-semibold w-24 text-right">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {registeredClassesInSubject.map((cls) => (
                                  <tr
                                    key={cls.id}
                                    className="border-b border-green-100 last:border-b-0 hover:bg-green-50/50"
                                  >
                                    <td className="py-2.5 font-bold text-green-800">
                                      #{cls.id}
                                    </td>
                                    <td
                                      className="py-2.5 text-gray-700 truncate max-w-[120px]"
                                      title={cls.tutor_name}
                                    >
                                      {cls.tutor_name}
                                    </td>
                                    <td className="py-2.5 text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                        <span className="truncate">
                                          {getDayName(cls.week_day)}{" "}
                                          {periodToTime(cls.start_time)}-
                                          {periodToTime(cls.end_time)}
                                        </span>
                                      </div>
                                    </td>
                                    <td
                                      className="py-2.5 text-gray-500 truncate max-w-[100px]"
                                      title={cls.location || "TBA"}
                                    >
                                      {cls.location || "TBA"}
                                    </td>
                                    <td className="py-2.5">
                                      {cls.num_of_weeks && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                          {cls.num_of_weeks}w
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {cls.meeting_link && (
                                          <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                                            asChild
                                          >
                                            <a
                                              href={cls.meeting_link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              Join{" "}
                                              <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                          </Button>
                                        )}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleCancelRegistration(cls.id)
                                          }
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 h-7 text-xs"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>

          {/* ===== REGISTRATION SECTION ===== */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Registration
            </h2>

            {filteredSubjects.length === 0 ? (
              <Card className="border-blue-200">
                <div className="py-12 text-center">
                  <p className="text-gray-600">
                    {searchQuery
                      ? "No subjects found matching your search."
                      : "No available subjects at the moment."}
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="border-blue-200 bg-white overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <div className="space-y-0 divide-y divide-blue-100">
                    {filteredSubjects.map((subject) => {
                      const isExpanded = expandedSubjects.has(subject.id);
                      const classCount = subject.classes.length;

                      return (
                        <div key={subject.id}>
                          {/* Subject Header - Horizontal */}
                          <div
                            className="px-4 py-3 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors flex items-center justify-between sticky top-0 z-10"
                            onClick={() => toggleSubject(subject.id)}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              )}
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {subject.subject_name}
                              </h3>
                              <span className="text-sm text-blue-600 font-semibold flex-shrink-0">
                                {subject.subject_code}
                              </span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0 ml-2">
                              {classCount}{" "}
                              {classCount === 1 ? "class" : "classes"}
                            </span>
                          </div>

                          {/* Expanded - Table Layout */}
                          {isExpanded && (
                            <div className="px-4 py-3 bg-white">
                              {subject.classes.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-2">
                                  No available classes at the moment.
                                </p>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-blue-200 text-left text-gray-600">
                                      <th className="pb-2 font-semibold w-20">
                                        Class
                                      </th>
                                      <th className="pb-2 font-semibold w-20">
                                        Status
                                      </th>
                                      <th className="pb-2 font-semibold w-28">
                                        Tutor
                                      </th>
                                      <th className="pb-2 font-semibold w-36">
                                        Schedule
                                      </th>
                                      <th className="pb-2 font-semibold w-24">
                                        Location
                                      </th>
                                      <th className="pb-2 font-semibold w-14">
                                        Weeks
                                      </th>
                                      <th className="pb-2 font-semibold w-12">
                                        Sem
                                      </th>
                                      <th className="pb-2 font-semibold w-16">
                                        Slots
                                      </th>
                                      <th className="pb-2 font-semibold w-28 text-right">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {subject.classes.map((cls) => {
                                      const isRegistered =
                                        registeredClasses.has(cls.id);
                                      const isFull =
                                        cls.current_enrolled >= cls.capacity;
                                      const deadlinePassed =
                                        cls.registration_deadline
                                          ? isDeadlinePassed(
                                              cls.registration_deadline
                                            )
                                          : false;
                                      const canRegister =
                                        !isRegistered &&
                                        !isFull &&
                                        !deadlinePassed;
                                      const isCurrentlyRegistering =
                                        registering === cls.id;

                                      return (
                                        <tr
                                          key={cls.id}
                                          className="border-b border-blue-100 last:border-b-0 hover:bg-blue-50/50"
                                        >
                                          <td className="py-2.5 font-bold text-blue-800">
                                            #{cls.id}
                                          </td>
                                          <td className="py-2.5">
                                            {isRegistered ? (
                                              <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                                                Registered
                                              </span>
                                            ) : isFull ? (
                                              <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                                                Full
                                              </span>
                                            ) : deadlinePassed ? (
                                              <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                                                Closed
                                              </span>
                                            ) : (
                                              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                                                Open
                                              </span>
                                            )}
                                          </td>
                                          <td
                                            className="py-2.5 text-gray-700 truncate max-w-[100px]"
                                            title={cls.tutor_name}
                                          >
                                            {cls.tutor_name}
                                          </td>
                                          <td className="py-2.5 text-gray-600">
                                            <div className="flex items-center gap-1">
                                              <Clock className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                              <span className="truncate text-xs">
                                                {getDayName(cls.week_day)}{" "}
                                                {periodToTime(cls.start_time)}-
                                                {periodToTime(cls.end_time)}
                                              </span>
                                            </div>
                                          </td>
                                          <td
                                            className="py-2.5 text-gray-500 truncate max-w-[90px]"
                                            title={cls.location || "TBA"}
                                          >
                                            {cls.location || "TBA"}
                                          </td>
                                          <td className="py-2.5">
                                            {cls.num_of_weeks && (
                                              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                                {cls.num_of_weeks}w
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2.5">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                              {cls.semester}
                                            </span>
                                          </td>
                                          <td className="py-2.5">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                              <Users className="h-3 w-3 flex-shrink-0" />
                                              <span
                                                className={
                                                  isFull
                                                    ? "text-red-600 font-semibold"
                                                    : ""
                                                }
                                              >
                                                {cls.current_enrolled}/
                                                {cls.capacity}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="py-2.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                              {isRegistered ? (
                                                <>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleCancelRegistration(
                                                        cls.id
                                                      )
                                                    }
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 h-6 text-xs px-2"
                                                  >
                                                    Cancel
                                                  </Button>
                                                  {cls.meeting_link && (
                                                    <Button
                                                      size="sm"
                                                      className="bg-blue-600 hover:bg-blue-700 h-6 text-xs px-2"
                                                      asChild
                                                    >
                                                      <a
                                                        href={cls.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                      >
                                                        Join
                                                      </a>
                                                    </Button>
                                                  )}
                                                </>
                                              ) : (
                                                <Button
                                                  size="sm"
                                                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed h-6 text-xs px-2"
                                                  disabled={
                                                    !canRegister ||
                                                    isCurrentlyRegistering
                                                  }
                                                  onClick={() =>
                                                    handleRegister(cls.id, cls)
                                                  }
                                                >
                                                  {isCurrentlyRegistering ? (
                                                    <>
                                                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                      ...
                                                    </>
                                                  ) : isFull ? (
                                                    "Full"
                                                  ) : deadlinePassed ? (
                                                    "Closed"
                                                  ) : (
                                                    "Register"
                                                  )}
                                                </Button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}

                              {/* Deadline info below table if any class has deadline */}
                              {subject.classes.some(
                                (cls) => cls.registration_deadline
                              ) && (
                                <div className="mt-2 pt-2 border-t border-blue-100">
                                  {subject.classes
                                    .filter((cls) => cls.registration_deadline)
                                    .map((cls) => {
                                      const deadlinePassed = isDeadlinePassed(
                                        cls.registration_deadline!
                                      );
                                      return (
                                        <div
                                          key={cls.id}
                                          className={`flex items-center gap-1 text-xs ${
                                            deadlinePassed
                                              ? "text-orange-600"
                                              : "text-blue-600"
                                          }`}
                                        >
                                          <Calendar className="h-3 w-3" />
                                          <span>
                                            Class #{cls.id}{" "}
                                            {deadlinePassed
                                              ? "closed"
                                              : "deadline"}
                                            :{" "}
                                            {formatDeadline(
                                              cls.registration_deadline!
                                            )}
                                          </span>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
