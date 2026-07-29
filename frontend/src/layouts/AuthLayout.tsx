import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import authIllustration from "../assets/auth-illustration.png";

/**
 * Layout pour les pages d'authentification.
 * Structure : illustration pleine page + carte formulaire flottante à droite
 */
function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        position: "relative",
        background: "linear-gradient(135deg, #f0f8ff 0%, #e0f0fa 40%, #c8e6f5 100%)",
        overflow: "hidden",
        px: { xs: 2, md: 8 },
      }}
    >
      {/* ── Illustration — occupe tout l'espace gauche ─────────────────── */}
      <Box
        component="img"
        src={authIllustration}
        alt="ITSM Platform"
        sx={{
          position: "absolute",
          left: { xs: "-10%", md: "0%" },
          top: "50%",
          transform: "translateY(-50%)",
          width: { xs: "90%", md: "65%" },
          maxWidth: 720,
          objectFit: "contain",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Cercles décoratifs */}
      <Box sx={{ position: "absolute", top: 40, left: 40, width: 90, height: 90, borderRadius: "50%", border: "3px solid rgba(33,150,243,0.15)", zIndex: 0 }} />
      <Box sx={{ position: "absolute", bottom: 60, left: 120, width: 50, height: 50, borderRadius: "50%", bgcolor: "rgba(33,150,243,0.1)", zIndex: 0 }} />
      <Box sx={{ position: "absolute", top: 100, left: "30%", width: 20, height: 20, borderRadius: "50%", bgcolor: "rgba(33,150,243,0.15)", zIndex: 0 }} />

      {/* ── Carte formulaire flottante ────────────────────────────────── */}
      <Paper
        elevation={8}
        sx={{
          position: "relative",
          zIndex: 1,
          width: { xs: "100%", sm: 380 },
          maxWidth: 400,
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          bgcolor: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(33,150,243,0.1)",
          mr: { xs: 0, md: 2 },
        }}
      >
        <Outlet />
      </Paper>
    </Box>
  );
}

export default AuthLayout;
