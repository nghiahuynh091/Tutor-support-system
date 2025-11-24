"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const FeedbackPage: React.FC = () => {
  const { sessionId, classId, menteeId } = useParams<{
    sessionId: string;
    classId: string;
    menteeId: string;
  }>();

  const navigate = useNavigate();

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!menteeId || !classId || !sessionId) {
      setLoading(false);
      return;
    }

    const fetchFeedback = async () => {
      try {
        const res = await fetch(
          `http://localhost:8002/feedback/${menteeId}/${classId}/${sessionId}`
        );

        if (res.ok) {
          const data = await res.json();

          if (data) {
            setRating(data.rating_scale);
            setComment(data.comments || "");
            setIsSubmitted(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [menteeId, classId, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;

    if (!rating) {
      alert("Please provide a rating before submitting.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8002/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentee_id: menteeId,
          class_id: classId,
          session_id: sessionId,
          rating_scale: rating,
          comments: comment,
        }),
      });

      if (res.ok) {
        alert("Feedback submitted successfully!");
        navigate("/");
      } else {
        alert("Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting feedback.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow flex justify-center items-center p-6">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
            Session Feedback
          </h2>

          <p className="text-gray-600 text-center mb-8">
            You are giving feedback for
            <span className="font-semibold text-blue-600"> Class: {classId}</span>
            <span className="font-semibold text-blue-600"> Session: {sessionId}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Rating *</label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    disabled={isSubmitted}
                    onClick={() => !isSubmitted && setRating(num)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg font-bold transition ${
                      rating === num
                        ? "bg-green-600 text-white"
                        : "border-gray-300 hover:bg-blue-50"
                    } ${isSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">Comments</label>
              <textarea
                value={comment}
                readOnly={isSubmitted}
                onChange={(e) => setComment(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                  isSubmitted ? "bg-gray-100" : ""
                }`}
                rows={4}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitted}
                className={`w-1/2 py-3 rounded-lg transition font-semibold text-white ${
                  isSubmitted
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};
