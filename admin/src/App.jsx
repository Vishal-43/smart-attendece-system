import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'

// Dashboard
import DashboardPage from './pages/Dashboard/DashboardPage'

// Management pages
import UsersPage from './pages/Management/UsersPage'
import DivisionsPage from './pages/Management/DivisionsPage'
import TimetablesPage from './pages/Management/TimetablesPage'
import LocationsPage from './pages/Management/LocationsPage'
import AccessPointsPage from './pages/Management/AccessPointsPage'
import CoursesPage from './pages/Management/CoursesPage'
import BranchesPage from './pages/Management/BranchesPage'
import BatchesPage from './pages/Management/BatchesPage'
import EnrollmentsPage from './pages/Management/EnrollmentsPage'

// Reports
import AttendanceReportsPage from './pages/Reports/AttendanceReportsPage'
import StudentReportPage from './pages/Reports/StudentReportPage'
import ClassReportPage from './pages/Reports/ClassReportPage'
import AnalyticsPage from './pages/Reports/AnalyticsPage'

// Settings
import SettingsPage from './pages/Settings/SettingsPage'
import ProfilePage from './pages/Settings/ProfilePage'

// 404
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route
          element={
            isAuthenticated ? (
              <Layout />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        >
          <Route path="/" element={<DashboardPage />} />
          
          {/* Management Routes */}
          <Route path="/management/users" element={<UsersPage />} />
          <Route path="/management/divisions" element={<DivisionsPage />} />
          <Route path="/management/timetables" element={<TimetablesPage />} />
          <Route path="/management/locations" element={<LocationsPage />} />
          <Route path="/management/access-points" element={<AccessPointsPage />} />
          <Route path="/management/courses" element={<CoursesPage />} />
          <Route path="/management/branches" element={<BranchesPage />} />
          <Route path="/management/batches" element={<BatchesPage />} />
          <Route path="/management/enrollments" element={<EnrollmentsPage />} />

          {/* Reports Routes */}
          <Route path="/reports/attendance" element={<AttendanceReportsPage />} />
          <Route path="/reports/student/:id" element={<StudentReportPage />} />
          <Route path="/reports/class/:id" element={<ClassReportPage />} />
          <Route path="/reports/analytics" element={<AnalyticsPage />} />

          {/* Settings Routes */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
