import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import authIllustration from "../assets/auth-illustration.png";
import { PATHS } from "../routes/paths";

function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 3, md: 6 },
          py: 2.5,
          borderBottom: "1px solid #f0f0f0",
          bgcolor: "#ffffff",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#1976D2", letterSpacing: 1 }}
        >
          ITSM
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate(PATHS.LOGIN)}
          sx={{
            bgcolor: "#1976D2",
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "#1565C0" },
          }}
        >
          Se connecter
        </Button>
      </Box>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          position: "relative",
          bgcolor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Texte gauche */}
        <Box
          sx={{
            width: { xs: "100%", md: "45%" },
            px: { xs: 4, md: 10 },
            zIndex: 1,
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: "#1a1a2e", mb: 2, lineHeight: 1.2 }}
          >
            IT Service{" "}
            <Box component="span" sx={{ color: "#1976D2" }}>
              Management
            </Box>{" "}
            Platform
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "#6b6375", mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}
          >
            Gérez vos tickets IT, suivez les incidents, assignez les techniciens
            et améliorez la productivité de votre équipe — tout en un seul endroit.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(PATHS.LOGIN)}
              sx={{
                bgcolor: "#1976D2",
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "0 4px 16px rgba(25,118,210,0.3)",
                "&:hover": { bgcolor: "#1565C0" },
              }}
            >
              Commencer →
            </Button>
          </Box>

        </Box>

        {/* Illustration droite */}
        <Box
          component="img"
          src={authIllustration}
          alt="ITSM Platform"
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            right: "-2%",
            bottom: 0,
            width: "58%",
            maxWidth: 700,
            objectFit: "contain",
          }}
        />
      </Box>

      {/* ── Features cards ──────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 3, md: 10 },
          py: 6,
          bgcolor: "#f8faff",
          borderTop: "1px solid #eef2ff",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {[
            { icon: "🎫", title: "Gestion des tickets", desc: "Créez, suivez et résolvez les incidents IT rapidement." },
            { icon: "👥", title: "Multi-rôles", desc: "Employee, Technicien, Manager, Admin — chacun son espace." },
            { icon: "🔒", title: "Sécurisé", desc: "Authentification JWT, bcrypt, rate limiting et audit logs." },
            { icon: "📊", title: "Tableaux de bord", desc: "Statistiques et rapports en temps réel par rôle." },
          ].map((feature) => (
            <Paper
              key={feature.title}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e8f0fe",
                bgcolor: "#ffffff",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(25,118,210,0.12)",
                },
              }}
            >
              <Typography variant="h4" sx={{ mb: 1 }}>
                {feature.icon}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b6375", lineHeight: 1.6 }}>
                {feature.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 2,
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
          bgcolor: "#ffffff",
        }}
      >
        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
          © 2026 ITSM Platform — Logismar. Tous droits réservés.
        </Typography>
      </Box>
    </Box>
  );
}

export default HomePage;
