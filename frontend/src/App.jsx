import { Routes, Route } from "react-router-dom";
import PublicSite from "./pages/PublicSite";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./context/ProtectedRoute";

import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import PatientsDirectory from "./pages/dashboard/PatientsDirectory";
import PatientDetail from "./pages/dashboard/PatientDetail";
import QueuePage from "./pages/dashboard/QueuePage";
import BillingPage from "./pages/dashboard/BillingPage";
import BedsPage from "./pages/dashboard/BedsPage";
import StaffPage from "./pages/dashboard/StaffPage";
import AuditLogsPage from "./pages/dashboard/AuditLogsPage";
import AccountPage from "./pages/dashboard/AccountPage";

import ProfilePage from "./pages/dashboard/patient/ProfilePage";
import PrescriptionsPage from "./pages/dashboard/patient/PrescriptionsPage";
import LabReportsPage from "./pages/dashboard/patient/LabReportsPage";
import BillsPage from "./pages/dashboard/patient/BillsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />

        {/* staff-only */}
        <Route path="patients" element={<ProtectedRoute roles={["admin", "doctor", "nurse", "receptionist"]}><PatientsDirectory /></ProtectedRoute>} />
        <Route path="patients/:id" element={<ProtectedRoute roles={["admin", "doctor", "nurse", "receptionist"]}><PatientDetail /></ProtectedRoute>} />
        <Route path="queue" element={<ProtectedRoute roles={["admin", "doctor", "nurse", "receptionist"]}><QueuePage /></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute roles={["admin", "receptionist"]}><BillingPage /></ProtectedRoute>} />
        <Route path="beds" element={<ProtectedRoute roles={["admin", "nurse", "receptionist", "doctor"]}><BedsPage /></ProtectedRoute>} />
        <Route path="staff" element={<ProtectedRoute roles={["admin"]}><StaffPage /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute roles={["admin"]}><AuditLogsPage /></ProtectedRoute>} />

        {/* patient-only */}
        <Route path="profile" element={<ProtectedRoute roles={["patient"]}><ProfilePage /></ProtectedRoute>} />
        <Route path="prescriptions" element={<ProtectedRoute roles={["patient"]}><PrescriptionsPage /></ProtectedRoute>} />
        <Route path="lab-reports" element={<ProtectedRoute roles={["patient"]}><LabReportsPage /></ProtectedRoute>} />
        <Route path="bills" element={<ProtectedRoute roles={["patient"]}><BillsPage /></ProtectedRoute>} />

        {/* everyone */}
        <Route path="account" element={<AccountPage />} />
      </Route>

      <Route path="*" element={<PublicSite />} />
    </Routes>
  );
}
