import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";
import { knowledgeBaseService, type KBCategory } from "../../services/knowledgeBase.service";

function TicketCategoriesPage() {
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category: KBCategory | null;
  }>({ open: false, mode: "create", category: null });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await knowledgeBaseService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({ name: "", description: "", icon: "" });
    setDialog({ open: true, mode: "create", category: null });
  };

  const handleOpenEdit = (category: KBCategory) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
    });
    setDialog({ open: true, mode: "edit", category });
  };

  const handleClose = () => {
    setDialog({ open: false, mode: "create", category: null });
    setFormData({ name: "", description: "", icon: "" });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      if (dialog.mode === "create") {
        await knowledgeBaseService.createCategory({
          name: formData.name,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
        });
        alert("Category created successfully");
      } else if (dialog.category) {
        await knowledgeBaseService.updateCategory(dialog.category.id, {
          name: formData.name,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
        });
        alert("Category updated successfully");
      }
      handleClose();
      loadCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await knowledgeBaseService.deleteCategory(id);
      alert("Category deleted successfully");
      loadCategories();
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete category. Make sure no tickets or articles are using it."
      );
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Categories">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Categories">
      <Box>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>
              📂 Categories
            </Typography>
            <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
              Manage categories for tickets and knowledge base articles
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: ADMIN_COLORS.primary,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            Add Category
          </Button>
        </Box>

        {/* Stats */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#EFF6FF", border: "1px solid #DBEAFE" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1E40AF" }}>
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </Typography>
        </Paper>

        {/* Categories Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
          {categories.map((cat) => (
            <Paper
              key={cat.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${ADMIN_COLORS.border}`,
                bgcolor: ADMIN_COLORS.cardBg,
                transition: "all 0.2s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                <Typography sx={{ fontSize: 28 }}>{cat.icon || "📁"}</Typography>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenEdit(cat)} title="Edit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    sx={{ color: "#DC2626" }}
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 0.5 }}>
                {cat.name}
              </Typography>
              <Typography sx={{ fontSize: 11, color: ADMIN_COLORS.textSecondary, mb: 1.5, minHeight: 32 }}>
                {cat.description || "No description"}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary }}>
                  📚 {cat._count?.articles || 0} articles
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Create/Edit Dialog */}
        <Dialog open={dialog.open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialog.mode === "create" ? "➕ Create Category" : "✏️ Edit Category"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Network Issues"
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
              />
              <TextField
                fullWidth
                label="Icon (Emoji)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., 🌐 or 🔧"
                helperText="Use a single emoji character"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {dialog.mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default TicketCategoriesPage;
