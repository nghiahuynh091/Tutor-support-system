import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Users, AlertCircle, CheckCircle, Clock, Search, ExternalLink, Calendar } from "lucide-react";
import type { Subject, Class } from "@/types";
import { useNavigate } from "react-router-dom";

// Mock data - replace with actual API calls
const mockSubjects: Subject[] = [
  {
    id: 1,
    subject_name: "Calculus 1",
    subject_code: "MT1003",
    classes: [
      {
        id: "c1",
        subject_id: 1,
        subject_name: "Calculus 1",
        subject_code: "MT1003",
        class_code: "CC01",
        description: "basics calculus and algebra",
        tutor_id: "t1",
        tutor_name: "Prof. Phung Trong Thuc",
        max_students: 20,
        current_enrolled: 15,
        number_of_weeks: 12,
        meeting_link: null,
        registration_deadline: "2025-11-15T23:59:59",
        time_slots: [
          { id: "ts1", dayOfWeek: 1, startPeriod: 2, endPeriod: 4 },
          { id: "ts2", dayOfWeek: 4, startPeriod: 8, endPeriod: 10 }
        ],
        sessions: [],
        created_at: "2025-01-01"
      },
      {
        id: "c2",
        subject_id: 1,
        subject_name: "Giai Tich 1",
        subject_code: "MT1003",
        class_code: "CC02",
        description: "Basic mathematics foundation",
        tutor_id: "t2",
        tutor_name: "Prof. Phung Trong Thuc",
        max_students: 25,
        current_enrolled: 20,
        number_of_weeks: 12,
        meeting_link: null,
        registration_deadline: "2025-11-10T23:59:59",
        time_slots: [
          { id: "ts3", dayOfWeek: 2, startPeriod: 3, endPeriod: 5 },
        ],
        sessions: [],
        created_at: "2025-01-01"
      }
    ]
  },
  {
    id: 2,
    subject_name: "Physics 1",
    subject_code: "PH1003",
    classes: [
      {
        id: "c3",
        subject_id: 2,
        subject_name: "Physics 1",
        subject_code: "PH1003",
        class_code: "CC03",
        description: "Introduction to physics",
        tutor_id: "t3",
        tutor_name: "Prof. Dau The Phiet",
        max_students: 18,
        current_enrolled: 12,
        number_of_weeks: 12,
        meeting_link: null,
        registration_deadline: "2025-11-20T23:59:59",
        time_slots: [
          { id: "ts4", dayOfWeek: 1, startPeriod: 3, endPeriod: 5 },
          { id: "ts5", dayOfWeek: 3, startPeriod: 10, endPeriod: 12 }
        ],
        sessions: [],
        created_at: "2025-01-01"
      }
    ]
  }
];

const getDayName = (day: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || 'Unknown';
};

const periodToTime = (period: number): string => {
  const hour = period + 5;
  return `${hour.toString().padStart(2, '0')}:00`;
};

