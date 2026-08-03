// Palette Admin — supporte mode clair et sombre
export const getAdminColors = (mode: "light" | "dark") => {
  if (mode === "dark") {
    return {
      sidebarBg: "#0F172A",
      sidebarActive: "#2563EB",
      sidebarHover: "rgba(37,99,235,0.15)",
      sidebarText: "#D1D5DB",
      sidebarTextActive: "#FFFFFF",
      headerBg: "#1E293B",
      pageBg: "#0F172A",
      cardBg: "#1E293B",
      primary: "#2563EB",
      textPrimary: "#F1F5F9",
      textSecondary: "#94A3B8",
      border: "#334155",
    };
  }
  // Mode clair — sidebar blanche, textes foncés
  return {
    sidebarBg: "#FFFFFF",
    sidebarActive: "#2563EB",
    sidebarHover: "rgba(37,99,235,0.08)",
    sidebarText: "#6B7280",
    sidebarTextActive: "#FFFFFF",
    headerBg: "#FFFFFF",
    pageBg: "#F1F5F9",
    cardBg: "#FFFFFF",
    primary: "#2563EB",
    textPrimary: "#0F172A",
    textSecondary: "#6B7280",
    border: "#E2E8F0",
  };
};

// Défaut light pour les imports statiques
export const ADMIN_COLORS = getAdminColors("light");
export const SIDEBAR_WIDTH = 260;
