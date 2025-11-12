import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GraduationCap, Users, BookOpen } from "lucide-react";

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const { setCurrentRole, user } = useAuth();

  const handleRoleSelect = (role: 'mentee' | 'tutor' | 'coordinator') => {
    setCurrentRole(role);
    
    if (role === 'mentee') {
      navigate('/mentee/home');
    } else if (role === 'tutor') {
      navigate('/tutor/sessions');
    } else if (role === 'coordinator') {
      navigate('/coordinator/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Select Your Role
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Welcome back, {user?.name || 'User'}! Choose how you'd like to continue.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mentee Card */}
            <Card 
              className="p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 hover:border-blue-400"
              onClick={() => handleRoleSelect('mentee')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Mentee</h2>
                <p className="text-gray-600">
                  Access your classes, view schedules, and track your learning progress.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  Continue as Mentee
                </Button>
              </div>
            </Card>

            {/* Tutor Card */}
            <Card 
              className="p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200 hover:border-sky-400"
              onClick={() => handleRoleSelect('tutor')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Tutor</h2>
                <p className="text-gray-600">
                  Manage your classes, create sessions, and support your mentees.
                </p>
                <Button 
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                  size="lg"
                >
                  Continue as Tutor
                </Button>
              </div>
            </Card>

            {/* Coordinator Card */}
            <Card 
              className="p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 hover:border-indigo-400"
              onClick={() => handleRoleSelect('coordinator')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Coordinator</h2>
                <p className="text-gray-600">
                  Oversee the system, manage conflicts, and monitor overall progress.
                </p>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  size="lg"
                >
                  Continue as Coordinator
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
