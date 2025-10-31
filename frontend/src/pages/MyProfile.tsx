import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import UserProfile from "@/components/UserProfile"; // Assuming you have this component

export function MyProfile() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          My Profile
        </h2>
        <UserProfile
          name="Jane Doe"
          email="jane.doe@example.com"
          ID="2559091"
          avatarUrl="https://i.pravatar.cc/150?img=47"
          bio="Frontend developer passionate about UI/UX and accessibility."
          location="Ho Chi Minh City, Vietnam"
        />
      </div>
      <Footer />
    </div>
  );
}
