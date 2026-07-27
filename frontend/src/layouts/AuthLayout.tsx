import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/**
 * Layout pour les pages d'authentification (login, register, forgot-password).
 * Affiche une carte centrée sur fond coloré.
 *
 * Usage dans AppRouter :
 *   <Route element={<AuthLayout />}>
 *     <Route path="/login" element={<LoginPage />} />
 *   </Route>
 */
function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      {/* Logo */}
      <Typography
        variant="h4"
        color="primary"
        mb={4}
        sx={{ fontWeight: 700 }}
      >
        ITSM Platform
      </Typography>

      {/* Carte de contenu */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Outlet />
      </Paper>
    </Box>
  );
}

export default AuthLayout;
