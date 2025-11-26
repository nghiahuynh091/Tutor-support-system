import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext"; // Import Auth Context

// Define interfaces based on expected backend data
interface Question {
  id: number;
  title: string;
  options: string[];
}

interface AssignmentData {
  id: number;
  title: string;
  description: string;
  duration_minutes: number; // Assuming backend returns duration
  questions: Question[]; // Assuming backend returns questions list
}

export const MenteeQuizAttemptPage: React.FC = () => {
  const navigate = useNavigate();
  // Ensure your route is configured as: /mentee/quiz/:classId/:sessionId
  const { classId, sessionId } = useParams<{ classId: string; sessionId: string }>(); 
  const { token, isLoading: authLoading } = useAuth();

  const [quizData, setQuizData] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [warning, setWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Assignment Data
  useEffect(() => {
    if (authLoading || !token) return;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8002/assignments/${classId}/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        const data = response.data;
        setQuizData(data);
        // Initialize timer based on backend data (assuming duration_minutes exists)
        setTimeLeft((data.duration_minutes || 10) * 60); 
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [classId, sessionId, token, authLoading]);

  // 2. Timer Logic
  useEffect(() => {
    if (!quizData || timeLeft <= 0) {
      if (timeLeft === 0 && quizData && !isSubmitting) {
        finalizeSubmit(true); // Auto-submit when time hits 0
      }
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quizData]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (questionId: number, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  // Check if all questions have an answer
  const allAnswered = quizData?.questions?.every((q) => answers[q.id]);

  const handleSubmit = () => {
    if (!allAnswered) setWarning(true);
    else finalizeSubmit();
  };

  // 3. Submit Logic
  const finalizeSubmit = async (auto = false) => {
    if (isSubmitting || !quizData) return;
    setIsSubmitting(true);

    try {
      // Map answers to "choices" list in order of questions
      // If a question is unanswered, we send an empty string or null 
      // depending on backend requirements. Here we send "" if missing.
      const choicesPayload = quizData.questions.map(
        (q) => answers[q.id] || "" 
      );

      const payload = {
        class_id: Number(classId),
        session_id: Number(sessionId),
        choices: choicesPayload,
      };

      await axios.post("http://localhost:8002/submission/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert(auto ? "⏰ Time’s up! Auto-submitting quiz." : "✅ Quiz submitted successfully!");
      navigate("/mentee/assignments");
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("❌ Failed to submit quiz. Please try again.");
      setIsSubmitting(false); // Allow retry
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-blue-600 font-semibold">Loading Quiz...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-red-600 font-semibold mb-4">{error || "Quiz not found"}</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Sticky timer fixed to screen */}
      <div className="fixed top-24 right-10 z-50">
        <div className={`px-6 py-4 rounded-2xl shadow-lg text-lg font-semibold text-center transition-colors ${timeLeft < 60 ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
          ⏳ Time Left
          <div className="text-3xl font-bold mt-2">{formatTime(timeLeft)}</div>
          <div className="text-sm opacity-80 mt-1">of {quizData.duration_minutes} min</div>
        </div>
      </div>

      <main className="flex-grow flex justify-center items-start py-10">
        {/* Centered quiz container */}
        <div className="flex flex-col w-full max-w-5xl min-h-[80vh] bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
          <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">
            {quizData.title}
          </h1>
          <p className="text-gray-600 mb-8 text-center">{quizData.description}</p>

          <div className="flex flex-col gap-6">
            {quizData.questions.map((q, index) => (
              <div key={q.id}>
                <h3 className="font-semibold text-lg mb-3">
                  Question {index + 1}: {q.title}
                </h3>
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className="block cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleChange(q.id, opt)}
                        className="mr-3 h-4 w-4 text-blue-600"
                        disabled={isSubmitting}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {warning && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mt-8 text-center border border-yellow-200">
              ⚠️ You haven’t answered all questions. Continue submitting?
              <div className="mt-3 flex gap-3 justify-center">
                <button
                  onClick={() => finalizeSubmit(false)}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {isSubmitting ? "Submitting..." : "Yes, Submit"}
                </button>
                <button
                  onClick={() => setWarning(false)}
                  disabled={isSubmitting}
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Centered Submit Button */}
          {!warning && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-1/2 text-white text-lg font-semibold px-10 py-3 rounded-xl transition-all ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Finish Quiz"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};