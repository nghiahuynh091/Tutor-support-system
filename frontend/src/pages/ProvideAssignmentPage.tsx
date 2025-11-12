"use client";
import { Link } from "react-router-dom";
import React, { useState } from "react"; // 👈 Import useState
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 💡 Placeholder for session data
const mockSessions = [
  { id: "101", title: "Introduction to React" },
  { id: "102", title: "TypeScript Fundamentals" },
  { id: "103", title: "State Management with Hooks" },
];

export function ProvideAssignmentPage() {
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const handleAssignmentClick = (type: string) => {
    if (!selectedSessionId) {
      alert("Please select a session before choosing an assignment type.");
      return;
    }
    // Logic will be handled by the <Link> component's 'to' prop
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
            
            {/* 🆕 Session Dropdown */}
            <div className="w-full space-y-2">
              <label htmlFor="session-select" className="block text-lg font-semibold text-gray-700">
                Session *
              </label>
              <select
                id="session-select"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
                required
              >
                <option value="" disabled>Select a Session Title</option>
                {mockSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    Session {session.id}: {session.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Assignment Buttons */}
            <div className="flex justify-around py-4 w-full">
              <Link 
                to={selectedSessionId ? `/assignment/homework/${selectedSessionId}` : "#"}
                onClick={(e) => {
                  if (!selectedSessionId) {
                    e.preventDefault();
                    handleAssignmentClick('homework');
                  }
                }}
              >
                <Button className="bg-blue-800 hover:bg-blue-700 text-white text-lg px-8 py-3" disabled={!selectedSessionId}>
                  Homework
                </Button>
              </Link>
              <Link
                to={selectedSessionId ? `/assignment/quiz/${selectedSessionId}` : "#"}
                onClick={(e) => {
                  if (!selectedSessionId) {
                    e.preventDefault();
                    handleAssignmentClick('quiz');
                  }
                }}
              >
                <Button className="bg-green-700 hover:bg-green-600 text-white text-lg px-8 py-3" disabled={!selectedSessionId}>
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