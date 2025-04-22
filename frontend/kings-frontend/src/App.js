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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
