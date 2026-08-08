import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { JourneyProvider } from "./context/JourneyContext";
import AppRoutes from "./routes/AppRoutes";
import CarRig from "./components/CarRig";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JourneyProvider>
          {/* Mounted once, alongside the router outlet: the same DOM node
              drives from the splash screen straight into its resting spot
              on the landing page, so it never unmounts mid-journey. */}
          {/* <CarRig /> */}
          <AppRoutes />
        </JourneyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
