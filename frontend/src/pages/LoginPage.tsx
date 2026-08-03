import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PATHS } from "../routes/paths";
import { useAuthStore } from "../store";
import { loginApi } from "../services/auth.service";
import { getDashboardByRole } from "../utils/roleRedirect";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginApi(email, password);
      login(result.user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      });
      // Redirection selon le rôle
      navigate(getDashboardByRole(result.user.role));
    } catch (err) {
      const message = err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Login failed. Please try again.";
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

      <Typography variant="h5" sx={{ fontWeight: 700, textAlign: "center", mb: 0.5, color: "#1a1a2e" }}>
        Welcome Back
      </Typography>

      <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", mb: 3 }}>
        Sign in to your ITSM account
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleLogin}>
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
                  <AccountCircleOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
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
          {loading ? "Signing in..." : "Login"}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}>
        <Link to={PATHS.FORGOT_PASSWORD} style={{ color: "#666", textDecoration: "none" }}>
          Forgot Password?
        </Link>
      </Typography>
    </Box>
  );
}

export default LoginPage;
