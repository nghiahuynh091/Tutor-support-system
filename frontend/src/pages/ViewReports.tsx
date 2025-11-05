import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { ArrowLeft, BarChart3, FileText, Download, Users } from "lucide-react";

type ReportType =
  | "course_analytics"
  | "resource_report"
  | "participation_report";

type ReportData = {
  courseAnalytics: {
    totalCourses: number;
    totalEnrollments: number;
    averageRating: number;
    completionRate: number;
    courses: Array<{
      id: string;
      name: string;
      enrollments: number;
      completions: number;
      rating: number;
    }>;
  };
  resourceReport: {
    totalResources: number;
    mostUsedResource: string;
    resourceUsage: Array<{
      name: string;
      downloads: number;
      views: number;
    }>;
  };
  participationReport: {
    totalParticipants: number;
    activeUsers: number;
    averageSessionTime: number;
    participants: Array<{
      name: string;
      sessionsAttended: number;
      totalHours: number;
      lastActive: string;
    }>;
  };
};

// Mock data for reports
const MOCK_REPORT_DATA: ReportData = {
  courseAnalytics: {
    totalCourses: 8,
    totalEnrollments: 45,
    averageRating: 4.2,
    completionRate: 78,
    courses: [
      {
        id: "1",
        name: "Advanced Mathematics",
        enrollments: 12,
        completions: 9,
        rating: 4.5,
      },
      {
        id: "2",
        name: "Data Structures",
        enrollments: 15,
        completions: 12,
        rating: 4.3,
      },
      {
        id: "3",
        name: "Physics I",
        enrollments: 8,
        completions: 6,
        rating: 4.0,
      },
      {
        id: "4",
        name: "Web Development",
        enrollments: 10,
        completions: 8,
        rating: 4.1,
      },
    ],
  },
  resourceReport: {
    totalResources: 25,
    mostUsedResource: "Algorithm Study Guide",
    resourceUsage: [
      { name: "Algorithm Study Guide", downloads: 156, views: 234 },
      { name: "Math Formula Sheet", downloads: 134, views: 198 },
      { name: "Physics Lab Manual", downloads: 89, views: 145 },
      { name: "Programming Examples", downloads: 78, views: 167 },
    ],
  },
  participationReport: {
    totalParticipants: 45,
    activeUsers: 38,
    averageSessionTime: 65,
    participants: [
      {
        name: "John Doe",
        sessionsAttended: 8,
        totalHours: 12.5,
        lastActive: "2025-11-02",
      },
      {
        name: "Jane Smith",
        sessionsAttended: 6,
        totalHours: 9.2,
        lastActive: "2025-11-01",
      },
      {
        name: "Bob Wilson",
        sessionsAttended: 10,
        totalHours: 15.8,
        lastActive: "2025-11-02",
      },
      {
        name: "Alice Brown",
        sessionsAttended: 4,
        totalHours: 6.3,
        lastActive: "2025-10-28",
      },
    ],
  },
};

export function ViewReports() {
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType | null>(null);
  const [reportData] = useState<ReportData>(MOCK_REPORT_DATA);
  const [showData, setShowData] = useState(false);

  const handleGenerateReport = (type: ReportType) => {
    setSelectedReportType(type);
    setShowData(true);
  };

  const handleExportCSV = () => {
    if (!selectedReportType) return;

    let csvContent = "";
    let filename = "";

    switch (selectedReportType) {
      case "course_analytics":
        csvContent = "Course Name,Enrollments,Completions,Rating\n";
        reportData.courseAnalytics.courses.forEach((course) => {
          csvContent += `${course.name},${course.enrollments},${course.completions},${course.rating}\n`;
        });
        filename = "course_analytics.csv";
        break;

      case "resource_report":
        csvContent = "Resource Name,Downloads,Views\n";
        reportData.resourceReport.resourceUsage.forEach((resource) => {
          csvContent += `${resource.name},${resource.downloads},${resource.views}\n`;
        });
        filename = "resource_report.csv";
        break;

      case "participation_report":
        csvContent =
          "Participant Name,Sessions Attended,Total Hours,Last Active\n";
        reportData.participationReport.participants.forEach((participant) => {
          csvContent += `${participant.name},${participant.sessionsAttended},${participant.totalHours},${participant.lastActive}\n`;
        });
        filename = "participation_report.csv";
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
  };

  const renderReportResults = () => {
    if (!selectedReportType || !showData) return null;

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
                    {reportData.courseAnalytics.totalCourses}
                  </div>
                  <div className="text-sm text-blue-600">Total Courses</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-900">
                    {reportData.courseAnalytics.totalEnrollments}
                  </div>
                  <div className="text-sm text-blue-600">Total Enrollments</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-900">
                    {reportData.courseAnalytics.averageRating}
                  </div>
                  <div className="text-sm text-blue-600">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-900">
                    {reportData.courseAnalytics.completionRate}%
                  </div>
                  <div className="text-sm text-blue-600">Completion Rate</div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Course Details:</h4>
                {reportData.courseAnalytics.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-gray-600">
                        {course.enrollments} enrollments • {course.completions}{" "}
                        completions • ⭐ {course.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "resource_report":
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
                    {reportData.resourceReport.totalResources}
                  </div>
                  <div className="text-sm text-purple-600">Total Resources</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-lg font-bold text-purple-900">
                    {reportData.resourceReport.mostUsedResource}
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
                {reportData.resourceReport.resourceUsage.map(
                  (resource, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-gray-600">
                          {resource.downloads} downloads • {resource.views}{" "}
                          views
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "participation_report":
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
                    {reportData.participationReport.totalParticipants}
                  </div>
                  <div className="text-sm text-orange-600">
                    Total Participants
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-900">
                    {reportData.participationReport.activeUsers}
                  </div>
                  <div className="text-sm text-orange-600">Active Users</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-900">
                    {reportData.participationReport.averageSessionTime}min
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
                {reportData.participationReport.participants.map(
                  (participant, index) => (
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
            onClick={() => (window.location.href = "/coordinator/dashboard")}
            className="flex items-center gap-2"
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-green-200"
            onClick={() => handleGenerateReport("course_analytics")}
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
            onClick={() => handleGenerateReport("resource_report")}
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
            onClick={() => handleGenerateReport("participation_report")}
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
        </div>

        {/* Export Button */}
        {showData && selectedReportType && (
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
        {!showData && (
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
