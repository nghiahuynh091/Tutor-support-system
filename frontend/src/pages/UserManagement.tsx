import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import {
  Search,
  Users,
  UserX,
  ArrowLeft,
  Filter,
  X,
  Calendar,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Award,
  Clock,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "mentee" | "tutor" | "coordinator";
  status: "active" | "inactive";
  joinDate: string;
  lastActive: string;
  // Enhanced profile data
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  specialization?: string[];
  coursesEnrolled?: string[];
  coursesTaught?: string[];
  totalSessions?: number;
  completedSessions?: number;
  averageRating?: number;
  bio?: string;
};

// Mock user data with enhanced profiles
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@student.edu",
    role: "mentee",
    status: "active",
    joinDate: "2025-09-15",
    lastActive: "2025-11-01",
    phone: "+1 (555) 123-4567",
    address: "123 University Ave, Campus City, CA 12345",
    dateOfBirth: "2002-05-15",
    department: "Computer Science",
    studentId: "CS202501234",
    coursesEnrolled: ["Advanced Mathematics", "Data Structures", "Physics I"],
    totalSessions: 12,
    completedSessions: 10,
    bio: "Third-year Computer Science student passionate about algorithms and software development. Actively seeking tutoring in advanced mathematics and data structures.",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@student.edu",
    role: "mentee",
    status: "active",
    joinDate: "2025-09-20",
    lastActive: "2025-10-30",
    phone: "+1 (555) 234-5678",
    address: "456 Scholar St, University Town, CA 12346",
    dateOfBirth: "2003-08-22",
    department: "Mathematics",
    studentId: "MATH202501456",
    coursesEnrolled: ["Advanced Mathematics", "Web Development"],
    totalSessions: 8,
    completedSessions: 7,
    bio: "Mathematics major with strong analytical skills. Looking to improve problem-solving techniques and explore interdisciplinary applications.",
  },
  {
    id: "3",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@edu.com",
    role: "tutor",
    status: "active",
    joinDate: "2025-08-01",
    lastActive: "2025-11-02",
    phone: "+1 (555) 345-6789",
    address: "789 Faculty Dr, Academic Hills, CA 12347",
    dateOfBirth: "1985-12-10",
    department: "Mathematics Department",
    employeeId: "MATH_T_001",
    specialization: [
      "Calculus",
      "Linear Algebra",
      "Advanced Mathematics",
      "Statistics",
    ],
    coursesTaught: ["Advanced Mathematics CC01", "Advanced Mathematics CC02"],
    totalSessions: 45,
    completedSessions: 42,
    averageRating: 4.8,
    bio: "PhD in Mathematics with 8+ years of teaching experience. Specializes in calculus, linear algebra, and helping students develop strong mathematical foundations. Known for patient and clear explanations.",
  },
  {
    id: "4",
    name: "Prof. Michael Chen",
    email: "michael.chen@edu.com",
    role: "tutor",
    status: "active",
    joinDate: "2025-08-15",
    lastActive: "2025-11-01",
    phone: "+1 (555) 456-7890",
    address: "321 Professor Ln, Scholar Valley, CA 12348",
    dateOfBirth: "1978-03-28",
    department: "Computer Science Department",
    employeeId: "CS_T_002",
    specialization: [
      "Data Structures",
      "Algorithms",
      "Programming",
      "Software Engineering",
    ],
    coursesTaught: ["Data Structures CC01", "Programming Fundamentals CC01"],
    totalSessions: 38,
    completedSessions: 35,
    averageRating: 4.6,
    bio: "Professor of Computer Science with expertise in data structures and algorithms. Has published numerous papers on computational complexity and enjoys mentoring students in programming concepts.",
  },
  {
    id: "5",
    name: "Alice Brown",
    email: "alice.brown@student.edu",
    role: "mentee",
    status: "inactive",
    joinDate: "2025-07-10",
    lastActive: "2025-09-15",
    phone: "+1 (555) 567-8901",
    address: "654 Student Blvd, Learning City, CA 12349",
    dateOfBirth: "2001-11-08",
    department: "Physics",
    studentId: "PHYS202500654",
    coursesEnrolled: ["Physics I"],
    totalSessions: 5,
    completedSessions: 3,
    bio: "Physics student who took a semester break. Previously enrolled in introductory physics courses and showed strong interest in theoretical concepts.",
  },
  {
    id: "6",
    name: "Bob Wilson",
    email: "bob.wilson@student.edu",
    role: "mentee",
    status: "active",
    joinDate: "2025-10-01",
    lastActive: "2025-11-02",
    phone: "+1 (555) 678-9012",
    address: "987 Freshman Ave, New Student Commons, CA 12350",
    dateOfBirth: "2004-01-30",
    department: "Engineering",
    studentId: "ENG202500987",
    coursesEnrolled: ["Advanced Mathematics", "Physics I"],
    totalSessions: 4,
    completedSessions: 4,
    bio: "First-year Engineering student eager to build strong foundations in mathematics and physics. Highly motivated and consistent in attending tutoring sessions.",
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Filter users based on search and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleDeactivateUser = (user: User) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const confirmDeactivation = () => {
    if (selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "inactive" as const } : u
        )
      );
      setShowConfirmDialog(false);
      setSelectedUser(null);
      alert(`User ${selectedUser.name} has been deactivated successfully.`);
    }
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "tutor":
        return "bg-green-100 text-green-800";
      case "coordinator":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getCompletionRate = (user: User) => {
    if (!user.totalSessions || !user.completedSessions) return 0;
    return Math.round((user.completedSessions / user.totalSessions) * 100);
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
            <h1 className="text-4xl font-bold text-blue-900">
              User Account Management
            </h1>
            <p className="text-gray-600">View and manage system users</p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card className="border-blue-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="h-12 px-3 rounded-md border border-gray-300 bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="mentee">Mentees</option>
                  <option value="tutor">Tutors</option>
                  <option value="coordinator">Coordinators</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <Card className="border-blue-200">
            <CardContent className="py-12 text-center">
              {searchQuery || filterRole !== "all" ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    No users found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterRole("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">No users found in the system.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Accounts ({filteredUsers.length} users)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>
                          Joined: {new Date(user.joinDate).toLocaleDateString()}
                        </span>
                        <span>
                          Last Active:{" "}
                          {new Date(user.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(user)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        View Profile
                      </Button>
                      {user.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(user)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-red-600">
                  Confirm Deactivation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to deactivate user{" "}
                  <strong>{selectedUser.name}</strong>? This action will prevent
                  them from accessing the system.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={confirmDeactivation}
                  >
                    Yes, Deactivate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Profile Modal */}
        {showProfileModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
              <CardHeader className="border-b bg-blue-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-blue-900">
                        {selectedUser.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                            selectedUser.role
                          )}`}
                        >
                          {selectedUser.role.charAt(0).toUpperCase() +
                            selectedUser.role.slice(1)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            selectedUser.status
                          )}`}
                        >
                          {selectedUser.status.charAt(0).toUpperCase() +
                            selectedUser.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProfileModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </h3>

                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-600" />
                        <div>
                          <span className="text-sm text-gray-600">Email</span>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                      </div>

                      {selectedUser.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-600" />
                          <div>
                            <span className="text-sm text-gray-600">Phone</span>
                            <p className="font-medium">{selectedUser.phone}</p>
                          </div>
                        </div>
                      )}

                      {selectedUser.address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <div>
                            <span className="text-sm text-gray-600">
                              Address
                            </span>
                            <p className="font-medium">
                              {selectedUser.address}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedUser.dateOfBirth && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <div>
                            <span className="text-sm text-gray-600">
                              Date of Birth
                            </span>
                            <p className="font-medium">
                              {new Date(
                                selectedUser.dateOfBirth
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedUser.department && (
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-gray-600" />
                          <div>
                            <span className="text-sm text-gray-600">
                              Department
                            </span>
                            <p className="font-medium">
                              {selectedUser.department}
                            </p>
                          </div>
                        </div>
                      )}

                      {(selectedUser.studentId || selectedUser.employeeId) && (
                        <div className="flex items-center gap-3">
                          <Award className="h-4 w-4 text-gray-600" />
                          <div>
                            <span className="text-sm text-gray-600">
                              {selectedUser.role === "mentee"
                                ? "Student ID"
                                : "Employee ID"}
                            </span>
                            <p className="font-medium">
                              {selectedUser.studentId ||
                                selectedUser.employeeId}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Academic/Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {selectedUser.role === "mentee"
                        ? "Academic Information"
                        : "Professional Information"}
                    </h3>

                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      {/* For Mentees */}
                      {selectedUser.role === "mentee" &&
                        selectedUser.coursesEnrolled && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Courses Enrolled
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedUser.coursesEnrolled.map(
                                (course, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                  >
                                    {course}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* For Tutors */}
                      {selectedUser.role === "tutor" &&
                        selectedUser.specialization && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Specialization
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedUser.specialization.map(
                                (spec, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                  >
                                    {spec}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {selectedUser.role === "tutor" &&
                        selectedUser.coursesTaught && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Courses Teaching
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedUser.coursesTaught.map(
                                (course, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                                  >
                                    {course}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Session Statistics */}
                      {selectedUser.totalSessions !== undefined && (
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="text-center p-3 bg-white rounded border">
                            <div className="text-lg font-bold text-blue-600">
                              {selectedUser.totalSessions}
                            </div>
                            <div className="text-xs text-gray-600">
                              Total Sessions
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white rounded border">
                            <div className="text-lg font-bold text-green-600">
                              {selectedUser.completedSessions}
                            </div>
                            <div className="text-xs text-gray-600">
                              Completed
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white rounded border">
                            <div className="text-lg font-bold text-purple-600">
                              {getCompletionRate(selectedUser)}%
                            </div>
                            <div className="text-xs text-gray-600">
                              Completion Rate
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedUser.averageRating && (
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-lg font-bold text-yellow-600">
                            ⭐ {selectedUser.averageRating}
                          </div>
                          <div className="text-xs text-gray-600">
                            Average Rating
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Biography */}
                {selectedUser.bio && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      About
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedUser.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Member Since
                      </span>
                    </div>
                    <p className="text-blue-800">
                      {new Date(selectedUser.joinDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Last Active
                      </span>
                    </div>
                    <p className="text-green-800">
                      {new Date(selectedUser.lastActive).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowProfileModal(false)}
                  >
                    Close
                  </Button>
                  {selectedUser.status === "active" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowProfileModal(false);
                        handleDeactivateUser(selectedUser);
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Deactivate User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
