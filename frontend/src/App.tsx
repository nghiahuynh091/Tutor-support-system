import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MenteeLayout } from "./components/MenteeLayout";
import { TutorLayout } from "./components/TutorLayout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MenteeHomePage } from "./pages/MenteeHomePage";
import { MenteeRegistrationPage } from "./pages/MenteeRegistrationPage";
import { MenteeSchedulePage } from "./pages/MenteeSchedulePage";
import { MenteeSessionDetailPage } from "./pages/MenteeSessionDetailPage";
import { TutorHomePage } from "./pages/TutorHomePage";
import { TutorMyClassesPage } from "./pages/TutorMyClassesPage";
import { TutorClassDetailPage } from "./pages/TutorClassDetailPage";
import { TutorRegisteringPage } from "./pages/TutorRegisteringPage";
import { TutorSchedulePage } from "./pages/TutorSchedulePage";
import { CoordinatorDashboard } from "./pages/CoordinatorDashboard";
import { FeedbackPage } from "./pages/FeedbackPage";
import { PrivateNotePage } from "./pages/PrivateNotePage";
import { ProvideAssignmentPage } from "./pages/ProvideAssignmentPage";
import { HomeworkPage } from "./pages/HomeworkPage";
import { QuizPage } from "./pages/QuizPage";
import { MenteeAssignmentsPage } from "./pages/MenteeAssignmentsPage";
import { MenteeQuizAttemptPage } from "./pages/MenteeQuizAttemptPage";
import { MySessionsPage } from "./pages/MySessionsPage";
import {
  ProgressTrackingPage,
  ProgressClassSelectionPage,
} from "./pages/ProgressTrackingPages";
import { CoordinatorProfile } from "./pages/CoordinatorProfile";
import { MenteeProfile } from "./pages/MenteeProfile";
import { TutorProfile } from "./pages/TutorProfile";
import Card from "./pages/SessionManager/Card";
import { UserManagement } from "./pages/UserManagement";
import { ViewReports } from "./pages/ViewReports";
import { SessionDetailPage } from "./pages/SessionDetailPage";
import { AdminLayout } from "./components/AdminLayout";
import { AdminRegistrationPage } from "./pages/AdminRegistrationPage";

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

        {/* Mentee Routes - with MenteeLayout */}
        <Route element={<ProtectedRoute allowedRoles={["mentee"]} />}>
          <Route element={<MenteeLayout />}>
            <Route path="/mentee/home" element={<MenteeHomePage />} />
            <Route
              path="/mentee/registration"
              element={<MenteeRegistrationPage />}
            />
            <Route path="/mentee/schedule" element={<MenteeSchedulePage />} />
            <Route
              path="/mentee/session/:classId/:sessionId"
              element={<MenteeSessionDetailPage />}
            />
            <Route path="/mentee/history" element={<MySessionsPage />} />
            <Route
              path="/mentee/sessions/feedback/:classId/:sessionId"
              element={<FeedbackPage />}
            />
            <Route
              path="/mentee/assignments"
              element={<MenteeAssignmentsPage />}
            />
            <Route
              path="/mentee/quiz/:classId/:sessionId"
              element={<MenteeQuizAttemptPage />}
            />
            <Route path="/mentee/profile" element={<MenteeProfile />} />
          </Route>
        </Route>

        {/* Tutor Routes - with TutorLayout */}
        <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
          <Route element={<TutorLayout />}>
            <Route path="/tutor/home" element={<TutorHomePage />} />
            <Route path="/tutor/my-classes" element={<TutorMyClassesPage />} />
            <Route
              path="/tutor/class/:classId"
              element={<TutorClassDetailPage />}
            />
            <Route
              path="/class/:classId/session/:sessionId"
              element={<SessionDetailPage />}
            />
            <Route
              path="/tutor/registering"
              element={<TutorRegisteringPage />}
            />
            <Route path="/tutor/schedule" element={<TutorSchedulePage />} />
            <Route path="/tutor/mark_attendance/:classId" element={<Card />} />
            <Route path="/assignment" element={<ProvideAssignmentPage />} />
            <Route path="/assignment/homework/:id" element={<HomeworkPage />} />
            <Route
              path="/assignment/quiz/:classId/:sessionId"
              element={<QuizPage />}
            />
            <Route
              path="/tutor/progress_class_selection"
              element={<ProgressClassSelectionPage />}
            />
            <Route
              path="/tutor/progress/:classId"
              element={<ProgressTrackingPage />}
            />
            <Route
              path="/mentee_progress/:id/private_note"
              element={<PrivateNotePage />}
            />
            <Route path="/tutor/profile" element={<TutorProfile />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<CoordinatorDashboard />} />
            <Route path="/admin/registrations" element={<AdminRegistrationPage />} />
            <Route path="/admin/profile" element={<CoordinatorProfile />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/reports" element={<ViewReports />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
