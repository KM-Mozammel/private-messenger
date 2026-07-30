import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/animations.css";
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CallProvider } from './context/CallContext.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <CallProvider>
          <App />
        </CallProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)