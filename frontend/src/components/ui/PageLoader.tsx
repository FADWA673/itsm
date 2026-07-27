import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

interface PageLoaderProps {
  message?: string;
}

/**
 * Spinner de chargement centré sur toute la page.
 * Utilisé dans Suspense fallback pour le lazy loading des routes.
 */
function PageLoader({ message = "Chargement..." }: PageLoaderProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress color="primary" size={48} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default PageLoader;
