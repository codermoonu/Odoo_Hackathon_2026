import { BrowserRouter, Routes, Route } from "react-router-dom";

import { JourneyProvider } from "./context/JourneyContext";
import CarRig from "./components/CarRig";
import Splash from "./pages/Splash";
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <JourneyProvider>
        {/* Mounted once, above the router outlet, so it's the same DOM
            node before and after the splash -> landing navigation: the
            car never unmounts, so it never has a chance to jump or flicker. */}
        <CarRig />

        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/landing" element={<Landing />} />
        </Routes>
      </JourneyProvider>
    </BrowserRouter>
  );
}

export default App;