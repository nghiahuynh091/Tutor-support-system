import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  MessageSquare,
} from "lucide-react";

interface SessionDetail {
  id: string;
  class_id: string;
  subject_name: string;
  subject_code: string;
  class_code: string;
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string;
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  meeting_link: string | null;
  status: "scheduled" | "completed" | "cancelled";
  topics: string[];
  materials: { name: string; url: string; type: string }[];
  homework: { title: string; dueDate: string; status: string } | null;
  attendance: "present" | "absent" | "late" | null;
  notes: string;
}

// Mock data - replace with API call
const getMockSessionDetail = (
  classId: string,
  sessionId: string
): SessionDetail => {
  return {
    id: sessionId,
    class_id: classId,
    subject_name: "Calculus 1",
    subject_code: "MT1003",
    class_code: "CC01",
    tutor_name: "Prof. Phung Trong Thuc",
    tutor_email: "thuc.phung@university.edu",
    tutor_phone: "+84 123 456 789",
    date: new Date(),
    start_time: "08:00",
    end_time: "10:00",
    location: "Room A101, Building A",
    description:
      "This session will cover the fundamentals of differential calculus, including limits, derivatives, and their applications. Students should come prepared with their textbooks and completed pre-reading assignments.",
    meeting_link: "https://meet.google.com/abc-defg-hij",
    status: "scheduled",
    topics: [
      "Introduction to Limits",
      "Properties of Limits",
      "Computing Limits",
      "Continuity and Discontinuity",
    ],
    materials: [
      { name: "Lecture Slides - Week 3", url: "#", type: "pdf" },
      { name: "Practice Problems Set", url: "#", type: "pdf" },
      { name: "Video Tutorial - Limits", url: "#", type: "video" },
    ],
    homework: {
      title: "Problem Set 3: Limits and Continuity",
      dueDate: "2025-12-05",
      status: "pending",
    },
    attendance: null,
    notes:
      "Please bring a scientific calculator to this session. We will have a short quiz at the beginning of class covering last week's material.",
  };
};

export function MenteeSessionDetailPage() {
  const { classId, sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (classId && sessionId) {
        setSession(getMockSessionDetail(classId, sessionId));
      }
      setLoading(false);
    }, 500);
  }, [classId, sessionId]);

  const getStatusColor = (status: SessionDetail["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: SessionDetail["status"]) => {
    switch (status) {
      case "scheduled":
        return <Clock className="w-5 h-5" />;
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAttendanceColor = (attendance: SessionDetail["attendance"]) => {
    switch (attendance) {
      case "present":
        return "text-green-600 bg-green-100";
      case "absent":
        return "text-red-600 bg-red-100";
      case "late":
        return "text-amber-600 bg-amber-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Session Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The session you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/mentee/schedule")}>
            Back to Schedule
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/mentee/schedule")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Schedule
          </Button>

          {/* Header Card */}
          <Card className="overflow-hidden mb-6">
            <div className={`p-6 ${getStatusColor(session.status)} text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(session.status)}
                  <span className="text-sm font-medium uppercase">
                    {session.status}
                  </span>
                </div>
                {session.attendance && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getAttendanceColor(
                      session.attendance
                    )}`}
                  >
                    {session.attendance.charAt(0).toUpperCase() +
                      session.attendance.slice(1)}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {session.subject_name}
              </h1>
              <p className="text-white/80">
                {session.subject_code} • Class {session.class_code}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date & Time */}
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-semibold text-gray-900">
                      {session.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-600">
                      {session.start_time} - {session.end_time}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">
                      {session.location}
                    </p>
                    {session.meeting_link && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center mt-1"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Join Online
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Description
                </h2>
                <p className="text-gray-600">{session.description}</p>
              </Card>

              {/* Topics */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Topics Covered
                </h2>
                <ul className="space-y-2">
                  {session.topics.map((topic, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{topic}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Materials */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-600" />
                  Learning Materials
                </h2>
                <div className="space-y-3">
                  {session.materials.map((material, index) => (
                    <a
                      key={index}
                      href={material.url}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            material.type === "pdf"
                              ? "bg-red-100 text-red-600"
                              : material.type === "video"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {material.name}
                          </p>
                          <p className="text-xs text-gray-500 uppercase">
                            {material.type}
                          </p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              </Card>

              {/* Notes */}
              {session.notes && (
                <Card className="p-6 bg-amber-50 border-amber-200">
                  <h2 className="text-lg font-bold text-amber-800 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Important Notes
                  </h2>
                  <p className="text-amber-700">{session.notes}</p>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Tutor Info */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Tutor
                </h2>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {session.tutor_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {session.tutor_name}
                    </p>
                    <p className="text-sm text-gray-500">Instructor</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span>{" "}
                    {session.tutor_email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span>{" "}
                    {session.tutor_phone}
                  </p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Tutor
                </Button>
              </Card>

              {/* Homework */}
              {session.homework && (
                <Card className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-orange-600" />
                    Homework
                  </h2>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium text-gray-900">
                      {session.homework.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Due:{" "}
                      {new Date(session.homework.dueDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        session.homework.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : session.homework.status === "submitted"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {session.homework.status.charAt(0).toUpperCase() +
                        session.homework.status.slice(1)}
                    </span>
                  </div>
                  <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                    View Homework
                  </Button>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  {session.meeting_link && session.status === "scheduled" && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      asChild
                    >
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Session
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                  {session.status === "completed" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        navigate(
                          `/mentee/sessions/feedback/${session.class_id}/${session.id}`
                        )
                      }
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Give Feedback
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
