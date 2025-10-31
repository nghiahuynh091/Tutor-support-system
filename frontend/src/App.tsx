import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MenteeSessions } from "./pages/MenteeSessions";
import { TutorSessions } from "./pages/TutorSessions";
import { CoordinatorDashboard } from "./pages/CoordinatorDashboard";
import { CoordinatorProfile } from "./pages/CoordinatorProfile";
import { MenteeProfile } from "./pages/MenteeProfile";
import { TutorProfile } from "./pages/TutorProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sessions" element={<MenteeSessions />} />
        <Route path="/tutor/sessions" element={<TutorSessions />} />
        <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
        <Route path="/coordinator/profile" element={<CoordinatorProfile />} />
        <Route path="/mentee/profile" element={<MenteeProfile />} />
        <Route path="/tutor/profile" element={<TutorProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
