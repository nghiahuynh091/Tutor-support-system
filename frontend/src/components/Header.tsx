import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();
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
          <Button 
            size="lg" 
            className="px-8 bg-white text-blue-800 hover:bg-blue-50"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}