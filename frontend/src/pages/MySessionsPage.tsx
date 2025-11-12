"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import type { Class, Subject } from "@/types";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

// 🧩 Mock Data for Demonstration (replace with your Supabase fetch later)
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
];

const DAYS_OF_WEEK = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const periodToTime = (period: number): string => {
  const hour = period + 5;
  return `${hour.toString().padStart(2, "0")}:00`;
};

export function MySessionsPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(null);
    
    // Group attended classes by subject
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
setSubjects(Array.from(subjectMap.values()));
}, [classes]);

  const toggleSubject = (subjectId: number) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-900">My Sessions</h1>
            <p className="text-gray-600">View all sessions you’ve attended</p>
          </div>
          <Button
            onClick={() => navigate("assignments")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Assignments
          </Button>
        </div>
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
        {subjects.length === 0 ? (
          <Card className="border-blue-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">You have not attended any sessions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {subjects.map((subject) => {
              const isExpanded = expandedSubjectId === subject.id;
              const classCount = subject.classes.length;

              return (
                <Card
                  key={subject.id}
                  className="border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white"
                >
                  {/* Subject Header */}
                  <CardHeader
                    className="cursor-pointer hover:bg-blue-50 transition-colors rounded-t-lg"
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-center justify-between">
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
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {classCount} {classCount === 1 ? "class" : "classes"}
                      </span>
                    </div>
                  </CardHeader>

                  {/* Expanded Classes */}
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 space-y-3">
                      {subject.classes.map((classItem) => (
                        <div
                          key={classItem.id}
                          className="bg-blue-50/50 border-l-4 border-blue-400 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                        >
                          <div className="space-y-3">
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
                                <div className="text-sm text-gray-800">
                                  👨‍🏫 {classItem.tutor_name}
                                </div>
                              </div>
                            </div>

                            {classItem.description && (
                              <p className="text-sm text-gray-600">
                                {classItem.description}
                              </p>
                            )}

                            {/* Schedule */}
                            <div className="bg-white border border-blue-200 rounded p-3 space-y-2">
                              <p className="text-xs font-semibold text-gray-700 uppercase">
                                Weekly Schedule:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {classItem.time_slots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className="flex items-center gap-1 text-xs bg-purple-50 px-2 py-1 rounded border border-purple-200"
                                  >
                                    <Clock className="h-3 w-3 text-purple-600" />
                                    <span className="font-medium">
                                      {DAYS_OF_WEEK[slot.dayOfWeek]}{" "}
                                      {periodToTime(slot.startPeriod)}-{periodToTime(slot.endPeriod)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Feedback Button */}
                            <div className="flex justify-end pt-2 border-t border-blue-200">
                            {(() => {
                                // 🧩 Replace this condition with your real logic later (e.g., course completion check)
                                const isDone = true;

                                return (
                                <Button
                                    size="sm"
                                    disabled={!isDone}
                                    className={`px-4 py-2 font-medium ${
                                    isDone
                                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                    onClick={() => {
                                    if (isDone) navigate(`/mentee/sessions/feedback/${classItem.id}`);
                                    }}
                                >
                                    Feedback
                                </Button>
                                );
                            })()}
                            </div>
                          </div>
                        </div>
                      ))}
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
