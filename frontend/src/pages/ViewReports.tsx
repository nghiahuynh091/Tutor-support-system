import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
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

// Types for the new consolidated report structure
type ReportCategory = "performance" | "resource_allocation" | "engagement";
type ReportType =
  | "course_analytics"
  | "resource_usage"
  | "participation"
  | "subject_performance"
  | "tutor_workload"
  | "scholarship_eligible"
  | "class_utilization";

type ActiveReport = {
  category: ReportCategory;
  subReport: ReportType;
};

export function ViewReports() {
  const [activeReport, setActiveReport] = useState<ActiveReport | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (category: ReportCategory, subReport: ReportType) => {
    setLoading(true);
    setError(null);
    setActiveReport({ category, subReport });

    try {
      const endpointMap: Record<ReportType, string> = {
        course_analytics: "/api/admin/reports/course-analytics",
        resource_usage: "/api/admin/reports/resource-usage",
        participation: "/api/admin/reports/participation",
        subject_performance: "/api/admin/reports/subject-performance",
        tutor_workload: "/api/admin/reports/tutor-workload",
        scholarship_eligible: "/api/admin/reports/scholarship-eligible",
        class_utilization: "/api/admin/reports/class-utilization",
      };
      const endpoint = endpointMap[subReport];
      const response = await api.get(endpoint);
      setReportData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch report");
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportCSV = () => {
    if (!activeReport || !reportData) return;

    const { subReport } = activeReport;
    let csvContent = "";
    let filename = `${subReport}.csv`;

    try {
        switch (subReport) {
            case "course_analytics":
              csvContent = "Course Name,Enrollments,Completions,Rating,Attendance Rate\n";
              reportData.courses?.forEach((c: any) => { csvContent += `${c.name},${c.enrollments},${c.completions},${c.rating},${c.attendanceRate}\n`; });
              break;
            case "resource_usage":
              csvContent = "Resource,Type,Downloads,Views,Upload Date\n";
              reportData.resources?.forEach((r: any) => { csvContent += `${r.name},${r.type},${r.downloads},${r.views},${r.uploadDate}\n`; });
              break;
            case "participation":
              csvContent = "Name,Role,Sessions Attended,Total Hours,Attendance Rate,Last Active\n";
              reportData.participants?.forEach((p: any) => { csvContent += `${p.name},${p.role},${p.sessionsAttended},${p.totalHours},${p.attendanceRate},${p.lastActive}\n`; });
              break;
            case "subject_performance":
              csvContent = "Subject,Code,Classes,Students,Active,Rating,Attendance,Tutors,Avg Class Size\n";
              reportData.subjects?.forEach((s: any) => { csvContent += `${s.subject_name},${s.subject_code},${s.total_classes},${s.total_students},${s.active_students},${s.avg_rating},${s.avg_attendance_rate},${s.tutors_teaching},${s.avg_class_size}\n`; });
              break;
            case "tutor_workload":
              csvContent = "Tutor,Expertise,Classes,Students,Sessions,Avg Class Size,Utilization,Rating,Workload\n";
              reportData.tutors?.forEach((t: any) => { csvContent += `${t.tutor_name},${t.expertise_areas},${t.total_classes},${t.total_students},${t.total_sessions},${t.avg_class_size},${t.utilization_rate},${t.avg_rating},${t.workload_status}\n`; });
              break;
            case "scholarship_eligible":
              csvContent = "Student,Email,Faculty,Major,Enrolled,Attended,Hours,Attendance Rate,Level\n";
              reportData.students?.forEach((s: any) => { csvContent += `${s.student_name},${s.email},${s.faculty},${s.major},${s.classes_enrolled},${s.sessions_attended},${s.total_hours},${s.attendance_rate},${s.achievement_level}\n`; });
              break;
            case "class_utilization":
              csvContent = "Class ID,Subject,Tutor,Schedule,Location,Capacity,Enrolled,Utilization,Rating,Status\n";
              reportData.classes?.forEach((c: any) => { csvContent += `${c.class_id},${c.subject_name},${c.tutor_name},${c.day} ${c.start_time}-${c.end_time},${c.location},${c.capacity},${c.current_enrolled},${c.utilization_rate},${c.avg_rating},${c.utilization_status}\n`; });
              break;
          }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export report");
    }
  };

  const TabButton = ({ label, reportType, category }: { label: string; reportType: ReportType; category: ReportCategory }) => (
    <button
      onClick={() => fetchReport(category, reportType)}
      className={`py-2 px-4 text-sm font-semibold rounded-md transition-colors ${ activeReport?.subReport === reportType
          ? "bg-blue-600 text-white shadow"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  const renderSubReport = (subReport: ReportType) => {
     if (loading) {
      return (
        <div className="py-24 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      );
    }

    if (error) return <p className="text-red-600 text-center py-12">{error}</p>;
    if (!reportData) return <p className="text-gray-500 text-center py-12">No data available.</p>;

    switch (subReport) {
      case "subject_performance":
        return (
          <div className="space-y-2">
            {reportData.subjects?.map((s: any) => (
              <div key={s.subject_id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-bold">{s.subject_name}</p>
                <p className="text-sm text-gray-600">{s.total_students} Students, {s.total_classes} Classes, {s.avg_attendance_rate}% Avg. Attendance, ⭐{s.avg_rating} Avg. Rating</p>
              </div>
            ))}
          </div>
        );
      case "tutor_workload":
        return (
          <div className="space-y-2">
            {reportData.tutors?.map((t: any) => (
              <div key={t.tutor_id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">{t.tutor_name}</p>
                  <p className="text-sm text-gray-600">{t.total_classes} Classes, {t.total_students} Students, {t.utilization_rate}% Utilization</p>
                </div>
                <Badge>{t.workload_status}</Badge>
              </div>
            ))}
          </div>
        );
      case "participation":
        return (
          <div className="space-y-2">
            {reportData.participants?.map((p: any, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-bold">{p.name} ({p.role})</p>
                <p className="text-sm text-gray-600">{p.sessionsAttended} Sessions Attended, {p.totalHours}h Total</p>
              </div>
            ))}
          </div>
        );
      // Add other cases here...
      default:
        return <p className="text-center py-12">Report view for '{subReport}' is not yet implemented.</p>;
    }
  };

  const renderReportContainer = () => {
    if (!activeReport) return null;

    const { category, subReport } = activeReport;

    return (
      <Card className="mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {category === 'performance' && 'Performance Report'}
              {category === 'resource_allocation' && 'Resource Allocation Report'}
              {category === 'engagement' && 'Student Engagement Report'}
            </CardTitle>
            <Button onClick={handleExportCSV} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 border-b mb-4 pb-2">
            {category === 'performance' && (
              <>
                <TabButton label="By Subject" reportType="subject_performance" category="performance" />
                <TabButton label="By Course" reportType="course_analytics" category="performance" />
              </>
            )}
            {category === 'resource_allocation' && (
              <>
                <TabButton label="Tutor Workload" reportType="tutor_workload" category="resource_allocation" />
                <TabButton label="Class Utilization" reportType="class_utilization" category="resource_allocation" />
                <TabButton label="Material Usage" reportType="resource_usage" category="resource_allocation" />
              </>
            )}
            {category === 'engagement' && (
              <>
                <TabButton label="Participation" reportType="participation" category="engagement" />
                <TabButton label="Scholarship Eligible" reportType="scholarship_eligible" category="engagement" />
              </>
            )}
          </div>
          <div>
            {renderSubReport(subReport)}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">View Reporting</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
         <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fetchReport("performance", "subject_performance")}>
            <CardHeader className="text-center"><BarChart3 className="h-10 w-10 text-blue-600 mx-auto mb-2" /><CardTitle>Performance</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-center text-gray-600">Analyze performance by subject and course.</p></CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fetchReport("resource_allocation", "tutor_workload")}>
            <CardHeader className="text-center"><Briefcase className="h-10 w-10 text-purple-600 mx-auto mb-2" /><CardTitle>Resource Allocation</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-center text-gray-600">Oversee tutors, classes, and materials usage.</p></CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fetchReport("engagement", "participation")}>
            <CardHeader className="text-center"><Users className="h-10 w-10 text-orange-600 mx-auto mb-2" /><CardTitle>Student Engagement</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-center text-gray-600">Track participation and scholarship eligibility.</p></CardContent>
          </Card>
      </div>

      {activeReport ? renderReportContainer() : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Select a report category to view data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}