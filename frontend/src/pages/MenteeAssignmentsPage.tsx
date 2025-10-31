import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const MenteeAssignmentsPage: React.FC = () => {
  const navigate = useNavigate();

  // Example assignment data
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      type: "homework",
      title: "Homework 1",
      description: "Complete the exercises in the given worksheet.",
      submissions: [],
    },
    {
      id: 2,
      type: "quiz",
      title: "Quiz 1: Networking Basics",
      description: "Short quiz about IP addressing and protocols.",
      submissions: [
        { id: 1, timestamp: "2025-10-30 13:00", score: 80 },
        { id: 2, timestamp: "2025-10-30 13:20", score: "Pending" },
      ],
    },
  ]);

  const handleAttemptQuiz = (assignmentId: number) => {
    navigate(`/mentee/sessions/quiz/${assignmentId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-900">Assignments</h1>
          </div>
          <button
            onClick={() => navigate("/mentee/sessions")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            My Sessions
          </button>
        </div>

        <div className="space-y-8">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white shadow-md rounded-xl p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{a.title}</h2>
                  <p className="text-gray-600 mt-2">{a.description}</p>
                </div>

                {a.type === "quiz" && (
                  <button
                    onClick={() => handleAttemptQuiz(a.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Attempt Quiz
                  </button>
                )}
              </div>

              {/* Display submissions if available */}
              {a.submissions && a.submissions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Submissions
                  </h3>
                  <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-blue-100 text-gray-800">
                        <th className="p-2 border">Submission</th>
                        <th className="p-2 border">Timestamp</th>
                        <th className="p-2 border">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.submissions.map((s, idx) => (
                        <tr key={s.id} className="border-t hover:bg-gray-50">
                          <td className="p-2 text-center">{idx + 1}</td>
                          <td className="p-2 text-center">{s.timestamp}</td>
                          <td className="p-2 text-center">
                            {s.score === "Pending" ? (
                              <span className="italic text-gray-500">Pending</span>
                            ) : (
                              `${s.score}%`
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};
