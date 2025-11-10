import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calendar, BookOpen, GraduationCap } from "lucide-react";

export function MenteeHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Mentee Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Welcome back, {user?.full_name || 'Student'}! Ready to continue your learning journey?
            </p>
          </div>

          {/* Info Card */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 text-lg">
                  You have <span className="font-bold text-blue-600">3 active classes</span>.
                </p>
                <p className="text-gray-600 text-sm">
                  Next session: <span className="font-semibold">Mathematics</span> - Monday, 2:00 PM
                </p>
              </div>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Schedule Button */}
            <Card 
              className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 hover:border-blue-400"
              onClick={() => navigate('/mentee/schedule')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">My Schedule</h2>
                <p className="text-gray-600">
                  View your registered classes, manage sessions, and track upcoming activities.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  View Schedule
                </Button>
              </div>
            </Card>

            {/* Register for Classes Button */}
            <Card 
              className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200 hover:border-sky-400"
              onClick={() => navigate('/mentee/registration')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Register for Classes</h2>
                <p className="text-gray-600">
                  Browse available subjects and enroll in new classes to expand your knowledge.
                </p>
                <Button 
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                  size="lg"
                >
                  Browse Classes
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="p-4 text-center bg-white">
              <p className="text-3xl font-bold text-blue-600">3</p>
              <p className="text-gray-600 text-sm">Active Classes</p>
            </Card>
            <Card className="p-4 text-center bg-white">
              <p className="text-3xl font-bold text-green-600">12</p>
              <p className="text-gray-600 text-sm">Completed Sessions</p>
            </Card>
            <Card className="p-4 text-center bg-white">
              <p className="text-3xl font-bold text-purple-600">8</p>
              <p className="text-gray-600 text-sm">Upcoming Sessions</p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
