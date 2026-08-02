// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/animations.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CallProvider } from "./context/CallContext";
import { SignalRProvider } from "./context/SignalRProvider";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SignalRProvider>
          <CallProvider>
            <App />
          </CallProvider>
        </SignalRProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);