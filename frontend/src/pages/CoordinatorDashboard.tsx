import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Users, BookOpen, Calendar, TrendingUp, GraduationCap, AlertTriangle } from "lucide-react";

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
  type: 'registration' | 'class_created' | 'session_completed';
  description: string;
  timestamp: string;
  user: string;
};

const MOCK_STATS: Stats = {
  totalMentees: 45,
  totalTutors: 12,
  totalClasses: 8,
  totalSessions: 96, // 8 classes × avg 12 sessions per class
  totalSubjects: 15,
  upcomingSessions: 80,
  completedSessions: 16,
};

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: "1",
    type: "registration",
    description: "New mentee registered for Advanced Mathematics CC01",
    timestamp: "2025-10-29T10:30:00",
    user: "John Doe",
  },
  {
    id: "2",
    type: "class_created",
    description: "New class created: Data Structures CC02",
    timestamp: "2025-10-29T09:15:00",
    user: "Prof. Michael Chen",
  },
  {
    id: "3",
    type: "session_completed",
    description: "Session completed: Physics I CC01 - Week 2",
    timestamp: "2025-10-28T16:00:00",
    user: "Dr. Emily Brown",
  },
  {
    id: "4",
    type: "registration",
    description: "New mentee registered for Web Development CC01",
    timestamp: "2025-10-28T14:20:00",
    user: "Jane Smith",
  },
  {
    id: "5",
    type: "class_created",
    description: "New class created: Database Systems CC01",
    timestamp: "2025-10-28T11:00:00",
    user: "Prof. David Lee",
  },
];

type ClassConflict = {
  id: string;
  subject: string;
  tutor: string;
  day: string;
  periods: string;
  conflictsWith: string;
};

const MOCK_CONFLICTS: ClassConflict[] = [
  {
    id: "1",
    subject: "Mathematics",
    tutor: "Dr. Smith",
    day: "Monday",
    periods: "2–4",
    conflictsWith: "Class CC02 (Physics) - Monday 3–5"
  },
  {
    id: "2",
    subject: "Computer Science",
    tutor: "Prof. Johnson",
    day: "Wednesday",
    periods: "8–10",
    conflictsWith: "Class CC01 (Database) - Wednesday 9–11"
  }
];

export function CoordinatorDashboard() {
  const [stats] = useState<Stats>(MOCK_STATS);
  const [activities] = useState<RecentActivity[]>(MOCK_ACTIVITIES);
  const [conflicts] = useState<ClassConflict[]>(MOCK_CONFLICTS);
  const [activeTab, setActiveTab] = useState<'overview' | 'conflicts'>('overview');

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
      case 'registration':
        return '👤';
      case 'class_created':
        return '➕';
      case 'session_completed':
        return '✅';
      default:
        return '📌';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-900">Coordinator Dashboard</h1>
          <p className="text-gray-600">Overview of the tutoring system</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('conflicts')}
            className={`pb-3 px-4 text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'conflicts'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Conflict Summary</span>
            {conflicts.length > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                {conflicts.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalMentees}</div>
              <p className="text-xs text-gray-600">Active students</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.totalTutors}</div>
              <p className="text-xs text-gray-600">Active tutors</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.totalClasses}</div>
              <p className="text-xs text-gray-600">Active classes</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.totalSessions}</div>
              <p className="text-xs text-gray-600">
                {stats.upcomingSessions} upcoming
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-900">{stats.totalSubjects}</div>
              <p className="text-xs text-gray-600">Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-blue-900">Recent Activity</CardTitle>
                <CardDescription>Latest updates from the system</CardDescription>
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
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      by {activity.user} • {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Manage Users</CardTitle>
              <CardDescription>View and manage mentees and tutors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Manage Classes</CardTitle>
              <CardDescription>Oversee all tutoring classes and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Classes
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Reports</CardTitle>
              <CardDescription>Generate and view system reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
          </>
        ) : (
          /* Conflict Summary Tab */
          <div className="space-y-6">
            <Card className="border-red-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <CardTitle className="text-xl text-red-900">Schedule Conflicts</CardTitle>
                    <CardDescription>Overlapping classes and sessions that need attention</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {conflicts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-green-600 font-medium">✓ No scheduling conflicts detected</p>
                    <p className="text-gray-500 text-sm mt-2">All classes are properly scheduled</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Subject</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Tutor</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Day</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Periods</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Conflicts With</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {conflicts.map((conflict) => (
                          <tr key={conflict.id} className="hover:bg-red-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{conflict.subject}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{conflict.tutor}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{conflict.day}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{conflict.periods}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-red-600 font-medium">{conflict.conflictsWith}</span>
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
      </main>
    </div>
  );
}
