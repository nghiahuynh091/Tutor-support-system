"use client";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 🆕 Mock Data: IDs are now numbers only
const mockClasses = [
  { id: 1, name: "Software Engineering" },
  { id: 2, name: "Artificial Intelligence" },
  { id: 3, name: "Computer Vision" },
];

const mockSessions = [
  { id: 1, title: "Introduction" },
  { id: 102, title: "Advanced Concepts" },
  { id: 103, title: "Final Review" },
];

export function ProvideAssignmentPage() {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(e.target.value);
    setSelectedSessionId(""); // Reset session when class changes
  };

  // Helper to validate before navigation (optional, mostly for the button onClick)
  const handleAssignmentClick = (e: React.MouseEvent) => {
    if (!selectedClassId || !selectedSessionId) {
      e.preventDefault();
      alert("Please select both a Class and a Session.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-10 flex flex-col items-center">
        <Card className="max-w-lg w-full shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-800 text-center text-3xl font-bold">
              Choose type of assignment:
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {/* Class Dropdown */}
            <div className="w-full space-y-2">
              <label
                htmlFor="class-select"
                className="block text-lg font-semibold text-gray-700"
              >
                Class *
              </label>
              <select
                id="class-select"
                value={selectedClassId}
                onChange={handleClassChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
                required
              >
                <option value="" disabled>
                  Select a Class
                </option>
                {mockClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Class {cls.id}: {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Dropdown */}
            <div className="w-full space-y-2">
              <label
                htmlFor="session-select"
                className="block text-lg font-semibold text-gray-700"
              >
                Session *
              </label>
              <select
                id="session-select"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={!selectedClassId}
                className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base ${
                  !selectedClassId
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white"
                }`}
                required
              >
                <option value="" disabled>
                  {!selectedClassId
                    ? "Select a Class first..."
                    : "Select a Session"}
                </option>
                {mockSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    Session {session.id}: {session.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Buttons */}
            <div className="flex justify-around py-4 w-full">
              {/* Homework Link */}
              <Link
                // 🆕 Updated URL structure: /homework/classId/sessionId
                to={
                  selectedClassId && selectedSessionId
                    ? `/assignment/homework/${selectedClassId}/${selectedSessionId}`
                    : "#"
                }
                onClick={(e) => handleAssignmentClick(e)}
              >
                <Button
                  className="bg-blue-800 hover:bg-blue-700 text-white text-lg px-8 py-3"
                  disabled={!selectedClassId || !selectedSessionId}
                >
                  Homework
                </Button>
              </Link>

              {/* Quiz Link */}
              <Link
                // 🆕 Updated URL structure: /quiz/classId/sessionId
                to={
                  selectedClassId && selectedSessionId
                    ? `/assignment/quiz/${selectedClassId}/${selectedSessionId}`
                    : "#"
                }
                onClick={(e) => handleAssignmentClick(e)}
              >
                <Button
                  className="bg-green-700 hover:bg-green-600 text-white text-lg px-8 py-3"
                  disabled={!selectedClassId || !selectedSessionId}
                >
                  Quiz
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
