"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

interface FeedbackData {
  class_id: string;
  session_id: string;
  rating_scale: number;
  comments: string;
  mentee_id?: string;
  id?: string;
}

export const FeedbackPage: React.FC = () => {
  // Get params from URL
  const { sessionId, classId, menteeId } = useParams<{
    sessionId: string;
    classId: string;
    menteeId: string;
  }>();

  // Get user and auth loading state to ensure we have the token before fetching
  const { user, token, isLoading: authLoading } = useAuth();

  // State
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // Controls if form is currently locked locally
  const [dataExists, setDataExists] = useState(false); // Controls if data was fetched from server
  const [loading, setLoading] = useState(true);

  // Fetch existing feedback on mount
  useEffect(() => {
    // Wait for auth to initialize before trying to fetch
    if (authLoading) return;

    // Determine the mentee ID to use: URL param has priority, fallback to logged-in user ID
    // We assume user object might have different ID fields depending on the backend model
    const targetMenteeId = menteeId || (user as any)?.id || (user as any)?._id || (user as any)?.user_id;

    if (!targetMenteeId || !classId || !sessionId) {
      setLoading(false);
      return;
    }

    const fetchFeedback = async () => {
      try {
        const res = await fetch(
          `http://localhost:8002/feedback/${targetMenteeId}/${classId}/${sessionId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (res.ok) {
          const data = await res.json();
          // If data exists, populate fields and lock the form
          if (data) {
            setRating(data.rating_scale);
            setComment(data.comments || "");
            setIsSubmitted(true);
            setDataExists(true);
          }
        } else if (res.status === 404) {
          // If 404, it means no feedback exists yet, so we allow entry
          setDataExists(false);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [menteeId, classId, sessionId, token, authLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;

    if (!rating) {
      alert("Please provide a rating before submitting.");
      return;
    }

    try {
      const payload = {
        class_id: classId,
        session_id: sessionId,
        rating_scale: rating,
        comments: comment,
        // Backend handles mentee identification via token or inference
      };

      const res = await fetch("http://localhost:8002/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Feedback submitted successfully!");
        setIsSubmitted(true);
        setDataExists(true);
        // Optional: navigate("/") or stay on page to show it's done
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting feedback. Please check your connection.");
    }
  };

  // Show loading state while Auth is initializing OR while fetching feedback
  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <p className="text-gray-500 font-semibold animate-pulse">
            {authLoading ? "Initializing..." : "Checking feedback status..."}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow flex justify-center items-center p-6">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl relative overflow-hidden">
          
          {/* Banner for existing feedback */}
          {dataExists && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
              <p className="font-bold">Feedback Already Submitted</p>
              <p className="text-sm">You have already provided feedback for this session. The form is read-only.</p>
            </div>
          )}

          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
            Session Feedback
          </h2>

          <p className="text-gray-600 text-center mb-8">
            You are giving feedback for
            <span className="font-semibold text-blue-600"> Class: {classId}</span>
            <span className="font-semibold text-blue-600"> Session: {sessionId}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div>
              <label className="block font-semibold mb-2">
                Rating {dataExists ? "" : "*"}
              </label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    disabled={isSubmitted}
                    onClick={() => !isSubmitted && setRating(num)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg font-bold transition duration-200
                      ${
                        rating === num
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-blue-600 text-white border-green-600"
                      }
                      ${
                        isSubmitted
                          ? "opacity-60 cursor-not-allowed"
                          : "bg-blue-600 text-white border-green-600"
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <label className="block font-semibold mb-2">Comments</label>
              <textarea
                value={comment}
                readOnly={isSubmitted}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isSubmitted ? "No comments provided." : "Share your thoughts..."}
                className={`w-full p-3 border rounded-lg transition-colors ${
                  isSubmitted
                    ? "bg-gray-100 text-gray-500 border-gray-200 resize-none cursor-default"
                    : "focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                }`}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isSubmitted}
                className={`w-full md:w-1/2 py-3 rounded-lg transition font-semibold text-white shadow-sm
                  ${
                    isSubmitted
                      ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400 opacity-70"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  }
                `}
              >
                {dataExists ? "Feedback Submitted" : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};