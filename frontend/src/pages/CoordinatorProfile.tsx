import UserProfile from "@/components/UserProfile"; // Assuming you have this component
import { useAuth } from "@/contexts/AuthContext";

export function CoordinatorProfile() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-8 py-12">
        <UserProfile
          name={user?.full_name || "Admin Name"}
          email={user?.email || "admin@example.com"}
          ID={user?.id || "ADMIN_ID"}
          avatarUrl="https://i.pravatar.cc/150?img=47"
          location="Ho Chi Minh City, Vietnam"
          role="admin"
          Faculty="Administration"
        />
    </div>
  );
}
