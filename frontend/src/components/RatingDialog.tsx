import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";

interface RatingDialogProps {
  open: boolean;
  ticketNumber: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

const labels: { [key: number]: string } = {
  1: "Très insatisfait",
  2: "Insatisfait",
  3: "Neutre",
  4: "Satisfait",
  5: "Très satisfait",
};

export default function RatingDialog({ open, ticketNumber, onClose, onSubmit }: RatingDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [hover, setHover] = useState<number>(-1);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(rating, comment);
      // Réinitialiser le formulaire
      setRating(5);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setRating(5);
    setComment("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleSkip} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        Évaluez le service
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, color: "#6B7280", textAlign: "center" }}>
            Le ticket <strong>{ticketNumber}</strong> a été résolu.
            <br />
            Comment évaluez-vous le service ?
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Rating
              name="ticket-rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue || 5);
              }}
              onChangeActive={(event, newHover) => {
                setHover(newHover);
              }}
              size="large"
              sx={{ 
                fontSize: "3rem",
                "& .MuiRating-iconEmpty": {
                  color: "#E5E7EB",
                },
              }}
              emptyIcon={<StarIcon fontSize="inherit" />}
            />
            {rating !== null && (
              <Typography sx={{ mt: 1, color: "#374151", fontWeight: 500 }}>
                {labels[hover !== -1 ? hover : rating]}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Commentaire (optionnel)"
            placeholder="Dites-nous comment s'est passé le support..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F9FAFB",
              },
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleSkip} disabled={loading} sx={{ textTransform: "none" }}>
          Ignorer
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {loading ? "Envoi..." : "Envoyer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
