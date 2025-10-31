"use client";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";

const mockSubmissions = [
  { id: 1, assignment: "Assignment 1", session: "Week 1", date: "2025-01-05", score: 70 },
  { id: 2, assignment: "Assignment 2", session: "Week 3", date: "2025-02-02", score: 85 },
  { id: 3, assignment: "Assignment 3", session: "Week 5", date: "2025-03-10", score: 60 },
  { id: 4, assignment: "Assignment 4", session: "Week 7", date: "2025-04-01", score: 95 },
  { id: 5, assignment: "Assignment 5", session: "Week 8", date: "2025-05-15", score: 80 },
];

const mockNotes = [
  { id: 1, date: "2025-05-10", content: "Needs more focus on math exercises." },
  { id: 2, date: "2025-06-01", content: "Improved participation in group sessions." },
];

const COLORS = ["#2563eb", "#d1d5db"];

export function MenteeProgressPage() {
  const { id } = useParams()
  const avgScore = Math.round(mockSubmissions.reduce((sum, s) => sum + s.score, 0) / mockSubmissions.length);

  const donutData = [
    { name: "Finished", value: avgScore },
    { name: "Remaining", value: 100 - avgScore },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Mentee {id} Progress Dashboard</h1>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockSubmissions}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Donut */}
          <Card className="flex items-center justify-center shadow-sm">
            <PieChart width={250} height={250}>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xl font-bold fill-blue-800"
              >
                {avgScore}%
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-gray-500"
              >
                Finished
              </text>
            </PieChart>
          </Card>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submissions Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="p-3">Assignment</th>
                    <th className="p-3">Session</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSubmissions.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-100">
                      <td className="p-3">{s.assignment}</td>
                      <td className="p-3">{s.session}</td>
                      <td className="p-3">{s.date}</td>
                      <td className="p-3">{s.score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Private Notes Table */}
          <Card className="shadow-sm flex flex-col">
            <CardHeader>
              <CardTitle className="text-blue-800">Private Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="p-3">Date</th>
                    <th className="p-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {mockNotes.map((note) => (
                    <tr key={note.id} className="border-b hover:bg-gray-100">
                      <td className="p-3 w-1/4">{note.date}</td>
                      <td className="p-3">{note.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
            <div className="p-4 border-t flex justify-end">
              <Link to= {`/mentee_progress/${id}/private_note`}>
                <Button className="bg-blue-800 hover:bg-blue-700 text-white">Add Private Note</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
