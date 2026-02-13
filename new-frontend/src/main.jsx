import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import "./index.css";
import App from "./App.jsx";
import RadarApp from "./RadarApp.jsx";
import CacheStats from "./views/CacheStats.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SnackbarProvider
      maxSnack={3} // máximo de snackbars visibles
      anchorOrigin={{
        vertical: "top", // posición en pantalla
        horizontal: "center",
      }}
      autoHideDuration={4000} // ms
    >
      <BrowserRouter>
        <Routes>
          <Route path="/cache" element={<CacheStats />} />
          <Route path="/old" element={<App />} />
          <Route path="*" element={<RadarApp />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  </StrictMode>,
);
