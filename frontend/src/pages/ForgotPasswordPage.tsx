import { useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Alert from "@mui/material/Alert";
import { PATHS } from "../routes/paths";
import { forgotPasswordApi } from "../services/auth.service";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setSent(true);
    } catch {
      setSent(true); // Toujours afficher succès pour ne pas révéler si email existe
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "#1976D2", textAlign: "center", mb: 1, letterSpacing: 2 }}
      >
        ITSM
      </Typography>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, textAlign: "center", mb: 1, color: "#1a1a2e" }}
      >
        Forgot Password
      </Typography>

      <Typography
        variant="body2"
        sx={{ textAlign: "center", color: "text.secondary", mb: 4 }}
      >
        Enter your email address and we&apos;ll send you a password reset link.
      </Typography>

      {sent ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Reset link sent! Check your email inbox.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              bgcolor: "#1976D2",
              fontWeight: 600,
              fontSize: "1rem",
              borderRadius: 1.5,
              textTransform: "none",
              "&:hover": { bgcolor: "#1565C0" },
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </Box>
      )}

      <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
        <Link to={PATHS.LOGIN} style={{ color: "#666", textDecoration: "none" }}>
          Back to Login
        </Link>
      </Typography>
    </Box>
  );
}

export default ForgotPasswordPage;
