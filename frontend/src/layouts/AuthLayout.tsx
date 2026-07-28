import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";

/**
 * Layout pour les pages d'authentification.
 * Structure : illustration à gauche (50%) + formulaire à droite (50%)
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
        <Box
          sx={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "3px solid rgba(33, 150, 243, 0.2)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 80,
            left: 80,
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "rgba(33, 150, 243, 0.15)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 120,
            right: 60,
            width: 25,
            height: 25,
            borderRadius: "50%",
            bgcolor: "rgba(33, 150, 243, 0.2)",
          }}
        />

        {/* Illustration SVG inline */}
        <Box sx={{ width: "80%", maxWidth: 480, zIndex: 1 }}>
          <svg viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg">
            {/* Fond cercle bleu clair */}
            <ellipse cx="280" cy="240" rx="220" ry="200" fill="#c5e3f7" opacity="0.5" />

            {/* Icônes flottantes */}
            {/* WiFi */}
            <g transform="translate(290, 60)">
              <path d="M0 20 Q20-5 40 20" stroke="#2196F3" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M-10 30 Q20-15 50 30" stroke="#2196F3" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <circle cx="20" cy="35" r="4" fill="#2196F3"/>
            </g>

            {/* Icône utilisateur */}
            <g transform="translate(355, 40)">
              <circle cx="20" cy="18" r="12" fill="#90CAF9" />
              <circle cx="20" cy="10" r="6" fill="#2196F3"/>
              <path d="M8 18 Q20 30 32 18" fill="#2196F3"/>
            </g>

            {/* Bouclier */}
            <g transform="translate(430, 180)">
              <path d="M25 5 L45 15 L45 35 Q45 50 25 58 Q5 50 5 35 L5 15 Z" fill="#1976D2" opacity="0.85"/>
              <path d="M15 32 L22 39 L38 23" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </g>

            {/* Écran / dashboard */}
            <rect x="160" y="160" width="120" height="85" rx="6" fill="white" stroke="#90CAF9" strokeWidth="2"/>
            <rect x="168" y="168" width="104" height="12" rx="3" fill="#E3F2FD"/>
            <rect x="168" y="186" width="60" height="8" rx="3" fill="#BBDEFB"/>
            <rect x="168" y="200" width="80" height="8" rx="3" fill="#90CAF9"/>
            <rect x="168" y="214" width="50" height="8" rx="3" fill="#64B5F6"/>

            {/* Document flottant */}
            <g transform="translate(90, 140)">
              <rect width="70" height="55" rx="5" fill="white" stroke="#90CAF9" strokeWidth="1.5"/>
              <rect x="8" y="10" width="54" height="5" rx="2" fill="#BBDEFB"/>
              <rect x="8" y="20" width="40" height="5" rx="2" fill="#E3F2FD"/>
              <rect x="8" y="30" width="50" height="5" rx="2" fill="#BBDEFB"/>
              <rect x="8" y="40" width="35" height="5" rx="2" fill="#E3F2FD"/>
            </g>

            {/* Personne 1 — à gauche */}
            <g transform="translate(105, 220)">
              {/* corps */}
              <rect x="15" y="35" width="30" height="50" rx="5" fill="#1565C0"/>
              {/* tête */}
              <circle cx="30" cy="24" r="16" fill="#FFCC80"/>
              {/* cheveux */}
              <ellipse cx="30" cy="12" rx="16" ry="8" fill="#5D4037"/>
              {/* bras gauche */}
              <rect x="-5" y="38" width="20" height="10" rx="5" fill="#1565C0"/>
              {/* tablette */}
              <rect x="-12" y="30" width="18" height="24" rx="3" fill="#90CAF9"/>
              {/* jambes */}
              <rect x="16" y="82" width="12" height="30" rx="4" fill="#1A237E"/>
              <rect x="32" y="82" width="12" height="30" rx="4" fill="#1A237E"/>
              {/* chaussures */}
              <ellipse cx="22" cy="113" rx="8" ry="4" fill="#212121"/>
              <ellipse cx="38" cy="113" rx="8" ry="4" fill="#212121"/>
            </g>

            {/* Personne 2 — au milieu (pointe vers écran) */}
            <g transform="translate(190, 200)">
              <rect x="15" y="40" width="28" height="55" rx="5" fill="#1976D2"/>
              <circle cx="29" cy="28" r="15" fill="#FFCC80"/>
              <ellipse cx="29" cy="16" rx="15" ry="7" fill="#3E2723"/>
              <rect x="40" y="42" width="30" height="10" rx="5" fill="#1976D2"/>
              <rect x="16" y="92" width="11" height="28" rx="4" fill="#0D47A1"/>
              <rect x="30" y="92" width="11" height="28" rx="4" fill="#0D47A1"/>
              <ellipse cx="21" cy="121" rx="8" ry="4" fill="#212121"/>
              <ellipse cx="36" cy="121" rx="8" ry="4" fill="#212121"/>
            </g>

            {/* Personne 3 — assise sur les binders */}
            <g transform="translate(330, 150)">
              {/* binders empilés */}
              <rect x="0" y="100" width="80" height="16" rx="3" fill="#1976D2"/>
              <rect x="0" y="120" width="80" height="16" rx="3" fill="#42A5F5"/>
              <rect x="0" y="140" width="80" height="16" rx="3" fill="#1976D2"/>
              <rect x="0" y="160" width="80" height="16" rx="3" fill="#42A5F5"/>
              <rect x="0" y="180" width="80" height="16" rx="3" fill="#1976D2"/>
              {/* lignes des binders */}
              <rect x="12" y="100" width="4" height="16" fill="white" opacity="0.4"/>
              <rect x="12" y="120" width="4" height="16" fill="white" opacity="0.4"/>
              <rect x="12" y="140" width="4" height="16" fill="white" opacity="0.4"/>
              <rect x="12" y="160" width="4" height="16" fill="white" opacity="0.4"/>
              <rect x="12" y="180" width="4" height="16" fill="white" opacity="0.4"/>
              {/* corps assis */}
              <rect x="15" y="50" width="28" height="52" rx="5" fill="#1565C0"/>
              {/* tête */}
              <circle cx="29" cy="38" r="16" fill="#FFCC80"/>
              <ellipse cx="29" cy="26" rx="16" ry="8" fill="#4E342E"/>
              {/* laptop */}
              <rect x="30" y="70" width="40" height="28" rx="3" fill="#E3F2FD"/>
              <rect x="32" y="72" width="36" height="22" rx="2" fill="#90CAF9"/>
              {/* jambes */}
              <rect x="16" y="98" width="12" height="18" rx="4" fill="#0D47A1" transform="rotate(20,22,98)"/>
              <rect x="30" y="98" width="12" height="18" rx="4" fill="#0D47A1"/>
            </g>

            {/* Icône vidéo */}
            <g transform="translate(130, 95)">
              <rect width="50" height="38" rx="5" fill="#42A5F5" opacity="0.8"/>
              <polygon points="18,8 18,30 38,19" fill="white"/>
            </g>

            {/* Petites icônes chat */}
            <g transform="translate(78, 200)">
              <rect width="55" height="40" rx="8" fill="white" stroke="#90CAF9" strokeWidth="1.5"/>
              <rect x="8" y="10" width="39" height="5" rx="2" fill="#BBDEFB"/>
              <rect x="8" y="20" width="28" height="5" rx="2" fill="#E3F2FD"/>
              <polygon points="10,40 20,40 10,52" fill="white" stroke="#90CAF9" strokeWidth="1.5"/>
            </g>
          </svg>
        </Box>
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
