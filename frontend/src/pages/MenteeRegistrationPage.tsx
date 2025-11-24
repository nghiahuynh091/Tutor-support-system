import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Users, AlertCircle, CheckCircle, Clock, Search, ExternalLink, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registrationService, type Subject, type Class, type ConflictDetail } from "@/services/registrationService";
import { useAuth } from "@/contexts/AuthContext";

const getDayName = (day: number | string): string => {
  if (typeof day === 'string') {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  }
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
  conflicts?: ConflictDetail[];
}

export function MenteeRegistrationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [registeredClasses, setRegisteredClasses] = useState<Set<number>>(new Set());
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);

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
        registrationService.getMyRegistrations(menteeId)
      ]);

      console.log('📚 All classes loaded:', allClasses.length);
      console.log('✅ My registrations:', myRegistrations);
      console.log('📋 Registration IDs:', myRegistrations.map(r => r.id));

      // Group classes by subject
      const subjectsMap = new Map<number, Subject>();

      allClasses.forEach((cls: Class) => {
        if (!subjectsMap.has(cls.subject_id)) {
          subjectsMap.set(cls.subject_id, {
            id: cls.subject_id,
            subject_name: cls.subject_name,
            subject_code: cls.subject_code,
            classes: []
          });
        }
        subjectsMap.get(cls.subject_id)!.classes.push(cls);
      });

      const groupedSubjects = Array.from(subjectsMap.values());
      setSubjects(groupedSubjects);
      setFilteredSubjects(groupedSubjects);
      
      // Extract registered class IDs
      const registeredIds = new Set(myRegistrations.map(cls => cls.id));
      console.log('🎯 Registered class IDs Set:', Array.from(registeredIds));
      setRegisteredClasses(registeredIds);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load classes. Please try again.');
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
        subject.classes.some(classItem => 
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
      alert('Please login to register for classes.');
      navigate('/login');
      return;
    }

    // Check if registration deadline has passed
    if (classItem.registration_deadline && isDeadlinePassed(classItem.registration_deadline)) {
      alert(`Registration deadline has passed for this class.`);
      return;
    }

    // Check if already registered for this subject in same semester
    const alreadyRegistered = subjects.some(subject => 
      subject.id === classItem.subject_id && 
      subject.classes.some(c => 
        registeredClasses.has(c.id) && 
        c.semester === classItem.semester
      )
    );

    if (alreadyRegistered) {
      alert(`You are already registered for a ${classItem.subject_name} class in semester ${classItem.semester}.`);
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
            conflicts: result.conflicts
          });
          setShowConflictModal(true);
        } else {
          alert(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register. Please try again.');
    } finally {
      setRegistering(null);
    }
  };

  const handleCancelRegistration = async (classId: number) => {
    if (!menteeId) return;

    if (!window.confirm(`Are you sure you want to cancel registration for Class ${classId}?`)) {
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
        alert(result.error || 'Failed to cancel registration.');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel registration. Please try again.');
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
            <p className="text-gray-600 mb-4">Please login to view and register for classes.</p>
            <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700">
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
                placeholder="Search by subject name, code, or tutor..."
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
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Conflict Modal */}
          {showConflictModal && conflictInfo && conflictInfo.conflicts && conflictInfo.conflicts.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-2xl w-full mx-4 p-6 bg-white max-h-[80vh] overflow-y-auto">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-600 mb-2">Schedule Conflict Detected</h3>
                    <p className="text-gray-700 mb-4">
                      This class overlaps with {conflictInfo.conflicts.length} class{conflictInfo.conflicts.length > 1 ? 'es' : ''} in your schedule.
                    </p>
                    
                    <div className="space-y-3">
                      {conflictInfo.conflicts.map((conflict, idx) => (
                        <div key={idx} className="bg-red-50 border border-red-200 rounded p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold text-red-800 mb-2">Current Class:</p>
                              <div className="text-sm text-red-700 space-y-1">
                                <p><strong>Subject:</strong> {conflict.conflicting_subject_code} - {conflict.conflicting_subject}</p>
                                <p><strong>Day:</strong> {getDayName(conflict.conflicting_week_day)}</p>
                                <p><strong>Time:</strong> {periodToTime(conflict.conflicting_start_time)} - {periodToTime(conflict.conflicting_end_time)}</p>
                                <p><strong>Location:</strong> {conflict.conflicting_location || 'TBA'}</p>
                                <p><strong>Tutor:</strong> {conflict.conflicting_tutor_name}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-orange-800 mb-2">New Class:</p>
                              <div className="text-sm text-orange-700 space-y-1">
                                <p><strong>Subject:</strong> {conflict.new_subject_code} - {conflict.new_subject}</p>
                                <p><strong>Day:</strong> {getDayName(conflict.new_week_day)}</p>
                                <p><strong>Time:</strong> {periodToTime(conflict.new_start_time)} - {periodToTime(conflict.new_end_time)}</p>
                                <p><strong>Location:</strong> {conflict.new_location || 'TBA'}</p>
                                <p><strong>Tutor:</strong> {conflict.new_tutor_name}</p>
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

                    {isExpanded && (
                      <div className="pt-0 pb-4 px-4 space-y-3">
                        {subject.classes.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">
                            No available classes at the moment.
                          </p>
                        ) : (
                          subject.classes.map((cls) => {
                            const isRegistered = registeredClasses.has(cls.id);
                            console.log(`Class ${cls.id}: isRegistered=${isRegistered}, registeredClasses=`, Array.from(registeredClasses));
                            const isFull = cls.current_enrolled >= cls.capacity;
                            const deadlinePassed = cls.registration_deadline ? isDeadlinePassed(cls.registration_deadline) : false;
                            const canRegister = !isRegistered && !isFull && !deadlinePassed;
                            const isCurrentlyRegistering = registering === cls.id;

                            return (
                              <div
                                key={cls.id}
                                className="bg-blue-50/50 border-l-4 border-blue-400 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                              >
                                <div className="space-y-3">
                                  {/* Class Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-lg font-bold text-blue-900">
                                          Class #{cls.id}
                                        </span>
                                        {cls.num_of_weeks && (
                                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                            {cls.num_of_weeks} weeks
                                          </span>
                                        )}
                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                          Semester {cls.semester}
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

                                  {/* Schedule */}
                                  <div className="bg-white border border-blue-200 rounded p-3 space-y-2">
                                    <p className="text-xs font-semibold text-gray-700 uppercase">Schedule:</p>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Clock className="h-4 w-4 text-purple-600" />
                                      <span className="font-medium">
                                        {getDayName(cls.week_day)} {periodToTime(cls.start_time)}-{periodToTime(cls.end_time)}
                                      </span>
                                      <span className="text-gray-600">(Periods {cls.start_time}-{cls.end_time})</span>
                                    </div>
                                    {cls.location && (
                                      <p className="text-xs text-gray-600">
                                        📍 {cls.location}
                                      </p>
                                    )}
                                  </div>

                                  {/* Enrollment & Actions */}
                                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4 text-gray-600" />
                                      <span className={`text-sm font-medium ${isFull ? "text-red-600" : "text-gray-700"}`}>
                                        {cls.current_enrolled} / {cls.capacity} enrolled
                                        {isFull && " (Full)"}
                                      </span>
                                    </div>

                                    <div className="flex gap-2">
                                      {isRegistered ? (
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-lg">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Registered</span>
                                          </div>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleCancelRegistration(cls.id)}
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
                                        </div>
                                      ) : (
                                        <Button 
                                          size="sm"
                                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                          disabled={!canRegister || isCurrentlyRegistering}
                                          onClick={() => handleRegister(cls.id, cls)}
                                        >
                                          {isCurrentlyRegistering ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Registering...
                                            </>
                                          ) : isFull ? "Full" : deadlinePassed ? "Closed" : "Register"}
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