import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import authIllustration from "../assets/auth-illustration.png";

/**
 * Layout pour les pages d'authentification.
 * Structure : illustration à gauche + formulaire à droite
 */
function AuthLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#ffffff" }}>
      {/* ── Côté gauche — Illustration ───────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          background: "linear-gradient(135deg, #e8f4fd 0%, #d0eaf8 50%, #b8dff5 100%)",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cercles décoratifs */}
        <Box sx={{ position: "absolute", top: 40, left: 40, width: 80, height: 80, borderRadius: "50%", border: "3px solid rgba(33,150,243,0.2)" }} />
        <Box sx={{ position: "absolute", bottom: 80, left: 80, width: 40, height: 40, borderRadius: "50%", bgcolor: "rgba(33,150,243,0.15)" }} />
        <Box sx={{ position: "absolute", top: 120, right: 60, width: 25, height: 25, borderRadius: "50%", bgcolor: "rgba(33,150,243,0.2)" }} />

        {/* Image illustration */}
        <Box
          component="img"
          src={authIllustration}
          alt="ITSM Platform"
          sx={{
            width: "85%",
            maxWidth: 520,
            objectFit: "contain",
            zIndex: 1,
            filter: "drop-shadow(0 8px 24px rgba(33,150,243,0.15))",
          }}
        />
      </Box>

      {/* ── Côté droit — Formulaire ───────────────────────────────────── */}
      <Box
        sx={{
          width: { xs: "100%", md: "45%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
          bgcolor: "#ffffff",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AuthLayout;
