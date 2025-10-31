"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Mock data for mentees
const MOCK_MENTEES = [
  { id: "m001", name: "Alice Nguyen", class_code: "CC01", course_name: "Advanced Mathematics (MATH301)" },
  { id: "m002", name: "Bao Tran", class_code: "CC02", course_name: "Data Structures (CS202)" },
  { id: "m003", name: "Charlie Pham", class_code: "CC01", course_name: "Advanced Mathematics (MATH301)" },
  { id: "m004", name: "David Le", class_code: "CC03", course_name: "Data Structures (CS202)" },
];

export function ProgressTrackingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter mentees based on search term
  const filteredMentees = useMemo(() => {
    return MOCK_MENTEES.filter((m) =>
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.class_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.course_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-900">Progress Tracking</h1>
            <p className="text-gray-600">View and manage mentees’ progress by class or course</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-blue-200">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-blue-900">Mentee Progress List</CardTitle>

            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by ID, Name, Class or Course"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          {/* Table Content */}
          <CardContent>
            {filteredMentees.length === 0 ? (
              <p className="text-center text-gray-600 py-6">No mentees found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="bg-blue-100 text-blue-900 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Mentee ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Course Name</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMentees.map((mentee) => (
                      <tr
                        key={mentee.id}
                        className="border-b hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-4 py-2">{mentee.id}</td>
                        <td className="px-4 py-2">{mentee.name}</td>
                        <td className="px-4 py-2">{mentee.class_code}</td>
                        <td className="px-4 py-2">{mentee.course_name}</td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => navigate(`/mentee_progress/${mentee.id}`)}
                          >
                            Track
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
