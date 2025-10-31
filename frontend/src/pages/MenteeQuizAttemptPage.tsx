import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const MenteeQuizAttemptPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const quiz = {
    id,
    title: "Quiz 1: Network Fundamentals",
    description: "Answer the following questions carefully.",
    timeLimit: 5, // minutes
    questions: [
      {
        id: 1,
        question: "What does IP stand for?",
        options: ["Internet Protocol", "Internal Process", "Instant Program"],
      },
      {
        id: 2,
        question: "Which layer does TCP operate in?",
        options: ["Application", "Transport", "Network"],
      },
    ],
  };

  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      finalizeSubmit(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (questionId: number, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  const handleSubmit = () => {
    if (!allAnswered) setWarning(true);
    else finalizeSubmit();
  };

  const finalizeSubmit = (auto = false) => {
    alert(auto ? "⏰ Time’s up! Auto-submitting quiz." : "✅ Quiz submitted!");
    navigate("/mentee/sessions/assignments");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Sticky timer fixed to screen */}
      <div className="fixed top-24 right-10 z-50">
        <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-lg text-lg font-semibold text-center">
          ⏳ Time Left
          <div className="text-3xl font-bold mt-2">{formatTime(timeLeft)}</div>
          <div className="text-sm opacity-80 mt-1">of {quiz.timeLimit} min</div>
        </div>
      </div>

      <main className="flex-grow flex justify-center items-start py-10">
        {/* Centered quiz container */}
        <div className="flex flex-col w-full max-w-5xl min-h-[80vh] bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
          <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">
            {quiz.title}
          </h1>
          <p className="text-gray-600 mb-8 text-center">{quiz.description}</p>

          <div className="flex flex-col gap-6">
            {quiz.questions.map((q) => (
              <div key={q.id}>
                <h3 className="font-semibold text-lg mb-3">
                  Question {q.id}: {q.question}
                </h3>
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className="block cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleChange(q.id, opt)}
                        className="mr-2"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {warning && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mt-8 text-center">
              ⚠️ You haven’t answered all questions. Continue submitting?
              <div className="mt-3 flex gap-3 justify-center">
                <button
                  onClick={() => finalizeSubmit()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Continue
                </button>
                <button
                  onClick={() => setWarning(false)}
                  className="bg-gray-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Centered Submit Button */}
          <div className="flex justify-center mt-10">
            <button
              onClick={handleSubmit}
              className="w-1/2 bg-green-600 text-white text-lg font-semibold px-10 py-3 rounded-xl hover:bg-green-700"
            >
              Finish Quiz
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
