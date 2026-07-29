import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { PATHS } from "../routes/paths";
import { resetPasswordApi } from "../services/auth.service";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi(token, newPassword);
      navigate(PATHS.LOGIN);
    } catch (err) {
      const message = err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Reset failed. Please try again.";
      setError(message);
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
        sx={{ fontWeight: 700, textAlign: "center", mb: 4, color: "#1a1a2e" }}
      >
        Reset Password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
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
          {loading ? "Resetting..." : "Reset"}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
        <Link to={PATHS.LOGIN} style={{ color: "#666", textDecoration: "none" }}>
          Back to Login
        </Link>
      </Typography>
    </Box>
  );
}

export default ResetPasswordPage;
