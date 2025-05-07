import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ExternalDashboard from "./pages/ExternalDashboard";
import ExternalRoute from "./components/ExternalRoute";
import ShowAssets from "./pages/ShowAssets";
import AdminLayout from "./layouts/AdminLayout";
import PendingApproval from "./pages/PendingApproval";
import UpcomingMaintenance from "./pages/UpcomingMaintenance";
import AllMaintenanceLogs from "./pages/AllMaintenanceLogs";
import ProfilePage from "./pages/ProfilePage";
import AllMembers from "./pages/AllMembers";
import AssignedTask from "./pages/AssignedTask";
import OngoingMaintenance from "./pages/OngoingMaintenance";
import AllAssessment from "./pages/AllAssessment";
import StaffProfilePage from "./pages/StaffProfilePage";
import StaffAssessment from "./pages/StaffAssessment";
import StaffMaintenance from "./pages/StaffMaintenance";
import ExternalProfilePage from "./pages/ExternalProfilePage";
import AdminInvoicePage from "./pages/AdminInvoicePage";
import ResetPassword from "./pages/ResetPassword";




const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/pending-approval" element={<PendingApproval />} />
      <Route
        path="/admin/upcoming-maintenance"
        element={<UpcomingMaintenance />}
      />
      <Route path="/admin/all-maintenance" element={<AllMaintenanceLogs />} />
      <Route path="/admin/profile" element={<ProfilePage />} />
      <Route path="/admin/all-members" element={<AllMembers />} />
      <Route path="/assign-task" element={<AssignedTask />} />

      {/* ✅ Admin Dashboard route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      {/* ✅ Admin Dashboard route for Asset */}
      <Route
        path="/admin/assets"
        element={
          <AdminRoute>
            <AdminLayout>
              <ShowAssets />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* ✅ Staff Dashboard route */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      {/* ✅ External Company Dashboard route */}
      <Route
        path="/external"
        element={
          <ExternalRoute>
            <ExternalDashboard />
          </ExternalRoute>
        }
      />

      {/* ✅ AdminPanel route (pending approvals) */}
      <Route
        path="/admin/pending"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/maintenance/ongoing"
        element={
          <AdminRoute>
            <AdminLayout>
              <OngoingMaintenance />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/assessments"
        element={
          <AdminRoute>
            <AdminLayout>
              <AllAssessment />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/invoices"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminInvoicePage />
            </AdminLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/staff/profile"
        element={
          <ProtectedRoute>
            <StaffProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/assessments"
        element={
          <ProtectedRoute>
            <StaffAssessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="staff/maintenance"
        element={
          <ProtectedRoute>
            <StaffMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/external/maintenance"
        element={
          <ExternalRoute>
            <StaffMaintenance />
          </ExternalRoute>
        }
      />

      <Route
        path="/external/profile"
        element={
          <ExternalRoute>
            <ExternalProfilePage />
          </ExternalRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

    </Routes>
  );
};

export default App;
