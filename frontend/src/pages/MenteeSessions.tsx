import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clock, Search, Users, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import type { Class, Subject } from "@/types";
import { useNavigate } from "react-router-dom";

// Hard-coded mock data
const MOCK_CLASSES: Class[] = [
  {
    id: "class-1",
    subject_id: 1,
    subject_name: "Advanced Mathematics",
    subject_code: "MATH301",
    class_code: "CC01",
    description: "Calculus and Linear Algebra review sessions",
    tutor_id: "tutor-1",
    tutor_name: "Dr. Sarah Johnson",
    max_students: 10,
    current_enrolled: 5,
    number_of_weeks: 4,
    meeting_link: "https://meet.google.com/abc-defg-hij",
    time_slots: [
      { id: "ts1", dayOfWeek: 1, startPeriod: 2, endPeriod: 4 },
      { id: "ts2", dayOfWeek: 3, startPeriod: 8, endPeriod: 10 },
    ],
    sessions: [],
    created_at: "2025-10-25T10:00:00",
  },
  {
    id: "class-2",
    subject_id: 1,
    subject_name: "Advanced Mathematics",
    subject_code: "MATH301",
    class_code: "CC02",
    description: "Advanced problem-solving sessions",
    tutor_id: "tutor-1",
    tutor_name: "Dr. Sarah Johnson",
    max_students: 10,
    current_enrolled: 7,
    number_of_weeks: 4,
    meeting_link: "https://meet.google.com/xyz-abcd-efg",
    time_slots: [
      { id: "ts5", dayOfWeek: 2, startPeriod: 5, endPeriod: 7 },
    ],
    sessions: [],
    created_at: "2025-10-26T10:00:00",
  },
  {
    id: "class-3",
    subject_id: 2,
    subject_name: "Data Structures",
    subject_code: "CS202",
    class_code: "CC01",
    description: "Trees, Graphs, and Algorithm Analysis",
    tutor_id: "tutor-2",
    tutor_name: "Prof. Michael Chen",
    max_students: 12,
    current_enrolled: 8,
    number_of_weeks: 4,
    meeting_link: "https://zoom.us/j/123456789",
    time_slots: [
      { id: "ts3", dayOfWeek: 2, startPeriod: 2, endPeriod: 4 },
      { id: "ts4", dayOfWeek: 5, startPeriod: 2, endPeriod: 4 },
    ],
    sessions: [],
    created_at: "2025-10-27T10:00:00",
  },
  {
    id: "class-4",
    subject_id: 3,
    subject_name: "Physics I",
    subject_code: "PHYS101",
    class_code: "CC01",
    description: "Mechanics and Thermodynamics fundamentals",
    tutor_id: "tutor-3",
    tutor_name: "Dr. Emily Brown",
    max_students: 10,
    current_enrolled: 10,
    number_of_weeks: 4,
    meeting_link: "https://meet.google.com/physics-class",
    time_slots: [
      { id: "ts6", dayOfWeek: 3, startPeriod: 5, endPeriod: 7 },
    ],
    sessions: [],
    created_at: "2025-10-28T10:00:00",
  },
];

const DAYS_OF_WEEK = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const periodToTime = (period: number): string => {
  const hour = period + 5;
  return `${hour.toString().padStart(2, '0')}:00`;
};

