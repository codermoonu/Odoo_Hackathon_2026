import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { JourneyProvider } from "./context/JourneyContext";
import { AdminProvider } from "./pages/admin/AdminContext";

import AppRoutes from "./routes/AppRoutes";
// import CarRig from "./components/CarRig";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JourneyProvider>
          <AdminProvider>
            {/* Mounted once, alongside the router outlet */}
            {/* <CarRig /> */}

            <AppRoutes />
          </AdminProvider>
        </JourneyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;