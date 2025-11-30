import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, Settings, LogOut } from "lucide-react";

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Registrations", path: "/admin/registrations" },
    { label: "Users", path: "/admin/users" },
    { label: "Reports", path: "/admin/reports" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 overscroll-none">
      <header
        className="bg-gray-800 text-white shadow-lg fixed top-0 left-0 right-0 z-50"
        style={{ height: "64px" }}
      >
        <div className="flex justify-between px-6" style={{ height: "64px" }}>
          <div className="flex">
            <div
              className="flex items-center space-x-3 cursor-pointer pr-8"
              onClick={() => navigate("/admin/dashboard")}
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-gray-800 font-bold text-xl">A</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Tutor Support System
              </h1>
            </div>

            <nav className="hidden md:flex">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-6 font-medium transition-colors duration-200 flex items-center ${
                    isActive(item.path)
                      ? "bg-gray-700 text-white"
                      : "text-white bg-transparent hover:bg-gray-700/50"
                  }`}
                  style={{
                    height: "64px",
                    borderRadius: "0px",
                    margin: 0,
                    padding: "0 24px",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-full hover:bg-gray-700 transition-colors flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center focus:outline-none">
                  <Avatar className="w-9 h-9 border-2 border-white cursor-pointer hover:opacity-90 transition-opacity">
                    <AvatarImage
                      src={user?.avatar}
                      alt={user?.full_name || user?.email}
                    />
                    <AvatarFallback className="bg-gray-600 text-white font-semibold">
                      {(
                        user?.full_name?.[0] ||
                        user?.email?.[0] ||
                        "?"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2 border-b">
                  <p className="font-semibold text-gray-900">
                    {user?.full_name || "Admin"}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/admin/profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="pt-[64px]">
        <Outlet />
      </main>
    </div>
  );
}