export function MenteeSessions() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(null);
  const [registeredClassIds, setRegisteredClassIds] = useState<Set<string>>(new Set());

  // Group classes by subject
  useEffect(() => {
    const subjectMap = new Map<number, Subject>();
    
    classes.forEach((classItem) => {
      if (!subjectMap.has(classItem.subject_id)) {
        subjectMap.set(classItem.subject_id, {
          id: classItem.subject_id,
          subject_name: classItem.subject_name,
          subject_code: classItem.subject_code,
          classes: [],
        });
      }
      subjectMap.get(classItem.subject_id)!.classes.push(classItem);
    });

    const subjectsList = Array.from(subjectMap.values());
    setSubjects(subjectsList);
    setFilteredSubjects(subjectsList);
  }, [classes]);

  // Filter subjects based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubjects(subjects);
      setExpandedSubjectId(null); // Collapse when clearing search
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
    setExpandedSubjectId(null); // Collapse when searching
  }, [searchQuery, subjects]);

  const handleRegister = (classId: string, classItem: Class) => {
    setRegisteredClassIds(new Set(registeredClassIds).add(classId));
    setClasses((prevClasses) =>
      prevClasses.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            current_enrolled: c.current_enrolled + 1,
          };
        }
        return c;
      })
    );
    alert(`Successfully registered for ${classItem.class_code}! You are now enrolled in all ${classItem.sessions.length} sessions.`);
  };

  const handleCancelRegistration = (classId: string, classItem: Class) => {
    const newRegisteredIds = new Set(registeredClassIds);
    newRegisteredIds.delete(classId);
    setRegisteredClassIds(newRegisteredIds);
    
    setClasses((prevClasses) =>
      prevClasses.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            current_enrolled: Math.max(0, c.current_enrolled - 1),
          };
        }
        return c;
      })
    );
    alert(`Registration cancelled for ${classItem.class_code}!`);
  };

  const toggleSubject = (subjectId: number) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-900">Available Classes</h1>
            <p className="text-gray-600">
              Browse subjects and register for tutoring classes
            </p>
          </div>
          <button
            onClick={() => navigate("/my_sessions")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            My Sessions
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

        {/* Subjects List */}
        {filteredSubjects.length === 0 ? (
          <Card className="border-blue-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                {searchQuery ? "No subjects found matching your search." : "No available subjects at the moment."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredSubjects.map((subject) => {
              const isExpanded = expandedSubjectId === subject.id;
              const classCount = subject.classes.length;
              
              return (
                <Card 
                  key={subject.id} 
                  className="border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white"
                >
                  {/* Subject Header - Clickable */}
                  <CardHeader 
                    className="cursor-pointer hover:bg-blue-50 transition-colors rounded-t-lg"
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-blue-600" />
                          )}
                          <div>
                            <CardTitle className="text-xl text-blue-900">
                              {subject.subject_name}
                            </CardTitle>
                            <p className="text-sm text-blue-600 font-semibold mt-1">
                              {subject.subject_code}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {classCount} {classCount === 1 ? 'class' : 'classes'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Classes List */}
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 space-y-3">
                      {subject.classes.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No available classes at the moment.
                        </p>
                      ) : (
                        subject.classes.map((classItem) => {
                          const isFull = classItem.current_enrolled >= classItem.max_students;
                          const isRegistered = registeredClassIds.has(classItem.id);
                          const canRegister = !isRegistered && !isFull;

                          return (
                            <div
                              key={classItem.id}
                              className="bg-blue-50/50 border-l-4 border-blue-400 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                            >
                              {/* Class Info */}
                              <div className="space-y-3">
                                {/* Class Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-lg font-bold text-blue-900">
                                        Class {classItem.class_code}
                                      </span>
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                        {classItem.number_of_weeks} weeks
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-semibold text-gray-900">
                                        👨‍🏫 {classItem.tutor_name}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                {classItem.description && (
                                  <p className="text-sm text-gray-600">
                                    {classItem.description}
                                  </p>
                                )}

                                {/* Weekly Schedule */}
                                <div className="bg-white border border-blue-200 rounded p-3 space-y-2">
                                  <p className="text-xs font-semibold text-gray-700 uppercase">Weekly Schedule:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {classItem.time_slots.map((slot) => (
                                      <div 
                                        key={slot.id}
                                        className="flex items-center gap-1 text-xs bg-purple-50 px-2 py-1 rounded border border-purple-200"
                                      >
                                        <Clock className="h-3 w-3 text-purple-600" />
                                        <span className="font-medium">
                                          {DAYS_OF_WEEK[slot.dayOfWeek]} {periodToTime(slot.startPeriod)}-{periodToTime(slot.endPeriod)}
                                        </span>
                                        <span className="text-gray-600">(P{slot.startPeriod}-{slot.endPeriod})</span>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {classItem.time_slots.length} session{classItem.time_slots.length !== 1 ? 's' : ''} per week
                                  </p>
                                </div>

                                {/* Enrollment & Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-gray-600" />
                                    <span className={`text-sm font-medium ${isFull ? "text-red-600" : "text-gray-700"}`}>
                                      {classItem.current_enrolled} / {classItem.max_students} enrolled
                                      {isFull && " (Full)"}
                                    </span>
                                  </div>

                                  <div className="flex gap-2">
                                    {isRegistered ? (
                                      <>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleCancelRegistration(classItem.id, classItem)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                        >
                                          Cancel
                                        </Button>
                                        {classItem.meeting_link && (
                                          <Button 
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                            asChild
                                          >
                                            <a href={classItem.meeting_link} target="_blank" rel="noopener noreferrer">
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
                                        onClick={() => handleRegister(classItem.id, classItem)}
                                      >
                                        {isFull ? "Full" : "Register"}
                                      </Button>
                                    )}
                                  </div>
                                </div>
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
