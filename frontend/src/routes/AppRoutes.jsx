import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

import Splash from "../pages/Splash";
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import Dashboard from "../pages/dashboard/Dashboard";
import FindRide from "../pages/ride/FindRide";
import OfferRide from "../pages/ride/OfferRide";
import AvailableRides from "../pages/ride/AvailableRides";
import MyVehicle from "../pages/ride/MyVehicle";
import MyTrips from "../pages/trip/MyTrips";
import Wallet from "../pages/payment/Wallet";
import Payment from "../pages/payment/Payment";
import Settings from "../pages/settings/Settings";

import RouteConfirmation from "../pages/ride/RouteConfirmation";
import TripDetails from "../pages/trip/TripDetails";
import LiveTracking from "../pages/trip/LiveTracking";
import SavedPlaces from "../pages/settings/SavedPlaces";
import HelpSupport from "../pages/settings/HelpSupport";
import RideHistory from "../pages/history/RideHistory";
import ProfileCreation from "../pages/onboarding/ProfileCreation";

// Admin
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageEmployees from "../pages/admin/ManageEmployees";
import ManageVehicles from "../pages/admin/ManageVehicles";
import OrgSettings from "../pages/admin/OrgSettings";

import ReportsDashboard from "../pages/reports/ReportsDashboard";

function SplashRoute() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Splash
      onComplete={() =>
        navigate(
          isAuthenticated ? "/dashboard" : "/landing",
          { replace: true }
        )
      }
    />
  );
}

function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route path="/" element={<SplashRoute />} />

      <Route path="/landing" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      {/* ADMIN LOGIN */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* =========================
          CORE RIDER JOURNEY
      ========================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rides/find"
        element={
          <ProtectedRoute>
            <FindRide />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rides/available"
        element={
          <ProtectedRoute>
            <AvailableRides />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rides/offer"
        element={
          <ProtectedRoute>
            <OfferRide />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicle"
        element={
          <ProtectedRoute>
            <MyVehicle />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <MyTrips />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips/:id/pay"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />


      {/* =========================
          TRIP / RIDE DETAILS
      ========================== */}

      <Route
        path="/rides/route-confirmation"
        element={
          <ProtectedRoute>
            <RouteConfirmation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips/:id"
        element={
          <ProtectedRoute>
            <TripDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trips/:id/live"
        element={
          <ProtectedRoute>
            <LiveTracking />
          </ProtectedRoute>
        }
      />


      {/* =========================
          SETTINGS
      ========================== */}

      <Route
        path="/settings/saved-places"
        element={
          <ProtectedRoute>
            <SavedPlaces />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/help"
        element={
          <ProtectedRoute>
            <HelpSupport />
          </ProtectedRoute>
        }
      />


      {/* =========================
          HISTORY / ONBOARDING
      ========================== */}

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <RideHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <ProfileCreation />
          </ProtectedRoute>
        }
      />


      {/* =========================
          ADMIN PANEL
      ========================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute adminOnly>
            <ManageEmployees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/vehicles"
        element={
          <ProtectedRoute adminOnly>
            <ManageVehicles />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute adminOnly>
            <OrgSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute adminOnly>
            <ReportsDashboard />
          </ProtectedRoute>
        }
      />


      {/* =========================
          FALLBACK
      ========================== */}

      <Route
        path="*"
        element={<Navigate to="/landing" replace />}
      />

    </Routes>
  );
}

export default AppRoutes;