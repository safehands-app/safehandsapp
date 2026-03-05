import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthLayout } from './components/AuthLayout'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { FamilyLayout } from './components/FamilyLayout'
import { FamilyDashboard } from './pages/FamilyDashboard'
import { FamilyJobTracker } from './pages/FamilyJobTracker'
import { SuperAdminTenants } from './pages/SuperAdminTenants'
import { SuperAdminGlobalUsers } from './pages/SuperAdminGlobalUsers'
import { SuperAdminLayout } from './components/SuperAdminLayout'
import { SuperAdminDashboard } from './pages/SuperAdminDashboard'
import { TenantAdminLayout } from './components/TenantAdminLayout'
import { TenantAdminDashboard } from './pages/TenantAdminDashboard'
import { TenantAdminFamilies } from './pages/TenantAdminFamilies'
import { TenantAdminExecutives } from './pages/TenantAdminExecutives'
import { FieldExecutiveLayout } from './components/FieldExecutiveLayout'
import { FieldExecutiveDashboard } from './pages/FieldExecutiveDashboard'
import { FieldExecutiveSchedule } from './pages/FieldExecutiveSchedule'
import { FieldExecutivePatientContext } from './pages/FieldExecutivePatientContext'
import { FieldExecutiveServiceReport } from './pages/FieldExecutiveServiceReport'
import { FieldExecutiveJobDetail } from './pages/FieldExecutiveJobDetail'
import { VendorLayout } from './components/VendorLayout'
import { VendorDashboard } from './pages/VendorDashboard'
import { VendorTickets } from './pages/VendorTickets'
import { VendorAssets } from './pages/VendorAssets'
import { VendorFinancials } from './pages/VendorFinancials'
import { SupervisorLayout } from './components/SupervisorLayout'
import { SupervisorDashboard } from './pages/SupervisorDashboard'
import { SupervisorJobQueue } from './pages/SupervisorJobQueue'
import { SupervisorReviewJob } from './pages/SupervisorReviewJob'
import { SupervisorExecManagement } from './pages/SupervisorExecManagement'
import { GenericSubPage } from './pages/GenericSubPage'
import { InstallPrompt } from './components/InstallPrompt'
import { LandingPage } from './pages/LandingPage'

// Component to handle root redirect based on authentication
function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Verifying session...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Route based on role
  switch (user.role) {
    case 'super-admin': return <Navigate to="/super-admin" replace />;
    case 'tenant-admin': return <Navigate to="/tenant-admin" replace />;
    case 'family': return <Navigate to="/family" replace />;
    case 'field-executive': return <Navigate to="/field-exec" replace />;
    case 'vendor': return <Navigate to="/vendor" replace />;
    case 'supervisor': return <Navigate to="/supervisor" replace />;
    default: return <Navigate to="/auth/login" replace />;
  }
}

