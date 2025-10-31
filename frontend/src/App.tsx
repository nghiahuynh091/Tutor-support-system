import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MenteeSessions } from "./pages/MenteeSessions";
import { TutorSessions } from "./pages/TutorSessions";
import { CoordinatorDashboard } from "./pages/CoordinatorDashboard";
import { MyProfile } from "./pages/MyProfile";
import { FeedbackPage } from "./pages/FeedbackPage";
import { MenteeProgressPage } from "./pages/MenteeProgressPage";
import { PrivateNotePage } from "./pages/PrivateNotePage";
import { ProvideAssignmentPage } from "./pages/ProvideAssignmentPage";
import { HomeworkPage } from "./pages/HomeworkPage";
import { QuizPage } from "./pages/QuizPage";
import { MenteeAssignmentsPage } from "./pages/MenteeAssignmentsPage";
import { MenteeQuizAttemptPage } from "./pages/MenteeQuizAttemptPage";
import { MySessionsPage } from "@/pages/MySessionsPage";
import { ProgressTrackingPage } from "./pages/ProgressTrackingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sessions" element={<MenteeSessions />} />
        <Route path="/tutor/sessions" element={<TutorSessions />} />
        <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/my_sessions/feedback/:id" element={<FeedbackPage />} />
        <Route path="/mentee_progress/:id" element={<MenteeProgressPage />} />
        <Route path="/mentee_progress/:id/private_note" element={<PrivateNotePage />} />
        <Route path="/assignment" element={<ProvideAssignmentPage />} />
        <Route path="/assignment/homework/:id" element={<HomeworkPage />} />
        <Route path="/assignment/quiz/:id" element={<QuizPage />} />
        <Route path="/my_sessions/assignments" element={<MenteeAssignmentsPage />} />
        <Route path="/my_sessions/quiz/:id" element={<MenteeQuizAttemptPage />} />
        <Route path="/my_sessions" element={<MySessionsPage />} />
        <Route path="/tutor/mentees_list" element={<ProgressTrackingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
