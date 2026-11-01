import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useAuthStore, useNotificationStore } from "../../store";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { ROLE_LABELS } from "../../utils/roleLabels";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  type ProfileResponse,
} from "../../services/profile.service";

function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { addNotification } = useNotificationStore();

  // ─── Profile state ────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });

  // ─── Password state ───────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPwd: "",
    confirm: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // ─── Load profile on mount ────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const data = await getMyProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? "",
      });
    } catch {
      addNotification("Failed to load profile", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─── Save profile ─────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setProfileError("");
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setProfileError("First name and last name are required");
      return;
    }
    try {
      setSavingProfile(true);
      const updated = await updateMyProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
      });
      setProfile(updated);
      // Sync auth store so the name updates everywhere in the UI
      if (user) {
        setUser({ ...user, firstName: updated.firstName, lastName: updated.lastName });
      }
      setEditing(false);
      addNotification("Profile updated successfully", "success");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to update profile";
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setProfileError("");
    setForm({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      phone: profile?.phone ?? "",
    });
  };

  // ─── Change password ──────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordError("");
    if (!passwordForm.current) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordForm.newPwd.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPwd !== passwordForm.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      setSavingPassword(true);
      await changeMyPassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPwd,
      });
      setPasswordForm({ current: "", newPwd: "", confirm: "" });
      addNotification("Password changed successfully", "success");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to change password";
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user
      ? `${user.firstName} ${user.lastName}`
      : "User";

  const initials =
    profile
      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
      : user
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : "U";

  const roleLabel = user
    ? (ROLE_LABELS[user.role] ?? user.role)
    : "Employee";

  if (loadingProfile) {
    return (
      <EmployeeLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <CircularProgress />
        </Box>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
          My Profile
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
          Manage your account information and security settings.
        </Typography>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 3 }}>
        {/* ── Avatar Card ── */}
        <Box>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", textAlign: "center" }}
          >
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: "#2563EB", fontSize: 28, mx: "auto", mb: 2 }}
            >
              {initials}
            </Avatar>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.5 }}>
              {profile?.email ?? user?.email}
            </Typography>
            <Chip
              label={roleLabel}
              size="small"
              sx={{ mt: 1.5, bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: "left" }}>
              {[
                { label: "Status", value: profile?.status ?? "ACTIVE" },
                {
                  label: "Member since",
                  value: profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "—",
                },
                {
                  label: "Last login",
                  value: profile?.lastLoginAt
                    ? new Date(profile.lastLoginAt).toLocaleDateString()
                    : "—",
                },
              ].map((item) => (
                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* ── Info + Password ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Personal Info */}
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
                Personal Information
              </Typography>
              {!editing && (
                <Button
                  size="small"
                  startIcon={<EditIcon fontSize="small" />}
                  onClick={() => { setEditing(true); setProfileError(""); }}
                  sx={{ textTransform: "none", color: "#2563EB" }}
                >
                  Edit
                </Button>
              )}
            </Box>

            {profileError && (
              <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="First Name"
                size="small"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                disabled={!editing}
                fullWidth
              />
              <TextField
                label="Last Name"
                size="small"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                disabled={!editing}
                fullWidth
              />
              <TextField
                label="Email Address"
                size="small"
                value={profile?.email ?? user?.email ?? ""}
                disabled
                fullWidth
              />
              <TextField
                label="Phone Number"
                size="small"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editing}
                placeholder="+212 6XX XXX XXX"
                fullWidth
              />
              <TextField
                label="Role"
                size="small"
                value={roleLabel}
                disabled
                fullWidth
              />
              <TextField
                label="Organization"
                size="small"
                value={profile?.organizationName ?? "—"}
                disabled
                fullWidth
              />
            </Box>

            {editing && (
              <Box sx={{ display: "flex", gap: 2, mt: 2.5, justifyContent: "flex-end" }}>
                <Button
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                  sx={{ textTransform: "none", color: "#6B7280" }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  startIcon={savingProfile ? <CircularProgress size={14} color="inherit" /> : <SaveIcon fontSize="small" />}
                  sx={{ bgcolor: "#2563EB", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}
                >
                  {savingProfile ? "Saving…" : "Save Changes"}
                </Button>
              </Box>
            )}
          </Paper>

          {/* Change Password */}
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827", mb: 2.5 }}>
              Change Password
            </Typography>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Current Password"
                type="password"
                size="small"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                disabled={savingPassword}
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                size="small"
                value={passwordForm.newPwd}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPwd: e.target.value })}
                helperText="Minimum 8 characters, with uppercase, lowercase, number and special character"
                disabled={savingPassword}
                fullWidth
              />
              <TextField
                label="Confirm New Password"
                type="password"
                size="small"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                disabled={savingPassword}
                fullWidth
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2.5 }}>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={savingPassword}
                startIcon={savingPassword ? <CircularProgress size={14} color="inherit" /> : undefined}
                sx={{ bgcolor: "#2563EB", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}
              >
                {savingPassword ? "Updating…" : "Update Password"}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </EmployeeLayout>
  );
}

export default ProfilePage;
