import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { JourneyProvider } from "./context/JourneyContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JourneyProvider>
          <AppRoutes />
        </JourneyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
