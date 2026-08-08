import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

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
import Settings from "../pages/settings/Settings";

import RouteConfirmation from "../pages/ride/RouteConfirmation";
import TripDetails from "../pages/trip/TripDetails";
import LiveTracking from "../pages/trip/LiveTracking";
import SavedPlaces from "../pages/settings/SavedPlaces";
import HelpSupport from "../pages/settings/HelpSupport";
import RideHistory from "../pages/history/RideHistory";
import ProfileCreation from "../pages/onboarding/ProfileCreation";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageEmployees from "../pages/admin/ManageEmployees";
import ManageVehicles from "../pages/admin/ManageVehicles";
import OrgSettings from "../pages/admin/OrgSettings";
import ReportsDashboard from "../pages/reports/ReportsDashboard";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Splash />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Core rider journey */}
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
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Placeholder pages — real routes, coming-soon UI, so nothing 404s */}
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
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute>
            <ManageEmployees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/vehicles"
        element={
          <ProtectedRoute>
            <ManageVehicles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <OrgSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <ReportsDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

export default AppRoutes;
