import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Clock } from "lucide-react";

// Wallpaper images - using placeholder URLs (replace with actual images)
const wallpapers = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=600&fit=crop",
    title: "Start Your Learning Journey",
    subtitle: "Unlock your potential with personalized tutoring",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop",
    title: "Learn Together, Grow Together",
    subtitle: "Join a community of passionate learners",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&h=600&fit=crop",
    title: "Excellence in Education",
    subtitle: "Expert tutors guiding your success",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=600&fit=crop",
    title: "Your Success, Our Mission",
    subtitle: "Personalized learning paths for every student",
  },
];

export function MenteeHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % wallpapers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + wallpapers.length) % wallpapers.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % wallpapers.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Wallpaper Carousel */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        {/* Slides */}
        {wallpapers.map((wallpaper, index) => (
          <div
            key={wallpaper.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${wallpaper.url})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/60" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-center text-white px-4">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                  {wallpaper.title}
                </h2>
                <p className="text-xl md:text-2xl text-blue-100 drop-shadow">
                  {wallpaper.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {wallpapers.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Welcome Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name || "Student"}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to continue your learning journey?
            </p>
          </div>

          {/* Next Session Reminder - Above action cards */}
          <Card className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-amber-800 font-semibold">Next Session Coming Up</p>
                <p className="text-amber-700">
                  <span className="font-bold">Mathematics - Calculus 1</span> • Monday, 2:00 PM • Room A101
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-amber-400 text-amber-700 hover:bg-amber-100"
                onClick={() => navigate("/mentee/schedule")}
              >
                View Details
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300"
              onClick={() => navigate("/mentee/schedule")}
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">View My Schedule</h3>
                  <p className="text-gray-600 mb-4">
                    Check your upcoming sessions, manage your calendar, and track your learning progress.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Go to Schedule
                  </Button>
                </div>
              </div>
            </Card>

            <Card 
              className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-300"
              onClick={() => navigate("/mentee/registration")}
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Classes</h3>
                  <p className="text-gray-600 mb-4">
                    Explore available subjects and enroll in new classes to expand your knowledge.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Browse Classes
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
