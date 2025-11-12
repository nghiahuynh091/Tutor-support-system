import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle, Users, ExternalLink } from "lucide-react";
import type { Class } from "@/types";
import { useNavigate } from "react-router-dom";

interface RegisteredClass extends Class {
  deadlineRegister: string;
  status: 'Active' | 'Confirmed';
}

// Mock data - replace with actual API calls
const mockRegisteredClasses: RegisteredClass[] = [
  {
    id: "c1",
    subject_id: 1,
    subject_name: "Calculus 1",
    subject_code: "MT1003",
    class_code: "CC01",
    description: "calculus basics",
    tutor_id: "t1",
    tutor_name: "Prof. Phung Trong Thuc",
    max_students: 20,
    current_enrolled: 15,
    number_of_weeks: 12,
    meeting_link: null,
    time_slots: [
      { id: "ts1", dayOfWeek: 1, startPeriod: 2, endPeriod: 4 },
      { id: "ts2", dayOfWeek: 4, startPeriod: 8, endPeriod: 10 }
    ],
    sessions: [],
    created_at: "2025-01-01",
    deadlineRegister: "2025-11-02T23:59:00",
    status: "Active"
  },
  {
    id: "c3",
    subject_id: 2,
    subject_name: "Physics 1",
    subject_code: "PH1003",
    class_code: "CC03",
    description: "Basic physics",
    tutor_id: "t3",
    tutor_name: "Prof. Dau The Phiet",
    max_students: 18,
    current_enrolled: 12,
    number_of_weeks: 12,
    meeting_link: null,
    time_slots: [
      { id: "ts4", dayOfWeek: 1, startPeriod: 10, endPeriod: 12 },
      { id: "ts5", dayOfWeek: 3, startPeriod: 10, endPeriod: 12 }
    ],
    sessions: [],
    created_at: "2025-01-01",
    deadlineRegister: "2025-10-25T23:59:00",
    status: "Confirmed"
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

const isBeforeDeadline = (deadline: string): boolean => {
  return new Date() < new Date(deadline);
};

export function MenteeSchedulePage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<RegisteredClass[]>([]);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedClassForReschedule, setSelectedClassForReschedule] = useState<RegisteredClass | null>(null);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Load registered classes - replace with API call
    setClasses(mockRegisteredClasses);
  }, []);

  const toggleClass = (classId: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  const handleCancel = (cls: RegisteredClass) => {
    if (window.confirm(`Cancel registration for Class ${cls.class_code}?`)) {
      // Call API to cancel registration
      setClasses(classes.filter(c => c.id !== cls.id));
      setSuccessMessage("Cancelled successfully.");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleReschedule = (cls: RegisteredClass) => {
    setSelectedClassForReschedule(cls);
    
    // Mock available classes for the same subject
    const mockAvailable: Class[] = [
      {
        id: "c2",
        subject_id: cls.subject_id,
        subject_name: cls.subject_name,
        subject_code: cls.subject_code,
        class_code: "CC02",
        description: "Alternative schedule",
        tutor_id: "t2",
        tutor_name: "Prof. Johnson",
        max_students: 25,
        current_enrolled: 20,
        number_of_weeks: 12,
        meeting_link: null,
        time_slots: [
          { id: "ts3", dayOfWeek: 2, startPeriod: 3, endPeriod: 5 },
        ],
        sessions: [],
        created_at: "2025-01-01"
      },
      {
        id: "c4",
        subject_id: cls.subject_id,
        subject_name: cls.subject_name,
        subject_code: cls.subject_code,
        class_code: "CC04",
        description: "Evening classes",
        tutor_id: "t4",
        tutor_name: "Dr. Williams",
        max_students: 20,
        current_enrolled: 18,
        number_of_weeks: 12,
        meeting_link: null,
        time_slots: [
          { id: "ts6", dayOfWeek: 3, startPeriod: 12, endPeriod: 14 },
        ],
        sessions: [],
        created_at: "2025-01-01"
      }
    ];
    
    setAvailableClasses(mockAvailable);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = (newClass: Class) => {
    if (!selectedClassForReschedule) return;

    // Cancel old class and register for new one
    const updatedClasses = classes.filter(c => c.id !== selectedClassForReschedule.id);
    
    // Add the new class with the same deadline and status structure
    const newRegisteredClass: RegisteredClass = {
      ...newClass,
      deadlineRegister: selectedClassForReschedule.deadlineRegister,
      status: "Active"
    };
    
    updatedClasses.push(newRegisteredClass);
    setClasses(updatedClasses);
    
    setShowRescheduleModal(false);
    setSuccessMessage(`Rescheduled to Class ${newClass.class_code} (${newClass.subject_name}).`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Group classes by subject
  const groupedBySubject = classes.reduce((acc, cls) => {
    if (!acc[cls.subject_name]) {
      acc[cls.subject_name] = [];
    }
    acc[cls.subject_name].push(cls);
    return acc;
  }, {} as Record<string, RegisteredClass[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Schedule</h1>
              <p className="text-gray-600">
                View and manage your registered classes. You can cancel or reschedule before the deadline.
              </p>
            </div>
            <button
              onClick={() => navigate("/mentee/sessions")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              My Sessions
            </button>
          </div>

          {/* Success Toast */}
          {showSuccessToast && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-in slide-in-from-right">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Reschedule Modal */}
          {showRescheduleModal && selectedClassForReschedule && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="max-w-2xl w-full mx-4 p-6 bg-white max-h-[80vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Reschedule {selectedClassForReschedule.subject_name}
                </h3>
                <p className="text-gray-600 mb-6">
                  Select an alternative class to switch to:
                </p>

                <div className="space-y-4 mb-6">
                  {availableClasses.map((cls) => {
                    const isFull = cls.current_enrolled >= cls.max_students;
                    
                    return (
                      <Card key={cls.id} className={`p-4 border-2 ${isFull ? 'opacity-50' : 'hover:border-green-400'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{cls.class_code}</h4>
                            <p className="text-sm text-gray-600">{cls.description}</p>
                            <p className="text-sm text-gray-700 mt-1">Tutor: {cls.tutor_name}</p>
                          </div>
                          {isFull && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                              Full
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Schedule:</p>
                          {cls.time_slots.map((slot) => (
                            <p key={slot.id} className="text-sm text-gray-600">
                              {getDayName(slot.dayOfWeek)} • Periods {slot.startPeriod}–{slot.endPeriod}
                            </p>
                          ))}
                        </div>

                        <Button
                          onClick={() => confirmReschedule(cls)}
                          disabled={isFull}
                          className={`w-full ${
                            isFull
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {isFull ? 'Class Full' : 'Register'}
                        </Button>
                      </Card>
                    );
                  })}
                </div>

                <Button 
                  onClick={() => setShowRescheduleModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </Card>
            </div>
          )}

          {/* Classes by Subject */}
          {Object.keys(groupedBySubject).length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">You are not registered for any classes yet.</p>
              <Button 
                onClick={() => window.location.href = '/mentee/registration'}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Browse Available Classes
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedBySubject).map(([subjectName, subjectClasses]) => (
                <Card key={subjectName} className="overflow-hidden">
                  <div className="p-4 bg-blue-50">
                    <h2 className="text-2xl font-bold text-gray-900">{subjectName}</h2>
                    <p className="text-sm text-gray-600">{subjectClasses.length} class(es) enrolled</p>
                  </div>

                  <div className="divide-y">
                    {subjectClasses.map((cls) => {
                      const canModify = isBeforeDeadline(cls.deadlineRegister);
                      const isExpanded = expandedClasses.has(cls.id);

                      return (
                        <div key={cls.id} className="bg-white">
                          <div
                            className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleClass(cls.id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-bold text-gray-900">Class {cls.class_code}</h3>
                                {!canModify && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                    Confirmed
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">Tutor: {cls.tutor_name}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>Deadline: {new Date(cls.deadlineRegister).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Status: {cls.status}</span>
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-6 h-6 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-gray-400" />
                            )}
                          </div>

                          {isExpanded && (
                            <div className="p-4 bg-blue-50/30 border-t">
                              {/* Description */}
                              {cls.description && (
                                <p className="text-sm text-gray-600 mb-3">
                                  {cls.description}
                                </p>
                              )}

                              {/* Weekly Schedule */}
                              <div className="bg-white border border-blue-200 rounded p-3 space-y-2 mb-4">
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

                              {/* Enrollment Info */}
                              <div className="flex items-center gap-1 mb-4 text-sm">
                                <Users className="h-4 w-4 text-gray-600" />
                                <span className="text-gray-700">
                                  {cls.current_enrolled} / {cls.max_students} enrolled
                                </span>
                              </div>

                              {/* Meeting Link */}
                              {cls.meeting_link && (
                                <div className="mb-4">
                                  <Button 
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 w-full"
                                    asChild
                                  >
                                    <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                                      Join Class Meeting <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                  </Button>
                                </div>
                              )}

                              {canModify && (
                                <div className="flex space-x-3">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancel(cls);
                                    }}
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReschedule(cls);
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  >
                                    Reschedule
                                  </Button>
                                </div>
                              )}
                              {!canModify && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                                  <p>Registration deadline has passed. This class is confirmed and cannot be modified.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
