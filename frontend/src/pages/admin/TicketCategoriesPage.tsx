/**
 * Page Admin — Gestion des Catégories de Tickets
 * Permet aux admins de créer, modifier, supprimer les catégories
 */

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import AdminLayout from "../../layouts/AdminLayout";
import { useNotificationStore } from "../../store";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  formatCategoryDisplay,
  type TicketCategory,
} from "../../services/ticketCategories.service";

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  displayOrder: number;
}

const DEFAULT_FORM: CategoryFormData = {
  name: "",
  description: "",
  icon: "",
  color: "#3B82F6",
  displayOrder: 0,
};

function CategoriesPage() {
  const { addNotification } = useNotificationStore();
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TicketCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Charger les catégories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories(true); // Inclure inactives
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      addNotification("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Ouvrir dialog pour créer
  const handleCreate = () => {
    setEditingCategory(null);
    setFormData(DEFAULT_FORM);
    setError("");
    setDialogOpen(true);
  };

  // Ouvrir dialog pour éditer
  const handleEdit = (category: TicketCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#3B82F6",
      displayOrder: category.displayOrder,
    });
    setError("");
    setDialogOpen(true);
  };

  // Sauvegarder (créer ou modifier)
  const handleSave = async () => {
    setError("");

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        // Modification
        await updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          icon: formData.icon.trim() || undefined,
          color: formData.color.trim() || undefined,
          displayOrder: formData.displayOrder,
        });
        addNotification("Category updated successfully", "success");
      } else {
        // Création
        await createCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          icon: formData.icon.trim() || undefined,
          color: formData.color.trim() || undefined,
          displayOrder: formData.displayOrder,
        });
        addNotification("Category created successfully", "success");
      }

      setDialogOpen(false);
      loadCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save category";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer une catégorie
  const handleDelete = async (category: TicketCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCategory(category.id);
      addNotification("Category deleted successfully", "success");
      loadCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete category";
      addNotification(msg, "error");
    }
  };

  // Activer/Désactiver une catégorie
  const handleToggleActive = async (category: TicketCategory) => {
    try {
      await updateCategory(category.id, { active: !category.active });
      addNotification(`Category ${category.active ? "disabled" : "enabled"} successfully`, "success");
      loadCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update category";
      addNotification(msg, "error");
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
              Ticket Categories
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Manage ticket categories for your organization
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              bgcolor: "#2563EB",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            Add Category
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: "#6B7280" }}>Loading categories...</Typography>
          </Box>
        ) : categories.length === 0 ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <CategoryIcon sx={{ fontSize: 60, color: "#D1D5DB", mb: 2 }} />
            <Typography sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>No categories found</Typography>
            <Typography sx={{ color: "#6B7280", mb: 3 }}>Get started by creating your first category</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Add Category
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Color</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151", textAlign: "center" }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151", textAlign: "center" }}>Tickets</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151", textAlign: "center" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151", textAlign: "center" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, color: "#111827" }}>
                        {formatCategoryDisplay(category)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                        {category.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: 40,
                          height: 24,
                          bgcolor: category.color || "#D1D5DB",
                          borderRadius: 1,
                          border: "1px solid #E5E7EB",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                        {category.displayOrder}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Chip
                        label={category._count?.tickets || 0}
                        size="small"
                        sx={{
                          bgcolor: "#EFF6FF",
                          color: "#2563EB",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Chip
                        label={category.active ? "Active" : "Inactive"}
                        size="small"
                        onClick={() => handleToggleActive(category)}
                        sx={{
                          bgcolor: category.active ? "#DEF7EC" : "#FEE2E2",
                          color: category.active ? "#03543F" : "#991B1B",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(category)}
                        sx={{ color: "#2563EB", mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(category)}
                        sx={{ color: "#DC2626" }}
                        disabled={category._count && category._count.tickets > 0}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog Créer/Éditer */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#111827" }}>
          {editingCategory ? "Edit Category" : "Create Category"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Name *"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Hardware, Software"
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this category"
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
            <TextField
              label="Icon (Emoji)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🖥️"
              inputProps={{ maxLength: 2 }}
            />

            <TextField
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#374151", mb: 1 }}>
              Color
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {["#3B82F6", "#8B5CF6", "#10B981", "#EF4444", "#F59E0B", "#6B7280", "#06B6D4", "#EC4899"].map(
                (color) => (
                  <Box
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color,
                      borderRadius: 1,
                      cursor: "pointer",
                      border: formData.color === color ? "3px solid #111827" : "1px solid #E5E7EB",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  />
                )
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none", color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting}
            sx={{
              bgcolor: "#2563EB",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#1D4ED8" },
            }}
          >
            {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default CategoriesPage;
