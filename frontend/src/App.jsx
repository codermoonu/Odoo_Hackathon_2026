import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { JourneyProvider } from "./context/JourneyContext";
import { SocketProvider } from "./context/SocketContext";
import AppRoutes from "./routes/AppRoutes";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <JourneyProvider>
            {/* Mounted once, alongside the router outlet: the same DOM node
                drives from the splash screen straight into its resting spot
                on the landing page, so it never unmounts mid-journey. */}
            {/* <CarRig /> */}
            <AppRoutes />
          </JourneyProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
