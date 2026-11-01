import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import { apiClient } from "../../services/api";
import { useAuthStore } from "../../store";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
}

function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile
  const [profile, setProfile] = useState<UserProfile>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });

  // Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    language: "fr",
    timezone: "Africa/Casablanca",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const response = await apiClient.put("/users/profile", profile);
      setUser(response.data.data);
      alert("Profile updated successfully");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      await apiClient.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    try {
      await apiClient.put("/users/preferences", preferences);
      alert("Preferences updated successfully");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const userInitials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <TechnicianLayout>
      <Box sx={{ maxWidth: 900 }}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            Settings
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
            Manage your account settings and preferences
          </Typography>
        </Paper>

        {/* Profile Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 3 }}>
            <PersonIcon sx={{ color: "#2563EB", fontSize: 24 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>Profile Information</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 3, mb: 3, alignItems: "center" }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: "#2563EB", fontSize: 24, fontWeight: 600 }}>
              {userInitials}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>{profile.email}</Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", mt: 0.5 }}>
                {user?.role || "Technician"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="First Name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Last Name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              size="small"
              fullWidth
              type="email"
            />
            <TextField
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Department"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              size="small"
              fullWidth
              sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}
            />
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleProfileUpdate}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : null}
              sx={{ textTransform: "none", bgcolor: "#2563EB", "&:hover": { bgcolor: "#1E40AF" } }}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>

        {/* Password Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 3 }}>
            <LockIcon sx={{ color: "#2563EB", fontSize: 24 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>Change Password</Typography>
          </Box>

          <Box sx={{ display: "grid", gap: 2, maxWidth: 500 }}>
            <TextField
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              size="small"
              fullWidth
              helperText="Minimum 8 characters"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              size="small"
              fullWidth
            />
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handlePasswordChange}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : null}
              sx={{ textTransform: "none", bgcolor: "#2563EB", "&:hover": { bgcolor: "#1E40AF" } }}
            >
              Change Password
            </Button>
          </Box>
        </Paper>

        {/* Preferences Section */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 3 }}>
            <NotificationsIcon sx={{ color: "#2563EB", fontSize: 24 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>Preferences</Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mb: 1.5 }}>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  />
                }
                label="Email notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.pushNotifications}
                    onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                  />
                }
                label="Push notifications"
              />
            </Box>

            <Divider />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, maxWidth: 500 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  label="Language"
                >
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ar">العربية</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  label="Timezone"
                >
                  <MenuItem value="Africa/Casablanca">Africa/Casablanca</MenuItem>
                  <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handlePreferencesUpdate}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : null}
              sx={{ textTransform: "none", bgcolor: "#2563EB", "&:hover": { bgcolor: "#1E40AF" } }}
            >
              Save Preferences
            </Button>
          </Box>
        </Paper>
      </Box>
    </TechnicianLayout>
  );
}

export default SettingsPage;
