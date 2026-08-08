import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { JourneyProvider } from "./context/JourneyContext";
import { AdminProvider } from "./pages/admin/AdminContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";

import AppRoutes from "./routes/AppRoutes";
// import CarRig from "./components/CarRig";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <JourneyProvider>
            <AdminProvider>
              {/* Mounted once, alongside the router outlet: the same DOM node
                  drives from the splash screen straight into its resting spot
                  on the landing page, so it never unmounts mid-journey. */}
              {/* <CarRig /> */}
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </AdminProvider>
          </JourneyProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;