import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import authIllustration from "../assets/auth-illustration.png";

/**
 * Layout pour les pages d'authentification.
 * Fond blanc, illustration à gauche, carte formulaire flottante à droite.
 */
function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Illustration ─────────────────────────────────────────────── */}
      <Box
        component="img"
        src={authIllustration}
        alt="ITSM Platform"
        sx={{
          width: { xs: "0%", md: "58%" },
          maxWidth: 700,
          objectFit: "contain",
          alignSelf: "flex-end",
          flexShrink: 0,
        }}
      />

      {/* ── Carte formulaire ─────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, md: 4 },
          py: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 380,
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: "#ffffff",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
}

export default AuthLayout;
