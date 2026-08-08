import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. User is not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/login"}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // 2. Admin-only route
  if (adminOnly) {
    // Logged-in user is not an admin
    if (user?.role !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 3. Access granted
  return children;
}

export default ProtectedRoute;