import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import UserProfile from "@/components/UserProfile"; // Assuming you have this component

export function MenteeProfile() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          My Profile
        </h2>
        <UserProfile
          name="Kane Lee"
          email="CAD.asdf@example.com"
          ID="2550011"
          avatarUrl="https://i.pravatar.cc/150?img=47"
          location="Ho Chi Minh City, Vietnam"
          role="mentee"
            Faculty="Computer Science"
        />
      </div>
      <Footer />
    </div>
  );
}
