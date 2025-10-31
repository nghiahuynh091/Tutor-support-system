import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "@/contexts/AuthContext";

export function RoleSwitcher() {
  const { currentRole, setCurrentRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const roles: { value: UserRole; label: string }[] = [
    { value: 'mentee', label: 'Mentee' },
    { value: 'tutor', label: 'Tutor' },
    { value: 'coordinator', label: 'Coordinator' },
  ];

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    
    // Navigate to appropriate page based on role
    switch (role) {
      case 'mentee':
        navigate('/sessions');
        break;
      case 'tutor':
        navigate('/tutor/sessions');
        break;
      case 'coordinator':
        navigate('/coordinator/dashboard');
        break;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
      <span className="text-sm font-medium text-blue-900">View as:</span>
      <div className="flex gap-1">
        {roles.map((role) => (
          <Button
            key={role.value}
            size="sm"
            variant={currentRole === role.value ? "default" : "outline"}
            onClick={() => handleRoleChange(role.value)}
            className={
              currentRole === role.value
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-blue-700 hover:bg-blue-100"
            }
          >
            {role.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
