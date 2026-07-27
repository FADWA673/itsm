import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter } from "react-router-dom";
import { getTheme } from "./styles/theme";
import { useThemeStore } from "./store/useThemeStore";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import NotificationToast from "./components/layout/NotificationToast";
import App from "./App";

/**
 * Wrapper qui lit le mode depuis le store Zustand
 * et passe le thème correspondant au ThemeProvider.
 */
function ThemedApp() {
  const { mode } = useThemeStore();

  return (
    <ThemeProvider theme={getTheme(mode)}>
      {/* CssBaseline : reset CSS cross-browser cohérent avec MUI */}
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter>
          <App />
          <NotificationToast />
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default ThemedApp;
