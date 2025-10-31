"use client";

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const FeedbackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      alert("Please provide a rating before submitting.");
      return;
    }

    console.log({
      id,
      rating,
      comment,
    });

    alert("Feedback submitted successfully!");
    navigate("/"); // back to dashboard (or change to your main page)
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow flex justify-center items-center p-6">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
            Session Feedback
          </h2>

          <p className="text-gray-600 text-center mb-8">
            You are giving feedback for <span className="font-semibold text-blue-600">Session ID: {id || "(none found)"}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Rating *</label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setRating(num)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg font-bold transition ${
                      rating === num
                        ? "bg-blue-600 text-white"
                        : "border-gray-300 hover:bg-blue-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Comments (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                placeholder="Share your feedback..."
                rows={4}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
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
