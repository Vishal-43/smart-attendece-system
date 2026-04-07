import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { Loading } from './components/Common'

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'))
const UsersPage = lazy(() => import('./pages/Management/UsersPage'))
const DivisionsPage = lazy(() => import('./pages/Management/DivisionsPage'))
const TimetablesPage = lazy(() => import('./pages/Management/TimetablesPage'))
const LocationsPage = lazy(() => import('./pages/Management/LocationsPage'))
const AccessPointsPage = lazy(() => import('./pages/Management/AccessPointsPage'))
const CoursesPage = lazy(() => import('./pages/Management/CoursesPage'))
const SubjectsPage = lazy(() => import('./pages/Management/SubjectsPage'))
const BranchesPage = lazy(() => import('./pages/Management/BranchesPage'))
const BatchesPage = lazy(() => import('./pages/Management/BatchesPage'))
const EnrollmentsPage = lazy(() => import('./pages/Management/EnrollmentsPage'))
const QrOtpManagement = lazy(() => import('./pages/Management/QrOtpManagement'))
const AttendanceReportsPage = lazy(() => import('./pages/Reports/AttendanceReportsPage'))
const StudentReportPage = lazy(() => import('./pages/Reports/StudentReportPage'))
const ClassReportPage = lazy(() => import('./pages/Reports/ClassReportPage'))
const AnalyticsPage = lazy(() => import('./pages/Reports/AnalyticsPage'))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/Settings/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const GlassUIShowcase = lazy(() => import('./pages/GlassUIShowcase'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

function PageLoader() {
  return <Loading fullScreen />
}

function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) {
    return <Loading fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return <Layout />
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/showcase" element={<GlassUIShowcase />} />

            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<DashboardPage />} />
              
              <Route path="/management/users" element={<UsersPage />} />
              <Route path="/management/divisions" element={<DivisionsPage />} />
              <Route path="/management/timetables" element={<TimetablesPage />} />
              <Route path="/management/locations" element={<LocationsPage />} />
              <Route path="/management/access-points" element={<AccessPointsPage />} />
              <Route path="/management/courses" element={<CoursesPage />} />
              <Route path="/management/subjects" element={<SubjectsPage />} />
              <Route path="/management/branches" element={<BranchesPage />} />
              <Route path="/management/batches" element={<BatchesPage />} />
              <Route path="/management/enrollments" element={<EnrollmentsPage />} />
              <Route path="/management/qr-otp" element={<QrOtpManagement />} />

              <Route path="/reports/attendance" element={<AttendanceReportsPage />} />
              <Route path="/reports/student/:id" element={<StudentReportPage />} />
              <Route path="/reports/class/:id" element={<ClassReportPage />} />
              <Route path="/reports/analytics" element={<AnalyticsPage />} />

              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
