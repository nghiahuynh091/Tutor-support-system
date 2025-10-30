import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, Trash2, Users, ChevronDown, ChevronRight, Edit } from "lucide-react";
import { Header } from "@/components/Header";
import { CreateClassModal } from "@/components/CreateClassModal";
import type { Class, Subject } from "@/types";

// Hard-coded mock data for tutor's classes
const MOCK_TUTOR_CLASSES: Class[] = [
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
    subject_id: 2,
    subject_name: "Data Structures",
    subject_code: "CS202",
    class_code: "CC01",
    description: "Trees, Graphs, and Algorithm Analysis",
    tutor_id: "tutor-1",
    tutor_name: "Dr. Sarah Johnson",
    max_students: 12,
    current_enrolled: 8,
    number_of_weeks: 4,
    meeting_link: "https://zoom.us/j/123456789",
    time_slots: [
      { id: "ts3", dayOfWeek: 2, startPeriod: 2, endPeriod: 4 },
      { id: "ts4", dayOfWeek: 5, startPeriod: 2, endPeriod: 4 },
    ],
    sessions: [],
    created_at: "2025-10-26T10:00:00",
  },
];

const DAYS_OF_WEEK = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const periodToTime = (period: number): string => {
  const hour = period + 5;
  return `${hour.toString().padStart(2, '0')}:00`;
};

export function TutorSessions() {
  const [classes, setClasses] = useState<Class[]>(MOCK_TUTOR_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

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
  }, [classes]);

  const handleCreateClass = (newClass: Class) => {
    setClasses([...classes, newClass]);
    alert(`Successfully created class ${newClass.class_code} with ${newClass.sessions.length} sessions!`);
  };

  const handleDeleteClass = (classId: string) => {
    if (window.confirm("Are you sure you want to delete this class? All sessions will be removed.")) {
      setClasses((prevClasses) => prevClasses.filter((c) => c.id !== classId));
      alert("Class deleted successfully!");
    }
  };

  const toggleSubject = (subjectId: number) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
    if (expandedSubjectId !== subjectId) {
      setExpandedClassId(null); // Collapse classes when switching subjects
    }
  };

  const toggleClass = (classId: string) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
  };

  const formatTimeSlot = (dayOfWeek: number, startPeriod: number, endPeriod: number): string => {
    const day = DAYS_OF_WEEK[dayOfWeek];
    return `${day} ${periodToTime(startPeriod)}-${periodToTime(endPeriod)} (Period ${startPeriod}-${endPeriod})`;
  };

  const getWeeklyScheduleSummary = (classItem: Class): string => {
    return classItem.time_slots
      .map(ts => `${DAYS_OF_WEEK[ts.dayOfWeek].substring(0, 3)} ${ts.startPeriod}-${ts.endPeriod}`)
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-900">My Classes</h1>
            <p className="text-gray-600">Create and manage your tutoring classes</p>
          </div>
          
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Class
          </Button>
        </div>

        {subjects.length === 0 ? (
          <Card className="border-blue-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">You haven't created any classes yet.</p>
              <Button 
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
                  className="border-blue-200 hover:border-blue-400 transition-all duration-200 bg-white"
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
                          <CardTitle className="text-2xl text-blue-900">
                            {subject.subject_name}
                          </CardTitle>
                          <p className="text-sm text-blue-600 font-semibold mt-1">
                            {subject.subject_code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {subject.classes.length} {subject.classes.length === 1 ? 'class' : 'classes'}
                        </span>
                      </div>
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
                          const isClassExpanded = expandedClassId === classItem.id;
                          const isFull = classItem.current_enrolled >= classItem.max_students;
                          
                          return (
                            <div key={classItem.id} className="border-2 border-blue-200 rounded-lg overflow-hidden">
                              {/* Class Header - Clickable */}
                              <div 
                                className="bg-blue-50 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => toggleClass(classItem.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    {isClassExpanded ? (
                                      <ChevronDown className="h-5 w-5 text-blue-600 mt-1" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-blue-600 mt-1" />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-blue-900">
                                          Class {classItem.class_code}
                                        </h3>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                          {classItem.number_of_weeks} weeks
                                        </span>
                                      </div>
                                      
                                      {classItem.description && (
                                        <p className="text-sm text-gray-700 mb-2">{classItem.description}</p>
                                      )}
                                      
                                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4 text-blue-600" />
                                          <span>{classItem.time_slots.length} sessions/week</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-4 w-4 text-blue-600" />
                                          <span className={isFull ? "text-red-600 font-semibold" : ""}>
                                            {classItem.current_enrolled} / {classItem.max_students} enrolled
                                            {isFull && " (Full)"}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-2 text-sm text-blue-700 font-medium">
                                        📅 {getWeeklyScheduleSummary(classItem)}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteClass(classItem.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Class Details */}
                              {isClassExpanded && (
                                <div className="p-4 bg-white space-y-4">
                                  {/* Weekly Schedule */}
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Weekly Schedule:</h4>
                                    <div className="space-y-2">
                                      {classItem.time_slots.map((slot) => (
                                        <div 
                                          key={slot.id} 
                                          className="flex items-center gap-2 text-sm bg-purple-50 px-3 py-2 rounded border-l-4 border-purple-400"
                                        >
                                          <Clock className="h-4 w-4 text-purple-600" />
                                          <span className="font-medium text-gray-900">
                                            {formatTimeSlot(slot.dayOfWeek, slot.startPeriod, slot.endPeriod)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Meeting Link */}
                                  {classItem.meeting_link && (
                                    <div className="pt-3 border-t">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        asChild
                                      >
                                        <a href={classItem.meeting_link} target="_blank" rel="noopener noreferrer">
                                          Join Meeting Link
                                        </a>
                                      </Button>
                                    </div>
                                  )}

                                  {/* Sessions Preview */}
                                  <div className="pt-3 border-t">
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      Total Sessions: {classItem.sessions.length}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {classItem.time_slots.length} sessions × {classItem.number_of_weeks} weeks = {classItem.sessions.length} total sessions
                                    </p>
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

      {isCreateModalOpen && (
        <CreateClassModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreateClass={handleCreateClass}
          existingClassCount={classes.length}
          tutorName="Dr. Sarah Johnson"
        />
      )}
    </div>
  );
}
