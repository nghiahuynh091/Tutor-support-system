import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import {
  ArrowLeft,
  BarChart3,
  FileText,
  Download,
  Users,
  BookOpen,
  Briefcase,
  Award,
  TrendingUp,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

type ReportType =
  | "course_analytics"
  | "resource_usage"
  | "participation"
  | "subject_performance"
  | "tutor_workload"
  | "scholarship_eligible"
  | "class_utilization";

export function ViewReports() {
  const navigate = useNavigate();
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (type: ReportType) => {
    setLoading(true);
    setError(null);
    setSelectedReportType(type);

    try {
      let endpoint = "";
      switch (type) {
        case "course_analytics":
          endpoint = "/api/admin/reports/course-analytics";
          break;
        case "resource_usage":
          endpoint = "/api/admin/reports/resource-usage";
          break;
        case "participation":
          endpoint = "/api/admin/reports/participation";
          break;
        case "subject_performance":
          endpoint = "/api/admin/reports/subject-performance";
          break;
        case "tutor_workload":
          endpoint = "/api/admin/reports/tutor-workload";
          break;
        case "scholarship_eligible":
          endpoint = "/api/admin/reports/scholarship-eligible";
          break;
        case "class_utilization":
          endpoint = "/api/admin/reports/class-utilization";
          break;
      }

      const response = await api.get(endpoint);
      setReportData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch report");
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedReportType || !reportData) return;

    let csvContent = "";
    let filename = "";

    try {
      switch (selectedReportType) {
        case "course_analytics":
          csvContent =
            "Course Name,Enrollments,Completions,Rating,Attendance Rate\n";
          reportData.courses?.forEach((course: any) => {
            csvContent += `${course.name},${course.enrollments},${course.completions},${course.rating},${course.attendanceRate}\n`;
          });
          filename = "course_analytics.csv";
          break;

        case "resource_usage":
          csvContent = "Resource Name,Type,Downloads,Views,Upload Date\n";
          reportData.resources?.forEach((resource: any) => {
            csvContent += `${resource.name},${resource.type},${resource.downloads},${resource.views},${resource.uploadDate}\n`;
          });
          filename = "resource_usage.csv";
          break;

        case "participation":
          csvContent =
            "Name,Role,Sessions Attended,Total Hours,Attendance Rate,Last Active\n";
          reportData.participants?.forEach((participant: any) => {
            csvContent += `${participant.name},${participant.role},${participant.sessionsAttended},${participant.totalHours},${participant.attendanceRate},${participant.lastActive}\n`;
          });
          filename = "participation_report.csv";
          break;

        case "subject_performance":
          csvContent =
            "Subject Code,Subject Name,Total Classes,Total Students,Active Students,Avg Rating,Avg Attendance,Tutors Teaching,Avg Class Size\n";
          reportData.subjects?.forEach((subject: any) => {
            csvContent += `${subject.subject_code},${subject.subject_name},${subject.total_classes},${subject.total_students},${subject.active_students},${subject.avg_rating},${subject.avg_attendance_rate},${subject.tutors_teaching},${subject.avg_class_size}\n`;
          });
          filename = "subject_performance.csv";
          break;

        case "tutor_workload":
          csvContent =
            "Tutor Name,Expertise,Total Classes,Total Students,Total Sessions,Avg Class Size,Utilization Rate,Avg Rating,Workload Status\n";
          reportData.tutors?.forEach((tutor: any) => {
            csvContent += `${tutor.tutor_name},${tutor.expertise_areas},${tutor.total_classes},${tutor.total_students},${tutor.total_sessions},${tutor.avg_class_size},${tutor.utilization_rate},${tutor.avg_rating},${tutor.workload_status}\n`;
          });
          filename = "tutor_workload.csv";
          break;

        case "scholarship_eligible":
          csvContent =
            "Student Name,Email,Faculty,Major,Classes Enrolled,Sessions Attended,Total Hours,Attendance Rate,Achievement Level\n";
          reportData.students?.forEach((student: any) => {
            csvContent += `${student.student_name},${student.email},${student.faculty},${student.major},${student.classes_enrolled},${student.sessions_attended},${student.total_hours},${student.attendance_rate},${student.achievement_level}\n`;
          });
          filename = "scholarship_eligible.csv";
          break;

        case "class_utilization":
          csvContent =
            "Class ID,Subject,Tutor,Day,Time,Location,Capacity,Enrolled,Utilization Rate,Avg Rating,Status\n";
          reportData.classes?.forEach((cls: any) => {
            csvContent += `${cls.class_id},${cls.subject_name},${cls.tutor_name},${cls.day},${cls.start_time}-${cls.end_time},${cls.location},${cls.capacity},${cls.current_enrolled},${cls.utilization_rate},${cls.avg_rating},${cls.utilization_status}\n`;
          });
          filename = "class_utilization.csv";
          break;
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Report exported as ${filename}`);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export report");
    }
  };

  const renderReportResults = () => {
    if (!selectedReportType || !reportData) return null;

    if (loading) {
      return (
        <Card className="border-blue-200 mt-6">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 text-lg">Loading report data...</p>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="border-red-200 mt-6">
          <CardContent className="py-12 text-center">
            <p className="text-red-600 text-lg font-semibold mb-2">
              Error loading report
            </p>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      );
    }

    switch (selectedReportType) {
      case "course_analytics":
        return (
          <Card className="border-green-200 mt-6">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">
                Course Analytics Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-900">
                    {reportData.summary?.totalCourses || 0}
                  </div>
                  <div className="text-sm text-blue-600">Total Courses</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-900">
                    {reportData.summary?.totalEnrollments || 0}
                  </div>
                  <div className="text-sm text-blue-600">Total Enrollments</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-900">
                    {reportData.summary?.averageRating || 0}
                  </div>
                  <div className="text-sm text-blue-600">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-900">
                    {reportData.summary?.completionRate || 0}%
                  </div>
                  <div className="text-sm text-blue-600">Completion Rate</div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Course Details:</h4>
                {reportData.courses?.map((course: any) => (
                  <div
                    key={course.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-gray-600">
                        {course.enrollments} enrollments • {course.completions}{" "}
                        completions • ⭐ {course.rating} •{" "}
                        {course.attendanceRate}% attendance
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "resource_usage":
        return (
          <Card className="border-purple-200 mt-6">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-900">
                Resource Usage Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-900">
                    {reportData.summary?.totalResources || 0}
                  </div>
                  <div className="text-sm text-purple-600">Total Resources</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-lg font-bold text-purple-900">
                    {reportData.summary?.mostUsedResource || "N/A"}
                  </div>
                  <div className="text-sm text-purple-600">
                    Most Popular Resource
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">
                  Resource Usage Details:
                </h4>
                {reportData.resources?.map((resource: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{resource.name}</div>
                      <div className="text-sm text-gray-600">
                        {resource.downloads} downloads • {resource.views} views
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">
                    No resources found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "participation":
        return (
          <Card className="border-orange-200 mt-6">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-900">
                Participation Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-900">
                    {reportData.summary?.totalParticipants || 0}
                  </div>
                  <div className="text-sm text-orange-600">
                    Total Participants
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-900">
                    {reportData.summary?.activeUsers || 0}
                  </div>
                  <div className="text-sm text-orange-600">Active Users</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-900">
                    {reportData.summary?.averageSessionTime || 0}min
                  </div>
                  <div className="text-sm text-orange-600">
                    Avg Session Time
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">
                  Participant Details:
                </h4>
                {reportData.participants?.map(
                  (participant: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-gray-600">
                          {participant.sessionsAttended} sessions •{" "}
                          {participant.totalHours}h total • Last active:{" "}
                          {new Date(
                            participant.lastActive
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-gray-900 hover:text-blue-700 border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-blue-900">View Reporting</h1>
            <p className="text-gray-600">Generate and view system reports</p>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-green-200"
            onClick={() => fetchReport("course_analytics")}
          >
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-900">Course Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                View enrollment statistics, completion rates, and course
                performance metrics
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200"
            onClick={() => fetchReport("resource_usage")}
          >
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-900">Resource Report</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Analyze resource usage, downloads, and most popular learning
                materials
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200"
            onClick={() => fetchReport("participation")}
          >
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-orange-900">
                Participation Report
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Track user engagement, session attendance, and participation
                metrics
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200"
            onClick={() => fetchReport("subject_performance")}
          >
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
              <CardTitle className="text-indigo-900">
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Analyze student performance, ratings, and attendance by subject
              </p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-teal-200"
            onClick={() => fetchReport("tutor_workload")}
          >
            <CardHeader className="text-center">
              <Briefcase className="h-12 w-12 text-teal-600 mx-auto mb-2" />
              <CardTitle className="text-teal-900">Tutor Workload</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Monitor tutor efficiency, class load, and utilization rates
              </p>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200"
            onClick={() => fetchReport("scholarship_eligible")}
          >
            <CardHeader className="text-center">
              <Award className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <CardTitle className="text-yellow-900">
                Scholarship Eligible
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Identify students eligible for scholarships based on performance
              </p>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-cyan-200"
            onClick={() => fetchReport("class_utilization")}
          >
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-cyan-600 mx-auto mb-2" />
              <CardTitle className="text-cyan-900">Class Utilization</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Optimize room capacity and analyze enrollment efficiency
              </p>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        {reportData && selectedReportType && !loading && !error && (
          <div className="text-center mb-6">
            <Button
              onClick={handleExportCSV}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        )}

        {/* Report Results */}
        {renderReportResults()}

        {/* No Data Message */}
        {!selectedReportType && (
          <Card className="border-blue-200">
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Select a report type above to view data
              </p>
              <p className="text-gray-500 text-sm">
                Reports will be generated instantly with current system data
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
