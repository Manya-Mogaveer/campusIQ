import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import HomeDashboard from './pages/HomeDashboard';
import ExploreCampus from './pages/ExploreCampus';
import NavigationPage from './pages/NavigationPage';
import CampusDirectory from './pages/CampusDirectory';
import LocationDetails from './pages/LocationDetails';
import QRCheckpointsPage from './pages/QRCheckpointsPage';
import ReportIssuePage from './pages/ReportIssuePage';
import IndoorNavigationPage from './pages/IndoorNavigationPage';
import LoginPage from './pages/LoginPage';
import AuthPortalPage from './pages/AuthPortalPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageLocations from './pages/ManageLocations';
import ManageBuildings from './pages/ManageBuildings';
import ManagePathways from './pages/ManagePathways';
import ManageIncidents from './pages/ManageIncidents';
import FacilityManagement from './pages/FacilityManagement';
import AnalyticsPage from './pages/AnalyticsPage';

function ProtectedAdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Verifying admin credentials...</div>;
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Primary Entry Point: Authentication Portal first */}
        <Route path="/" element={<AuthPortalPage />} />
        <Route path="/auth" element={<AuthPortalPage />} />
        <Route path="/login" element={<AuthPortalPage />} />
        <Route path="/admin-login" element={<LoginPage />} />

        {/* Main Application with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<HomeDashboard />} />
          <Route path="/app" element={<HomeDashboard />} />
          <Route path="/explore" element={<ExploreCampus />} />
          <Route path="/navigate" element={<NavigationPage />} />
          <Route path="/directory" element={<CampusDirectory />} />
          <Route path="/locations/:id" element={<LocationDetails />} />
          <Route path="/qr" element={<QRCheckpointsPage />} />
          <Route path="/report" element={<ReportIssuePage />} />
          <Route path="/indoor" element={<IndoorNavigationPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/locations"
            element={
              <ProtectedAdminRoute>
                <ManageLocations />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/buildings"
            element={
              <ProtectedAdminRoute>
                <ManageBuildings />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/pathways"
            element={
              <ProtectedAdminRoute>
                <ManagePathways />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/incidents"
            element={
              <ProtectedAdminRoute>
                <ManageIncidents />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/facilities"
            element={
              <ProtectedAdminRoute>
                <FacilityManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedAdminRoute>
                <AnalyticsPage />
              </ProtectedAdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
