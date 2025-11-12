"use client";

import React, { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Trash2, X } from "lucide-react";
import { useParams } from "react-router-dom";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const QuizPage: React.FC = () => {
  const { id } = useParams();

  // Form fields
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    timeLength: "",
    description: "",
  });

  // Questions
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: [""], correctAnswer: "" },
  ]);

  // Errors
  const [errors, setErrors] = useState({
    title: false,
    dueDate: false,
    timeLength: false,
    questions: [
      { question: false, options: [false] } // matches questions state
    ],
  });

  const [showModal, setShowModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Form input change
  const handleFormChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (value.trim()) setErrors({ ...errors, [key]: false });
  };

  // Question change
  const handleChange = (
    qIndex: number,
    key: string,
    value: string,
    oIndex?: number
  ) => {
    const newQuestions = [...questions];
    const newErrors = { ...errors, questions: [...errors.questions] };

    if (key === "question") {
      newQuestions[qIndex].question = value;
      if (value.trim()) newErrors.questions[qIndex].question = false;
    } else if (key === "option" && oIndex !== undefined) {
      newQuestions[qIndex].options[oIndex] = value;
      if (value.trim()) newErrors.questions[qIndex].options[oIndex] = false;
    } else if (key === "correctAnswer") {
      newQuestions[qIndex].correctAnswer = value;
    }

    setQuestions(newQuestions);
    setErrors(newErrors);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: [""], correctAnswer: "" }]);
    setErrors({
      ...errors,
      questions: [...errors.questions, { question: false, options: [false] }],
    });
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push("");
    setQuestions(newQuestions);

    const newErrors = { ...errors };
    newErrors.questions[qIndex].options.push(false);
    setErrors(newErrors);
  };

  const confirmDelete = (index: number) => {
    setDeleteIndex(index);
    setShowModal(true);
  };

  const handleDeleteConfirmed = () => {
    if (deleteIndex === null) return;
    if (questions.length === 1) {
      alert("You must have at least one question!");
      setShowModal(false);
      return;
    }

    const newQuestions = [...questions];
    newQuestions.splice(deleteIndex, 1);
    setQuestions(newQuestions);

    const newErrors = { ...errors, questions: [...errors.questions] };
    newErrors.questions.splice(deleteIndex, 1);
    setErrors(newErrors);

    setShowModal(false);
    setDeleteIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: typeof errors = {
      title: !form.title.trim(),
      dueDate: !form.dueDate.trim(),
      timeLength: !form.timeLength.trim(),
      questions: questions.map((q) => ({
        question: !q.question.trim(),
        options: q.options.map((o) => !o.trim()),
      })),
    };
    setErrors(newErrors);

    // Check if any errors
    const hasErrors =
      newErrors.title ||
      newErrors.dueDate ||
      newErrors.timeLength ||
      newErrors.questions.some(
        (q) => q.question || q.options.some((o) => o)
      );
    if (hasErrors) return;

    console.log("Quiz submitted for session:", id, form, questions);
    alert("Quiz submitted successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow flex justify-center items-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
            Provide Quiz Assignment for Session {id}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block font-semibold">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                className={`w-full p-3 border rounded-lg mt-1 focus:ring-2 ${
                  errors.title ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">Title is required.</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block font-semibold">Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleFormChange("dueDate", e.target.value)}
                className={`w-full p-3 border rounded-lg mt-1 focus:ring-2 ${
                  errors.dueDate ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
                }`}
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">Due Date is required.</p>}
            </div>

            {/* Time Length */}
            <div>
              <label className="block font-semibold">Time Length (minutes) *</label>
              <input
                type="number"
                min="1"
                value={form.timeLength}
                onChange={(e) => handleFormChange("timeLength", e.target.value)}
                className={`w-full p-3 border rounded-lg mt-1 focus:ring-2 ${
                  errors.timeLength ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
                }`}
              />
              {errors.timeLength && (
                <p className="text-red-500 text-sm mt-1">Time Length is required.</p>
              )}
            </div>

            {/* Questions */}
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="relative border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <button
                  type="button"
                  onClick={() => confirmDelete(qIndex)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                  title="Delete this question"
                >
                  <Trash2 size={20} />
                </button>

                <div>
                  <label className="block font-semibold">Question {qIndex + 1} *</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleChange(qIndex, "question", e.target.value)}
                    className={`w-full p-2 border rounded-lg mt-1 focus:ring-2 ${
                      errors.questions[qIndex].question ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
                    }`}
                  />
                  {errors.questions[qIndex].question && (
                    <p className="text-red-500 text-sm mt-1">Question is required.</p>
                  )}
                </div>

                {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="relative">
                  <label className="block font-medium text-gray-600">
                    Option {String.fromCharCode(65 + oIndex)} *
                  </label>

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleChange(qIndex, "option", e.target.value, oIndex)}
                    className={`w-full p-2 border rounded-lg mt-1 focus:ring-2 ${
                      errors.questions[qIndex].options[oIndex]
                        ? "border-red-500 focus:ring-red-400"
                        : "focus:ring-blue-400"
                    }`}
                  />

                  {errors.questions[qIndex].options[oIndex] && (
                    <p className="text-red-500 text-sm mt-1">Option is required.</p>
                  )}

                  {/* 🗑️ Trash bin for deleting this option */}
                  <button
                    type="button"
                    onClick={() => {
                      if (q.options.length === 1) {
                        alert("Each question must have at least one option!");
                        return;
                      }
                      const newQuestions = [...questions];
                      newQuestions[qIndex].options.splice(oIndex, 1);
                      setQuestions(newQuestions);

                      const newErrors = { ...errors };
                      newErrors.questions[qIndex].options.splice(oIndex, 1);
                      setErrors(newErrors);
                    }}
                    className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                    title="Delete this option"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  + Add Option
                </button>

                <div>
                  <label className="block font-medium text-gray-600">Right Answer (optional)</label>
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => handleChange(qIndex, "correctAnswer", e.target.value)}
                    className="w-full p-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select the correct answer</option>
                    {q.options.map((opt, oIndex) => (
                      <option key={oIndex} value={opt}>
                        {String.fromCharCode(65 + oIndex)}. {opt || "(empty option)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-2 border-2 border-dashed border-blue-400 rounded-lg text-blue-600 hover:bg-blue-50"
            >
              + Add Another Question
            </button>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/2 mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Submit Quiz
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete this question?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
