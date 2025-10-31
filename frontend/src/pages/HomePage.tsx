import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentRole } = useAuth();

  // Redirect based on role when user is authenticated
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/') {
      switch (currentRole) {
        case 'mentee':
          // Stay on home page
          navigate('/sessions', { replace: true });
          break;
        case 'tutor':
          navigate('/tutor/sessions', { replace: true });
          break;
        case 'coordinator':
          navigate('/coordinator/dashboard', { replace: true });
          break;
      }
    }
  }, [isAuthenticated, currentRole, navigate, location.pathname]);

  const getActionButton = () => {
    if (!isAuthenticated) return null;

    switch (currentRole) {
      case 'mentee':
        return (
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/sessions")}
          >
            Browse Available Sessions
          </Button>
        );
      case 'tutor':
        return (
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/tutor/sessions")}
          >
            Manage My Sessions
          </Button>
        );
      case 'coordinator':
        return (
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/coordinator/dashboard")}
          >
            View Dashboard
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-8 py-12">

        {/* Main Content */}
        <main>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-blue-900 mb-4">
              Welcome to the Tutor Support System
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Connecting students with tutors for better learning outcomes
            </p>
            {getActionButton()}
          </div>

          {/* Feature Sections */}
          <div className="space-y-24">
            {/* Students Section */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-4">
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-2">
                  For Students
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Find Your Perfect Tutor</h3>
                <p className="text-lg text-gray-600">
                  Connect with experienced tutors who can help you succeed in your studies.
                  Book sessions, access learning resources, and track your academic progress all in one place.
                </p>
              </div>
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
                <div className="aspect-video bg-white rounded-lg shadow-sm p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 bg-blue-100 rounded"></div>
                        <div className="h-3 w-1/3 bg-blue-50 rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-blue-50 rounded"></div>
                      <div className="h-24 bg-blue-50 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tutors Section */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-4">
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-2">
                  For Tutors
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Share Your Knowledge</h3>
                <p className="text-lg text-gray-600">
                  Join our community of educators and help students achieve their academic goals.
                  Manage your schedule, connect with students, and access teaching resources efficiently.
                </p>
              </div>
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
                <div className="aspect-video bg-white rounded-lg shadow-sm p-4">
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-blue-100 rounded"></div>
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-16 bg-blue-50 rounded"></div>
                      ))}
                    </div>
                    <div className="h-24 bg-blue-50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
