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

export function MenteeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Home", path: "/mentee/home" },
    { label: "Schedule", path: "/mentee/schedule" },
    { label: "Classes", path: "/mentee/registration" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 overscroll-none">
      {/* Navigation Header - Fixed position, won't move on overscroll */}
      <header
        className="bg-blue-700 text-white shadow-lg fixed top-0 left-0 right-0 z-50"
        style={{ height: "64px" }}
      >
        {/* Main Header Bar */}
        <div className="flex justify-between px-6" style={{ height: "64px" }}>
          {/* Logo, App Name, and Navigation Links */}
          <div className="flex">
            {/* Logo and App Name */}
            <div
              className="flex items-center space-x-3 cursor-pointer pr-8"
              onClick={() => navigate("/mentee/home")}
            >
              {/* <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold text-xl">T</span>
              </div> */}
              <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
              <h1 className="text-xl font-bold tracking-tight">
                Tutor Support System
              </h1>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-6 font-medium transition-colors duration-200 flex items-center ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-white bg-transparent hover:bg-blue-600/50"
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

          {/* Right Side - Notifications and Profile */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative w-10 h-10 rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center focus:outline-none">
                  <Avatar className="w-9 h-9 border-2 border-white cursor-pointer hover:opacity-90 transition-opacity">
                    <AvatarImage
                      src={user?.avatar}
                      alt={user?.full_name || user?.email}
                    />
                    <AvatarFallback className="bg-blue-500 text-white font-semibold">
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
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/mentee/profile")}
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

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center space-x-2 pb-3 px-6">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-white text-blue-700"
                  : "text-white hover:bg-blue-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content - with top padding to account for fixed header */}
      <main className="pt-[64px]">
        <Outlet />
      </main>
    </div>
  );
}
