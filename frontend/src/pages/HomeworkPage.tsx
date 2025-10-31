"use client";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function HomeworkPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ title?: boolean; dueDate?: boolean }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors = {
      title: !form.title.trim(),
      dueDate: !form.dueDate.trim(),
    };
    setErrors(newErrors);

    if (newErrors.title || newErrors.dueDate) return;

    console.log("Homework submitted:", form);
    setSubmitted(true);
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        navigate("/assignment");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-10">
        <Card className="max-w-xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-8 text-blue-700">
              Provide Homework for Session {id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block font-semibold">
                    Title *
                  </label>
                  <Input
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={errors.title ? "border-red-500 focus:ring-red-400" : ""}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">Title is required.</p>}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block font-semibold">
                    Due Date *
                  </label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className={errors.dueDate ? "border-red-500 focus:ring-red-400" : ""}
                  />
                  {errors.dueDate && <p className="text-red-500 text-sm mt-1">Due Date is required.</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold">Description (optional)</label>
                  <Textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="w-1/2 mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Submit Homework
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-green-600 text-center font-medium">
                ✅ Homework created successfully! Redirecting...
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
