import { useState } from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

const DRAWER_WIDTH = 240;

/**
 * Layout principal de l'application ITSM.
 * Structure : Header (fixe en haut) + Sidebar (gauche) + Contenu (droite)
 *
 * Responsive :
 * - Desktop (md+) : sidebar permanente, header décalé
 * - Mobile : sidebar en drawer temporaire avec overlay
 *
 * Usage dans AppRouter :
 *   <Route element={<MainLayout />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 */
function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Header fixe */}
      <Header onMenuToggle={handleMenuToggle} drawerWidth={DRAWER_WIDTH} />

      {/* Sidebar */}
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Zone de contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        {/* Espace pour le header fixe */}
        <Toolbar />

        {/* Contenu de la page courante */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;
