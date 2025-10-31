"use client";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PrivateNotePage() {
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError(true); // show red border and red line
      return;
    }
    console.log("New Private Note:", note);
    setSubmitted(true);
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        navigate(`/mentee_progress/${id}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-10">
        <Card className="max-w-xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-800">Add Private Note</CardTitle>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                  placeholder="Write your note here..."
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    if (e.target.value.trim()) setError(false); // remove red border when typing
                  }}
                  className={`w-full border rounded-lg p-3 mt-1 focus:ring-2 ${
                    error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                  }`}
                />
                {error && (
                  <p className="text-red-500 text-sm">Note cannot be empty.</p>
                )}
                <Button
                  type="submit"
                  className="bg-blue-800 hover:bg-blue-700 text-white"
                >
                  Save Note
                </Button>
              </form>
            ) : (
              <p className="text-green-600 font-medium text-center">
                ✅ Note saved successfully! Redirecting to dashboard...
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