const formatDeadline = (deadline: string): string => {
  const date = new Date(deadline);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isDeadlinePassed = (deadline: string): boolean => {
  return new Date(deadline) < new Date();
};

interface ConflictInfo {
  hasConflict: boolean;
  conflictingClass?: {
    subject: string;
    classCode: string;
    day: string;
    periods: string;
  };
}

export function MenteeRegistrationPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [registeredClasses, setRegisteredClasses] = useState<Set<string>>(new Set());
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load subjects and registered classes
    setSubjects(mockSubjects);
    setFilteredSubjects(mockSubjects);
    // Mock registered classes - replace with actual API call
    setRegisteredClasses(new Set(['c1']));
  }, []);

  // Filter subjects based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubjects(subjects);
      setExpandedSubjects(new Set()); // Collapse when clearing search
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = subjects.filter(
      (subject) =>
        subject.subject_name.toLowerCase().includes(query) ||
        subject.subject_code.toLowerCase().includes(query) ||
        subject.classes.some(classItem => 
          classItem.tutor_name.toLowerCase().includes(query) ||
          classItem.class_code.toLowerCase().includes(query)
        )
    );
    setFilteredSubjects(filtered);
    setExpandedSubjects(new Set()); // Collapse when searching
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

  const checkTimeConflict = (classToCheck: Class): ConflictInfo => {
    // Check if any time slots conflict with already registered classes
    for (const registeredClassId of registeredClasses) {
      // Find the registered class
      let registeredClass: Class | null = null;
      for (const subject of subjects) {
        const found = subject.classes.find(c => c.id === registeredClassId);
        if (found) {
          registeredClass = found;
          break;
        }
      }

      if (!registeredClass) continue;

      // Check for time conflicts
      for (const newSlot of classToCheck.time_slots) {
        for (const existingSlot of registeredClass.time_slots) {
          // Same day?
          if (newSlot.dayOfWeek === existingSlot.dayOfWeek) {
            // Check if periods overlap
            const newStart = newSlot.startPeriod;
            const newEnd = newSlot.endPeriod;
            const existStart = existingSlot.startPeriod;
            const existEnd = existingSlot.endPeriod;

            if ((newStart < existEnd && newEnd > existStart)) {
              return {
                hasConflict: true,
                conflictingClass: {
                  subject: registeredClass.subject_name,
                  classCode: registeredClass.class_code,
                  day: getDayName(existingSlot.dayOfWeek),
                  periods: `${existStart}–${existEnd}`
                }
              };
            }
          }
        }
      }
    }

    return { hasConflict: false };
  };

  const handleRegister = (classId: string, classItem: Class) => {
    // Check if registration deadline has passed
    if (classItem.registration_deadline && isDeadlinePassed(classItem.registration_deadline)) {
      alert(`Registration deadline has passed for this class.`);
      return;
    }

    // Check if already registered for this subject
    const alreadyRegistered = subjects.some(subject => 
      subject.id === classItem.subject_id && 
      subject.classes.some(c => registeredClasses.has(c.id))
    );

    if (alreadyRegistered) {
      alert(`You are already registered for a ${classItem.subject_name} class.`);
      return;
    }

    // Check for time conflicts
    const conflict = checkTimeConflict(classItem);
    if (conflict.hasConflict) {
      setConflictInfo(conflict);
      setShowConflictModal(true);
      return;
    }

    // Show confirmation and register
    if (window.confirm(`Register for Class ${classItem.class_code} - ${classItem.subject_name}?`)) {
      // Call backend API here
      const newRegistered = new Set(registeredClasses);
      newRegistered.add(classId);
      setRegisteredClasses(newRegistered);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
      alert(`Successfully registered for ${classItem.class_code}! You are now enrolled in all sessions.`);
    }
  };

  const handleCancelRegistration = (classId: string, classItem: Class) => {
    const newRegisteredIds = new Set(registeredClasses);
    newRegisteredIds.delete(classId);
    setRegisteredClasses(newRegisteredIds);
    alert(`Registration cancelled for ${classItem.class_code}!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Register for Classes</h1>
              <p className="text-gray-600">Browse available subjects and enroll in classes.</p>
            </div>
            <button
              onClick={() => navigate("/mentee/schedule")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              My Schedule
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by subject name, code, class, or tutor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Success Toast */}
          {showSuccessModal && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-in slide-in-from-right">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Registered successfully!</span>
            </div>
          )}

          {/* Conflict Modal */}
          {showConflictModal && conflictInfo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="max-w-md w-full mx-4 p-6 bg-white">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-2">Schedule Conflict</h3>
                    <p className="text-gray-700 mb-4">
                      This class overlaps with another class in your schedule.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                      <p className="font-semibold text-red-800">Conflicting class:</p>
                      <p className="text-red-700">
                        {conflictInfo.conflictingClass?.classCode} ({conflictInfo.conflictingClass?.subject})
                      </p>
                      <p className="text-red-700">
                        {conflictInfo.conflictingClass?.day} {conflictInfo.conflictingClass?.periods}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowConflictModal(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700"
                >
                  Close
                </Button>
              </Card>
            </div>
          )}

          {/* Subjects List */}
          {filteredSubjects.length === 0 ? (
            <Card className="border-blue-200">
              <div className="py-12 text-center">
                <p className="text-gray-600">
                  {searchQuery ? "No subjects found matching your search." : "No available subjects at the moment."}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSubjects.map((subject) => {
                const isExpanded = expandedSubjects.has(subject.id);
                const classCount = subject.classes.length;
                
                return (
              <Card key={subject.id} className="border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white">
                <div
                  className="p-4 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors flex items-center justify-between"
                  onClick={() => toggleSubject(subject.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-blue-600" />
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{subject.subject_name}</h2>
                        <p className="text-sm text-blue-600 font-semibold mt-1">{subject.subject_code}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {classCount} {classCount === 1 ? 'class' : 'classes'}
                    </span>
                  </div>
                </div>

                {expandedSubjects.has(subject.id) && (
                  <div className="pt-0 pb-4 px-4 space-y-3">
                    {subject.classes.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No available classes at the moment.
                      </p>
                    ) : (
                      subject.classes.map((cls) => {
                        const isRegistered = registeredClasses.has(cls.id);
                        const isFull = cls.current_enrolled >= cls.max_students;
                        const deadlinePassed = cls.registration_deadline ? isDeadlinePassed(cls.registration_deadline) : false;
                        const canRegister = !isRegistered && !isFull && !deadlinePassed;

                        return (
                          <div
                            key={cls.id}
                            className="bg-blue-50/50 border-l-4 border-blue-400 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                          >
                            {/* Class Info */}
                            <div className="space-y-3">
                              {/* Class Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg font-bold text-blue-900">
                                      Class {cls.class_code}
                                    </span>
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                      {cls.number_of_weeks} weeks
                                    </span>
                                    {isRegistered && (
                                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                        Registered
                                      </span>
                                    )}
                                    {isFull && !isRegistered && (
                                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                        Full
                                      </span>
                                    )}
                                    {deadlinePassed && !isRegistered && (
                                      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                        Deadline Passed
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-gray-900">
                                      👨‍🏫 {cls.tutor_name}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Registration Deadline */}
                              {cls.registration_deadline && (
                                <div className={`flex items-center gap-2 text-xs ${deadlinePassed ? 'text-orange-600' : 'text-blue-600'}`}>
                                  <Calendar className="h-3 w-3" />
                                  <span className="font-medium">
                                    Registration {deadlinePassed ? 'closed' : 'deadline'}: {formatDeadline(cls.registration_deadline)}
                                  </span>
                                </div>
                              )}

                              {/* Description */}
                              {cls.description && (
                                <p className="text-sm text-gray-600">
                                  {cls.description}
                                </p>
                              )}

                              {/* Weekly Schedule */}
                              <div className="bg-white border border-blue-200 rounded p-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-700 uppercase">Weekly Schedule:</p>
                                <div className="flex flex-wrap gap-2">
                                  {cls.time_slots.map((slot) => (
                                    <div 
                                      key={slot.id}
                                      className="flex items-center gap-1 text-xs bg-purple-50 px-2 py-1 rounded border border-purple-200"
                                    >
                                      <Clock className="h-3 w-3 text-purple-600" />
                                      <span className="font-medium">
                                        {getDayName(slot.dayOfWeek)} {periodToTime(slot.startPeriod)}-{periodToTime(slot.endPeriod)}
                                      </span>
                                      <span className="text-gray-600">(P{slot.startPeriod}-{slot.endPeriod})</span>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {cls.time_slots.length} session{cls.time_slots.length !== 1 ? 's' : ''} per week
                                </p>
                              </div>

                              {/* Enrollment & Actions */}
                              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-gray-600" />
                                  <span className={`text-sm font-medium ${isFull ? "text-red-600" : "text-gray-700"}`}>
                                    {cls.current_enrolled} / {cls.max_students} enrolled
                                    {isFull && " (Full)"}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  {isRegistered ? (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleCancelRegistration(cls.id, cls)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                      >
                                        Cancel
                                      </Button>
                                      {cls.meeting_link && (
                                        <Button 
                                          size="sm"
                                          className="bg-blue-600 hover:bg-blue-700"
                                          asChild
                                        >
                                          <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                                            Join <ExternalLink className="ml-1 h-3 w-3" />
                                          </a>
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <Button 
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700"
                                      disabled={!canRegister}
                                      onClick={() => handleRegister(cls.id, cls)}
                                    >
                                      {isFull ? "Full" : deadlinePassed ? "Closed" : "Register"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