// Use window.electron (set by preload) as the reliable Electron detection.
// navigator.userAgent check fails in some packaged builds.
const isElectron = typeof window !== 'undefined' && !!(window as any).electron;
const Router = isElectron ? HashRouter : BrowserRouter;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard redirect handles where logged-in users go primarily */}
          <Route path="/dashboard" element={<RootRedirect />} />

          {/* Authentication Routes (Public access) */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Family Portal Routes (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={['family']} />}>
            <Route element={<FamilyLayout />}>
              <Route path="/family" element={<FamilyDashboard />} />
              <Route path="/family/jobs" element={<FamilyJobTracker />} />
              <Route path="/family/reports" element={<GenericSubPage title="Service Reports" description="View and download historical care reports." columns={['Date', 'Caregiver', 'Duration', 'Status']} />} />
              <Route path="/family/schedule" element={<GenericSubPage title="Upcoming Schedule" description="Manage your assigned nursing and maintenance visits." columns={['Date & Time', 'Service Type', 'Assigned To', 'Status']} />} />
              <Route path="/family/members" element={<GenericSubPage title="Family Members" description="Manage access and profiles for your household." columns={['Name', 'Role', 'Phone', 'Access Level']} />} />
            </Route>
          </Route>

          {/* Super Admin Routes (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={['super-admin']} />}>
            <Route element={<SuperAdminLayout />}>
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/users" element={<SuperAdminGlobalUsers />} />
              <Route path="/super-admin/tenants" element={<SuperAdminTenants />} />
              <Route path="/super-admin/financials" element={<GenericSubPage title="Financials & Billing" description="Global revenue tracking and invoice management." columns={['Invoice ID', 'Tenant', 'Amount', 'Date', 'Payment Status']} />} />
              <Route path="/super-admin/security" element={<GenericSubPage title="Security Operations" description="Global incident response and safety alerts." columns={['Incident ID', 'Location', 'Severity', 'Time Reported', 'Status']} />} />
              <Route path="/super-admin/logs" element={<GenericSubPage title="System Logs" description="Audit trails for administrative and automated actions." columns={['Timestamp', 'User/System', 'Action', 'Resource', 'Result']} />} />
              <Route path="/super-admin/settings" element={<GenericSubPage title="System Settings" description="Global app configurations, API keys, and integrations." columns={['Setting Group', 'Key', 'Last Modified', 'Modified By']} />} />
            </Route>
          </Route>

          {/* Tenant Admin Routes (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={['tenant-admin']} />}>
            <Route element={<TenantAdminLayout />}>
              <Route path="/tenant-admin" element={<TenantAdminDashboard />} />
              <Route path="/tenant-admin/families" element={<TenantAdminFamilies />} />
              <Route path="/tenant-admin/executives" element={<TenantAdminExecutives />} />
              <Route path="/tenant-admin/reports" element={<GenericSubPage title="Service Reports" description="Internal review of all submitted field service reports." columns={['Report ID', 'Family', 'Executive', 'Date', 'Quality Score']} />} />
              <Route path="/tenant-admin/settings" element={<GenericSubPage title="Portal Settings" description="Configure tenant-specific branding and preferences." columns={['Configuration', 'Value', 'Last Updated', 'Status']} />} />
            </Route>
          </Route>

          {/* Field Executive Routes (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={['field-executive']} />}>
            <Route element={<FieldExecutiveLayout />}>
              <Route path="/field-exec" element={<FieldExecutiveDashboard />} />
              <Route path="/field-exec/schedule" element={<FieldExecutiveSchedule />} />
              <Route path="/field-exec/patient/:id" element={<FieldExecutivePatientContext />} />
              <Route path="/field-exec/report/:id" element={<FieldExecutiveServiceReport />} />
              <Route path="/field-exec/job/:id" element={<FieldExecutiveJobDetail />} />
              <Route path="/field-exec/visits" element={<GenericSubPage title="Visit History" description="Log of all completed service visits and submitted reports." columns={['Visit ID', 'Client', 'Date', 'Time Spent', 'Status']} />} />
              <Route path="/field-exec/profile" element={<GenericSubPage title="My Profile" description="Manage your employee details, certifications, and availability." columns={['Certification', 'Valid Until', 'Status', 'Actions']} />} />
            </Route>
          </Route>

          {/* Vendor Routes (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route element={<VendorLayout />}>
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/vendor/tickets" element={<VendorTickets />} />
              <Route path="/vendor/assets" element={<VendorAssets />} />
              <Route path="/vendor/financials" element={<VendorFinancials />} />
              <Route path="/vendor/settings" element={<GenericSubPage title="Partner Settings" description="Manage your company profile and integration settings." columns={['Setting', 'Value', 'Status', 'Actions']} />} />
            </Route>
          </Route>

          {/* Supervisor Routes (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
            <Route element={<SupervisorLayout />}>
              <Route path="/supervisor" element={<SupervisorDashboard />} />
              <Route path="/supervisor/queue" element={<SupervisorJobQueue />} />
              <Route path="/supervisor/review" element={<SupervisorReviewJob />} />
              <Route path="/supervisor/executives" element={<SupervisorExecManagement />} />
            </Route>
          </Route>

          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <InstallPrompt />
      </Router>
    </AuthProvider>
  )
}

export default App
