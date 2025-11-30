"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Trash2, X, Plus } from "lucide-react";
import { useParams } from "react-router-dom";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  score: number;
}

// Updated Interface to match your new JSON structure
interface AssignmentData {
  id?: number;
  class_id: number;
  session_id: number;
  type: string;
  title: string;
  description: string;
  due_date: string;
  // Backend now returns questions and answers separately
  questions: {
    title: string;
    options: string[];
    question_type?: string;
  }[];
  answers: {
    correct_answer: string;
    score_value: number;
  }[];
}

export const QuizPage: React.FC = () => {
  const { classId, sessionId } = useParams<{ classId: string; sessionId: string }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);

  // Form fields
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    timeLength: "60",
    description: "",
  });

  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: [""], correctAnswer: "", score: 1 },
  ]);

  const [errors, setErrors] = useState({
    title: false,
    dueDate: false,
    timeLength: false,
    questions: [
      { question: false, options: [false] }
    ],
  });

  const [showModal, setShowModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Fetch Logic - Updated to merge 'questions' and 'answers' arrays
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!classId || !sessionId) return;
      
      try {
        const response = await fetch(`http://localhost:8002/assignments/${classId}/${sessionId}`);
        
        if (response.ok) {
          const data: AssignmentData = await response.json();
          setExistingId(data.id || null);
          setIsReadOnly(true);
          
          const dateObj = new Date(data.due_date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          setForm({
            title: data.title,
            description: data.description,
            dueDate: formattedDate,
            timeLength: "60", // Defaulting as not in JSON, or parse from description if needed
          });

          // Merge the separated backend arrays back into UI state
          if (data.questions && data.answers && data.questions.length === data.answers.length) {
            const mappedQuestions = data.questions.map((q, index) => ({
              question: q.title,
              options: q.options,
              correctAnswer: data.answers[index].correct_answer, // Map from answers array
              score: data.answers[index].score_value // Map from answers array
            }));
            setQuestions(mappedQuestions);
          }
        }
      } catch (error) {
        console.log("No existing assignment found, create mode enabled.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [classId, sessionId]);

  // Handlers
  const handleFormChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (value.trim()) setErrors({ ...errors, [key]: false });
  };

  const handleChange = (qIndex: number, key: string, value: string | number, oIndex?: number) => {
    const newQuestions = [...questions];
    const newErrors = { ...errors, questions: [...errors.questions] };

    if (key === "question") {
      newQuestions[qIndex].question = value as string;
      if ((value as string).trim()) newErrors.questions[qIndex].question = false;
    } else if (key === "option" && oIndex !== undefined) {
      newQuestions[qIndex].options[oIndex] = value as string;
      if ((value as string).trim()) newErrors.questions[qIndex].options[oIndex] = false;
    } else if (key === "correctAnswer") {
      newQuestions[qIndex].correctAnswer = value as string;
    } else if (key === "score") {
      newQuestions[qIndex].score = Number(value);
    }

    setQuestions(newQuestions);
    setErrors(newErrors);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: [""], correctAnswer: "", score: 1 }]);
    setErrors({ ...errors, questions: [...errors.questions, { question: false, options: [false] }] });
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push("");
    setQuestions(newQuestions);
    
    const newErrors = { ...errors };
    if(!newErrors.questions[qIndex].options) newErrors.questions[qIndex].options = [];
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

  // --- UPDATED SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      title: !form.title.trim(),
      dueDate: !form.dueDate.trim(),
      timeLength: !form.timeLength.trim(),
      questions: questions.map((q) => ({
        question: !q.question.trim(),
        options: q.options.map((o) => !o.trim()),
      })),
    };
    setErrors(newErrors);
    const hasErrors = newErrors.title || newErrors.dueDate || newErrors.timeLength || 
      newErrors.questions.some((q) => q.question || q.options.some((o) => o));
    
    if (hasErrors) return;

    // 1. Prepare Questions Array
    const payloadQuestions = questions.map(q => ({
      title: q.question,
      options: q.options,
      question_type: "multiple_choice" // Hardcoded as per your requirement
    }));

    // 2. Prepare Answers Array
    const payloadAnswers = questions.map(q => ({
      correct_answer: q.correctAnswer,
      score_value: Number(q.score) // Renamed from 'score' to 'score_value'
    }));

    // 3. Construct Final JSON
    const payload = {
      class_id: parseInt(classId || "0"),
      session_id: parseInt(sessionId || "0"),
      type: "quiz",
      title: form.title,
      description: form.description,
      due_date: `${form.dueDate}T18:00:00+07:00`, 
      questions: payloadQuestions,
      answers: payloadAnswers
    };

    try {
      const res = await fetch("http://localhost:8002/assignments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Quiz submitted successfully!");
        window.location.reload(); 
      } else {
        const errorData = await res.json();
        console.error("Backend Error:", errorData);
        alert(`Failed to submit quiz. Status: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting quiz.");
    }
  };

  const handleDeleteQuiz = async () => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const url = existingId 
        ? `http://localhost:8002/assignments/${existingId}`
        : `http://localhost:8002/assignments/${classId}/${sessionId}`;

      const res = await fetch(url, { method: "DELETE" });

      if (res.ok) {
        alert("Quiz deleted.");
        window.location.reload();
      } else {
        alert("Failed to delete quiz.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex justify-center items-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-4xl border border-gray-100">
          
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {isReadOnly ? "Quiz Details" : "Create New Quiz"}
              </h2>
              <p className="text-gray-500 mt-1">Session {sessionId}</p>
            </div>
            {isReadOnly && (
               <span className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-100">
                 Read Only Mode
               </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Assignment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quiz Title</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={form.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  className={`w-full p-3 border rounded-lg transition-all ${
                    errors.title ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-100 focus:border-blue-400"
                  } ${isReadOnly ? "bg-gray-50" : "bg-white"}`}
                  placeholder="e.g. Chapter 3 Review"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  value={form.dueDate}
                  onChange={(e) => handleFormChange("dueDate", e.target.value)}
                  className={`w-full p-3 border rounded-lg transition-all ${
                    errors.dueDate ? "border-red-300" : "border-gray-300 focus:ring-blue-100 focus:border-blue-400"
                  } ${isReadOnly ? "bg-gray-50" : "bg-white"}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  disabled={isReadOnly}
                  value={form.timeLength}
                  onChange={(e) => handleFormChange("timeLength", e.target.value)}
                  className={`w-full p-3 border rounded-lg transition-all ${
                    errors.timeLength ? "border-red-300" : "border-gray-300 focus:ring-blue-100 focus:border-blue-400"
                  } ${isReadOnly ? "bg-gray-50" : "bg-white"}`}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  disabled={isReadOnly}
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  rows={3}
                  className={`w-full p-3 border rounded-lg transition-all border-gray-300 focus:ring-blue-100 focus:border-blue-400 ${
                    isReadOnly ? "bg-gray-50" : "bg-white"
                  }`}
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Questions List */}
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50/50 border border-gray-200 rounded-xl p-6 shadow-sm relative transition-all hover:shadow-md">
                  
                  {/* Question Header: Title, Score, Delete */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mt-1">Question {qIndex + 1}</h3>
                    
                    <div className="flex items-center gap-4">
                      {/* Score Input - Separated */}
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Score</label>
                        <input
                          type="number"
                          min="1"
                          disabled={isReadOnly}
                          value={q.score}
                          onChange={(e) => handleChange(qIndex, "score", e.target.value)}
                          className={`w-12 text-center font-semibold bg-transparent border-none focus:ring-0 p-0 text-gray-800 ${isReadOnly ? "cursor-default" : ""}`}
                        />
                      </div>

                      {/* Delete Question Button - Separated */}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => confirmDelete(qIndex)}
                          className="p-2  hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={q.question}
                      onChange={(e) => handleChange(qIndex, "question", e.target.value)}
                      placeholder="Enter the question here..."
                      className={`w-full p-4 border rounded-lg text-lg transition-all ${
                        errors.questions[qIndex]?.question ? "border-red-300 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      } ${isReadOnly ? "bg-gray-100 border-transparent" : "bg-white"}`}
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-4 pl-1">
                    {q.options.map((opt, oIndex) => {
                      const isCorrect = isReadOnly && q.correctAnswer === opt;
                      return (
                        <div key={oIndex} className="flex items-start gap-4">
                          
                          {/* Option Input Wrapper */}
                          <div className="flex-grow">
                            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isCorrect ? "text-green-600" : "text-gray-400"}`}>
                               Option {oIndex + 1} {isCorrect && "✓"}
                            </label>
                            
                            <div className="relative">
                              <input
                                type="text"
                                disabled={isReadOnly}
                                value={opt}
                                onChange={(e) => handleChange(qIndex, "option", e.target.value, oIndex)}
                                className={`w-full p-3 border rounded-lg transition-all ${
                                  errors.questions[qIndex]?.options[oIndex] ? "border-red-300" : 
                                  isCorrect ? "border-green-500 bg-green-50/30 ring-1 ring-green-500" : "border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                } ${isReadOnly && !isCorrect ? "bg-gray-100 text-gray-600 border-transparent" : "bg-white"}`}
                              />
                            </div>
                          </div>

                          {/* Delete Option Button - Separated column */}
                          {!isReadOnly && (
                            <div className="mt-8"> {/* Top margin to align with input box (skipping label) */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (q.options.length === 1) return alert("Min 1 option required");
                                  const newQuestions = [...questions];
                                  newQuestions[qIndex].options.splice(oIndex, 1);
                                  setQuestions(newQuestions);
                                }}
                                className="p-2.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                title="Delete Option"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer: Add Option & Correct Answer */}
                  {!isReadOnly && (
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200 border-dashed">
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="flex items-center gap-2 text-sm font-semibold hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Plus size={16} /> Add Option
                      </button>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Correct Answer:</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => handleChange(qIndex, "correctAnswer", e.target.value)}
                          className="flex-grow sm:w-48 p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                        >
                          <option value="">-- Select --</option>
                          {q.options.map((opt, i) => (
                            <option key={i} value={opt}>Option {i+1}: {opt || "(empty)"}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            {!isReadOnly ? (
              <div className="flex flex-col gap-4 pt-4">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"
                >
                  <Plus size={20} /> Add New Question
                </button>
                
                <div className="flex justify-end mt-4">
                   <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-md hover:shadow-lg"
                  >
                    Save & Publish Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center pt-8">
                <button
                  type="button"
                  onClick={handleDeleteQuiz}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-bold shadow-md flex items-center gap-2"
                >
                  <Trash2 size={20} />
                  Delete This Quiz
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 relative transform transition-all scale-100">
             <button className="absolute top-3 right-3 text-gray-400 hover:text-black" onClick={() => setShowModal(false)}><X size={20} /></button>
             <h3 className="font-bold text-lg text-gray-900 mb-2">Delete Question?</h3>
             <p className="text-gray-500 text-sm mb-6">Are you sure you want to remove this question? This cannot be undone.</p>
             <div className="flex justify-end gap-3">
               <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200">Cancel</button>
               <button onClick={handleDeleteConfirmed} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm">Delete</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};