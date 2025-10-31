import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Users, BookOpen, Calendar, TrendingUp, GraduationCap } from "lucide-react";

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

export function CoordinatorDashboard() {
  const [stats] = useState<Stats>(MOCK_STATS);
  const [activities] = useState<RecentActivity[]>(MOCK_ACTIVITIES);

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
      </main>
    </div>
  );
}
