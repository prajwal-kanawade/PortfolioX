import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppearanceProvider } from './context/AppearanceContext'
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MaintenanceScreen from './components/MaintenanceScreen'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import CreatePortfolio from './pages/CreatePortfolio'
import PortfolioEditor from './pages/PortfolioEditor'
import PublicPortfolio from './pages/PublicPortfolio'
import UserProfile from './pages/UserProfile'
import AdminDashboard from './pages/AdminDashboard'
import AdminSettings from './pages/AdminSettings'
import AdminComplaints from './pages/AdminComplaints'
import Marketplace from './pages/Marketplace'
import Explore from './pages/Explore'
import Upgrade from './pages/Upgrade'
import AiPortfolioBuilder from './pages/AiPortfolioBuilder'
import ResumeBuilder from './pages/ResumeBuilder'
import ResumeEditor from './pages/ResumeEditor'
import VerifyLoginDevice from './pages/VerifyLoginDevice'
import Security from './pages/Security'
import Settings from './pages/Settings'
import Terms from './pages/Terms'
import PrivacyPolicy from './pages/PrivacyPolicy'
import './App.css'

// A handful of routes stay reachable during maintenance mode so an admin can still sign in
// and turn it back off - see components/MaintenanceScreen.jsx.
const MAINTENANCE_BYPASS_PATHS = ['/login', '/verify-login', '/forgot-password']

function AppContent() {
  const location = useLocation()
  const { isAuthenticated, isAdmin } = useAuth()
  const { maintenanceMode, loaded } = useSiteSettings()

  const showMaintenance = loaded && maintenanceMode
    && !(isAuthenticated && isAdmin)
    && !MAINTENANCE_BYPASS_PATHS.includes(location.pathname)

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        {showMaintenance ? <MaintenanceScreen /> : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/verify-login" element={<VerifyLoginDevice />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/security" element={<Security />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/portfolio/:id/edit" element={<PortfolioEditor />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/resume/:id/edit" element={<ResumeEditor />} />
            </Route>

            {/* Portfolio-creation routes - admin accounts manage the platform, not their own portfolios */}
            <Route element={<ProtectedRoute blockAdmin />}>
              <Route path="/create-portfolio" element={<CreatePortfolio />} />
              <Route path="/ai-builder" element={<AiPortfolioBuilder />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
    <ThemeProvider>
    <AppearanceProvider>
    <SiteSettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SiteSettingsProvider>
    </AppearanceProvider>
    </ThemeProvider>
    </AuthProvider>
  )
}

export default App
