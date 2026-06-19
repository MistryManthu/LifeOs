import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage, RegisterPage } from './pages/Auth'
import { OnboardingPage } from './pages/Onboarding'
import { DashboardPage } from './pages/Dashboard'
import { CheckinPage } from './pages/Checkin'
import { GoalsPage } from './pages/Goals'
import { GuardianPage } from './pages/Guardian'
import { MemoryPage } from './pages/Memory'
import { Spinner } from './components/ui'

// Route guard — redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

// Placeholder for pages still to be built
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="text-4xl mb-3">🚧</div>
    <h2 className="text-text-primary font-semibold">{title}</h2>
    <p className="text-text-muted text-sm mt-1">Coming in Sprint 2</p>
  </div>
)

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Onboarding — protected but no sidebar */}
      <Route path="/onboarding" element={
        <ProtectedRoute><OnboardingPage /></ProtectedRoute>
      } />

      {/* Main app — protected with sidebar layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route index             element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"  element={<DashboardPage />} />
              <Route path="checkin"    element={<CheckinPage />} />
              <Route path="goals"      element={<GoalsPage />} />
              <Route path="guardian"   element={<GuardianPage />} />
              <Route path="memories"   element={<MemoryPage />} />
              <Route path="timeline"   element={<ComingSoon title="Life Timeline" />} />
              <Route path="review"     element={<ComingSoon title="Weekly Review" />} />
              <Route path="blueprint"  element={<ComingSoon title="My Blueprint" />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
