import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import UserProfile from "@/components/UserProfile"; // Assuming you have this component

export function TutorProfile() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          My Profile
        </h2>
        <UserProfile
          name="Cjarles Smith"
          email="asdf.fff@example.com"
          ID="2551100"
          avatarUrl="https://i.pravatar.cc/150?img=47"
          location="Ho Chi Minh City, Vietnam"
          role="tutor"
          Faculty="Chemistry"
        />
      </div>
      <Footer />
    </div>
  );
}
