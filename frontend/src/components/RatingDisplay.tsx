import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";

interface RatingDisplayProps {
  rating: number;
  comment: string | null;
  createdByName: string;
  createdAt: string;
}

export default function RatingDisplay({ rating, comment, createdByName, createdAt }: RatingDisplayProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", mb: 2 }}>
        ⭐ Évaluation du service
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Rating value={rating} readOnly size="large" />
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#2563EB" }}>
          {rating}/5
        </Typography>
      </Box>

      {comment && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ color: "#374151", fontSize: 14, mb: 2 }}>
            "{comment}"
          </Typography>
        </>
      )}

      <Typography sx={{ fontSize: 12, color: "#9CA3AF", mt: 2 }}>
        Évalué par {createdByName} le {new Date(createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Typography>
    </Paper>
  );
}
