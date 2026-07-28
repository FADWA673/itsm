import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import PersonOutlineIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PATHS } from "../routes/paths";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO (ITSM-008): appel API login
    setTimeout(() => {
      setLoading(false);
      navigate(PATHS.DASHBOARD);
    }, 1000);
  };

  return (
    <Box>
      {/* Logo */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#1976D2",
          textAlign: "center",
          mb: 1,
          letterSpacing: 2,
        }}
      >
        ITSM
      </Typography>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, textAlign: "center", mb: 0.5, color: "#1a1a2e" }}
      >
        Welcome Back
      </Typography>

      <Typography
        variant="body2"
        sx={{ textAlign: "center", color: "text.secondary", mb: 4 }}
      >
        Sign in to your ITSM account
      </Typography>

      <Box component="form" onSubmit={handleLogin}>
        <TextField
          fullWidth
          placeholder="User Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: "text.secondary", fontSize: 20 }} />
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

      <Typography
        variant="body2"
        sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}
      >
        <Link
          to={PATHS.FORGOT_PASSWORD}
          style={{ color: "#666", textDecoration: "none" }}
        >
          Forgot Password?
        </Link>
      </Typography>
    </Box>
  );
}

export default LoginPage;
