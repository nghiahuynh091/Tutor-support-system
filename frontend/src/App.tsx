import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MenteeHomePage } from "./pages/MenteeHomePage";
import { MenteeRegistrationPage } from "./pages/MenteeRegistrationPage";
import { MenteeSchedulePage } from "./pages/MenteeSchedulePage";
import { TutorSessions } from "./pages/TutorSessions";
import { CoordinatorDashboard } from "./pages/CoordinatorDashboard";
import { FeedbackPage } from "./pages/FeedbackPage";
import { MenteeProgressPage } from "./pages/MenteeProgressPage";
import { PrivateNotePage } from "./pages/PrivateNotePage";
import { ProvideAssignmentPage } from "./pages/ProvideAssignmentPage";
import { HomeworkPage } from "./pages/HomeworkPage";
import { QuizPage } from "./pages/QuizPage";
import { MenteeAssignmentsPage } from "./pages/MenteeAssignmentsPage";
import { MenteeQuizAttemptPage } from "./pages/MenteeQuizAttemptPage";
import { MySessionsPage } from "./pages/MySessionsPage";
import { ProgressTrackingPage } from "./pages/ProgressTrackingPage";
import { CoordinatorProfile } from "./pages/CoordinatorProfile";
import { MenteeProfile } from "./pages/MenteeProfile";
import { TutorProfile } from "./pages/TutorProfile";
import Card from "./pages/SessionManager/Card";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/role-selection" element={<RoleSelectionPage />} /> */}

        {/* Mentee Routes */}
        <Route element={<ProtectedRoute allowedRoles={["mentee"]} />}>
          <Route path="/mentee/home" element={<MenteeHomePage />} />
          <Route
            path="/mentee/registration"
            element={<MenteeRegistrationPage />}
          />
          <Route path="/mentee/schedule" element={<MenteeSchedulePage />} />
          {/* <Route path="/sessions" element={<MenteeSessions />} /> */}
          <Route path="/mentee/sessions" element={<MySessionsPage />} />
          <Route
            path="/mentee/sessions/feedback/:id"
            element={<FeedbackPage />}
          />
          <Route
            path="/mentee/sessions/assignments"
            element={<MenteeAssignmentsPage />}
          />
          <Route
            path="/mentee/sessions/quiz/:id"
            element={<MenteeQuizAttemptPage />}
          />
          <Route path="/mentee/profile" element={<MenteeProfile />} />
        </Route>

        {/* Tutor Routes */}
        <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
          <Route path="/tutor/sessions" element={<TutorSessions />} />
          <Route path="/tutor/mark_attendance/:classId" element={<Card />} />
          <Route path="/assignment" element={<ProvideAssignmentPage />} />
          <Route path="/assignment/homework/:id" element={<HomeworkPage />} />
          <Route path="/assignment/quiz/:id" element={<QuizPage />} />
          <Route
            path="/tutor/mentees_list"
            element={<ProgressTrackingPage />}
          />
          <Route path="/mentee_progress/:id" element={<MenteeProgressPage />} />
          <Route
            path="/mentee_progress/:id/private_note"
            element={<PrivateNotePage />}
          />
          <Route path="/tutor/profile" element={<TutorProfile />} />
        </Route>

        {/* Coordinator Routes */}
        <Route
          element={<ProtectedRoute allowedRoles={["coordinator", "admin"]} />}
        >
          <Route
            path="/coordinator/dashboard"
            element={<CoordinatorDashboard />}
          />
          <Route path="/coordinator/profile" element={<CoordinatorProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
