import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
  Search,
  Users,
  UserX,
  Filter,
  X,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Award,
  Loader2,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role:
    | "mentee"
    | "tutor"
    | "admin"
    | "coordinator"
    | "department_chair"
    | "academic_affairs"
    | "student_affairs";
  joinDate: string;
  phone?: string;
  bio?: string;
  faculty?: string;
  mentee_major?: string;
  tutor_major?: string;
  learning_needs?: string;
  expertise_areas?: string;
  coursesEnrolled?: string[];
  totalSessions?: number;
  completedSessions?: number;
  averageRating?: number;
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = useCallback(async (page: number, isInitial: boolean = false) => {
    if (isInitial) {
      setIsLoadingInitial(true);
    } else {
      setIsFetchingPage(true);
    }
    setError(null);
    try {
      const offset = (page - 1) * pageSize;
      const params: any = { limit: pageSize, offset };

      if (searchQuery) params.search = searchQuery;
      if (filterRole !== "all") params.role = filterRole;

      const response = await api.get("/api/admin/users", { params });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalUsers(response.data.data.total);
        setCurrentPage(page);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail?.error || "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoadingInitial(false);
      setIsFetchingPage(false);
    }
  }, [searchQuery, filterRole, pageSize]);

  useEffect(() => {
    fetchUsers(1, true);
  }, [filterRole, fetchUsers]);

  const handleSearch = () => {
    fetchUsers(1, true);
  };

  const handleDeactivateUser = (user: User) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const confirmDeactivation = async () => {
    if (!selectedUser) return;
    try {
      await api.patch(`/api/admin/users/${selectedUser.id}/deactivate`, {
        reason: "Deactivated by admin",
      });
      await fetchUsers(currentPage);
      alert(`User ${selectedUser.name} has been deactivated.`);
    } catch (err: any) {
      alert(err.response?.data?.detail?.error || "Failed to deactivate user");
    } finally {
      setShowConfirmDialog(false);
      setSelectedUser(null);
    }
  };

  const handleViewProfile = async (user: User) => {
    try {
      const response = await api.get(`/api/admin/users/${user.id}`);
      if (response.data.success) {
        setSelectedUser(response.data.data);
        setShowProfileModal(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail?.error || "Failed to load user details");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "tutor": return "bg-green-100 text-green-800";
      case "admin":
      case "coordinator":
      case "department_chair":
      case "academic_affairs":
      case "student_affairs":
        return "bg-purple-100 text-purple-800";
      case "mentee": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Account Management</h1>
      </div>
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
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
                <option value="admin">Admins</option>
                <option value="coordinator">Coordinators</option>
                <option value="unknown">Unknown</option>
              </select>
              <Button onClick={handleSearch} className="h-12">Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingInitial ? (
        <Card className="border-blue-200">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchUsers(1, true)}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {users.length === 0 ? (
            <Card className="border-blue-200">
              <CardContent className="py-12 text-center">
                {searchQuery || filterRole !== "all" ? (
                  <div>
                    <p className="text-gray-600 mb-4">No users found.</p>
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
                  <p className="text-gray-600">No users in the system.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={`transition-opacity duration-300 ${isFetchingPage ? 'opacity-50' : 'opacity-100'}`}>
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Accounts ({users.length} of {totalUsers})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user: User) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).replace(/_/g, " ") : "Unknown"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Joined: {new Date(user.joinDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewProfile(user)} className="text-blue-600 hover:bg-blue-50">View Profile</Button>
                          {user.role && (
                            <Button variant="outline" size="sm" onClick={() => handleDeactivateUser(user)} className="text-red-600 hover:bg-red-50">
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="flex items-center justify-end space-x-2 py-4 px-6 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(currentPage - 1)}
                    disabled={currentPage <= 1 || isFetchingPage}
                    className="text-gray-700"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">Page {currentPage} of {Math.ceil(totalUsers / pageSize)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(currentPage + 1)}
                    disabled={(currentPage * pageSize) >= totalUsers || isFetchingPage}
                    className="text-gray-700"
                  >
                    Next
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {showConfirmDialog && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader><CardTitle className="text-red-600">Confirm Deactivation</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">Are you sure you want to deactivate user <strong>{selectedUser.name}</strong>?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDeactivation}>Yes, Deactivate</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            <CardHeader className="border-b bg-blue-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-blue-900">{selectedUser.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1).replace(/_/g, " ") : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowProfileModal(false)}><X className="h-4 w-4" /></Button>
                              </div>            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" />Personal Information</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <div><span className="text-sm text-gray-600">Email</span><p className="font-medium">{selectedUser.email}</p></div>
                    </div>
                    {selectedUser.phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-gray-600" /><div><span className="text-sm text-gray-600">Phone</span><p className="font-medium">{selectedUser.phone}</p></div></div>}
                    {selectedUser.faculty && <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-gray-600" /><div><span className="text-sm text-gray-600">Faculty</span><p className="font-medium">{selectedUser.faculty}</p></div></div>}
                    {selectedUser.bio && <div className="flex items-start gap-3"><BookOpen className="h-4 w-4 text-gray-600 mt-1" /><div><span className="text-sm text-gray-600">Bio</span><p className="font-medium">{selectedUser.bio}</p></div></div>}
                    {selectedUser.mentee_major && <div className="flex items-center gap-3"><Award className="h-4 w-4 text-gray-600" /><div><span className="text-sm text-gray-600">Major (Mentee)</span><p className="font-medium">{selectedUser.mentee_major}</p></div></div>}
                    {selectedUser.tutor_major && <div className="flex items-center gap-3"><Award className="h-4 w-4 text-gray-600" /><div><span className="text-sm text-gray-600">Major (Tutor)</span><p className="font-medium">{selectedUser.tutor_major}</p></div></div>}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" />{selectedUser.role === 'mentee' ? "Academic Information" : "Professional Information"}</h3>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    {selectedUser.role === 'mentee' && <>
                      {selectedUser.learning_needs && <div><span className="text-sm text-gray-600">Learning Needs</span><p className="font-medium text-gray-900">{selectedUser.learning_needs}</p></div>}
                      {selectedUser.coursesEnrolled && <div><span className="text-sm text-gray-600">Courses Enrolled</span><div className="text-lg font-bold text-blue-600">{selectedUser.coursesEnrolled.length}</div></div>}
                      {selectedUser.totalSessions !== undefined && <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-sm text-gray-600">Total Sessions</span><div className="text-lg font-bold text-gray-700">{selectedUser.totalSessions}</div></div>
                        <div><span className="text-sm text-gray-600">Completed</span><div className="text-lg font-bold text-green-600">{selectedUser.completedSessions || 0}</div></div>
                      </div>}
                    </>}
                    {selectedUser.role === 'tutor' && <>
                      {selectedUser.expertise_areas && <div><span className="text-sm text-gray-600">Expertise Areas</span><p className="font-medium text-gray-900">{selectedUser.expertise_areas}</p></div>}
                      {selectedUser.averageRating !== undefined && <div><span className="text-sm text-gray-600">Average Rating</span><div className="flex items-center gap-2 mt-1"><div className="text-2xl font-bold text-yellow-500">{selectedUser.averageRating.toFixed(1)}</div><div className="flex">{[...Array(5)].map((_, i) => (<span key={i} className={i < Math.floor(selectedUser.averageRating || 0) ? "text-yellow-400" : "text-gray-300"}>⭐</span>))}</div></div></div>}
                    </>}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-blue-600" /><span className="text-sm font-medium text-blue-900">Member Since</span></div>
                  <p className="text-blue-800">{new Date(selectedUser.joinDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowProfileModal(false)}>Close</Button>
                <Button variant="outline" onClick={() => { setShowProfileModal(false); handleDeactivateUser(selectedUser); }} className="text-red-600 hover:bg-red-50"><UserX className="h-4 w-4 mr-1" />Deactivate User</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}