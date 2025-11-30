import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  GraduationCap,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type Stats = {
  totalMentees: number;
  totalTutors: number;
  totalClasses: number;
  totalSessions: number;
  totalSubjects: number;
  upcomingSessions: number;
  completedSessions: number;
};

type RecentActivity = {
  id: string;
  type: "registration" | "class_created" | "session_completed";
  description: string;
  timestamp: string;
  user: string;
};

type ClassConflict = {
  class1_id: string;
  class1_subject: string;
  class1_code: string;
  class2_id: string;
  class2_subject: string;
  class2_code: string;
  tutor_name: string;
  week_day: string;
  conflict_periods: string;
};

export function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [conflicts, setConflicts] = useState<ClassConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "conflicts">(
    "overview"
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [statsRes, activitiesRes, conflictsRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/activities", { params: { limit: 5 } }),
        api.get("/api/admin/conflicts"),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (activitiesRes.data.success) {
        setActivities(activitiesRes.data.data.activities);
      }

      if (conflictsRes.data.success) {
        setConflicts(conflictsRes.data.data.conflicts);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail?.error || "Failed to load dashboard data"
      );
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return "👤";
      case "class_created":
        return "➕";
      case "session_completed":
        return "✅";
      default:
        return "📌";
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="border-blue-200">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading dashboard data...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="py-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {!loading && !error && stats && (
          <>
            {/* Tab Navigation */}
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-6 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("conflicts")}
                className={`py-2 px-6 text-sm font-semibold rounded-lg transition-all flex items-center space-x-2 ${
                  activeTab === "conflicts"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Conflict Summary</span>
                {conflicts.length > 0 && (
                  <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {conflicts.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "overview" ? (
              <>
                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200"
                    onClick={() => navigate("/admin/users")}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">
                        Manage Users
                      </CardTitle>
                      <CardDescription>
                        View and manage mentees and tutors
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/admin/users");
                        }}
                      >
                        View Users
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200" 
                  onClick={() => navigate("/admin/registrations")}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">
                        Manage Classes
                      </CardTitle>
                      <CardDescription>
                        Oversee all tutoring classes and sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" 
                      onClick={() => navigate("/admin/registrations")}
                      >
                        View Classes
                      </Button>
                    </CardContent>
                  </Card>

                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200"
                    onClick={() => navigate("/admin/reports")}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900">
                        Reports
                      </CardTitle>
                      <CardDescription>
                        Generate and view system reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/admin/reports");
                        }}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Reports
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                {/* Recent Activity */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-blue-900">
                          Recent Activity
                        </CardTitle>
                        <CardDescription>
                          Latest updates from the system
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                        >
                          <div className="text-2xl">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              by {activity.user} •{" "}
                              {formatTimestamp(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Conflict Summary Tab */
              <div className="space-y-6">
                <Card className="border-red-200">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <div>
                        <CardTitle className="text-xl text-red-900">
                          Schedule Conflicts
                        </CardTitle>
                        <CardDescription>
                          Overlapping classes and sessions that need attention
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {conflicts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-green-600 font-medium">
                          ✓ No scheduling conflicts detected
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          All classes are properly scheduled
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-red-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                                Class 1
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                                Class 2
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                                Tutor
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                                Day
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                                Conflict Periods
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {conflicts.map((conflict, index) => (
                              <tr key={index} className="hover:bg-red-50">
                                <td className="px-4 py-3 text-sm">
                                  <div className="font-medium text-gray-900">
                                    {conflict.class1_subject}
                                  </div>
                                  <div className="text-gray-600 text-xs">
                                    {conflict.class1_code}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="font-medium text-gray-900">
                                    {conflict.class2_subject}
                                  </div>
                                  <div className="text-gray-600 text-xs">
                                    {conflict.class2_code}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {conflict.tutor_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {conflict.week_day.charAt(0).toUpperCase() +
                                    conflict.week_day.slice(1)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-red-600 font-medium">
                                      {conflict.conflict_periods}
                                    </span>
                                    <span className="relative group">
                                      <AlertTriangle className="w-4 h-4 text-red-500 cursor-help" />
                                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Time slots overlap
                                      </span>
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
    </div>
  );
}
