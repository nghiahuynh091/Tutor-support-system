import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";


export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-full bg-blue-800 text-white">
      <div className="container mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            {/* Placeholder for University Logo - Replace src with actual logo */}
            <img
              src="/university-logo.png"
              alt="University Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-bold group-hover:text-blue-200 transition-colors">
              Tutor Support System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && <RoleSwitcher />}
            {isAuthenticated ? (
              <>
                <span className="text-white text-sm">
                  Welcome, {user?.name || user?.email}
                </span>

                <Button
                  size="lg"
                  className="px-8 bg-white text-blue-800 hover:bg-blue-50"
                  onClick={() => navigate('/profile')}
                >
                  My Profile
                </Button>

                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 bg-white text-blue-800 hover:bg-blue-50 border-white"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                className="px-8 bg-white text-blue-800 hover:bg-blue-50"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}