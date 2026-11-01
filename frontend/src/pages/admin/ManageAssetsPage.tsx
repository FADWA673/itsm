import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HistoryIcon from "@mui/icons-material/History";
import AdminLayout from "../../layouts/AdminLayout";
import { assetsService, type Asset, type AssetHistory } from "../../services/assets.service";

const ASSET_TYPES = ["DESKTOP", "LAPTOP", "PRINTER", "SERVER", "ROUTER", "SWITCH", "MONITOR", "PHONE", "TABLET", "OTHER"];
const ASSET_STATUSES = ["ACTIVE", "AVAILABLE", "MAINTENANCE", "RETIRED", "DAMAGED"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#ECFDF5", text: "#059669" },
  MAINTENANCE: { bg: "#FFFBEB", text: "#D97706" },
  RETIRED: { bg: "#F3F4F6", text: "#6B7280" },
  AVAILABLE: { bg: "#EFF6FF", text: "#2563EB" },
  DAMAGED: { bg: "#FEE2E2", text: "#DC2626" },
};

function ManageAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetHistory[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    serialNumber: "",
    type: "LAPTOP",
    brand: "",
    model: "",
    location: "",
    purchaseDate: "",
    warrantyExpiry: "",
    notes: "",
    status: "AVAILABLE",
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await assetsService.getAll();
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets:", error);
      alert("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.serialNumber || !formData.brand || !formData.model || !formData.location || !formData.purchaseDate) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await assetsService.create({
        serialNumber: formData.serialNumber,
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        location: formData.location,
        purchaseDate: formData.purchaseDate,
        warrantyExpiry: formData.warrantyExpiry || undefined,
        notes: formData.notes || undefined,
      });
      alert("Asset created successfully");
      setCreateDialogOpen(false);
      resetForm();
      loadAssets();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create asset");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedAsset) return;

    setSaving(true);
    try {
      await assetsService.update(selectedAsset.id, {
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        location: formData.location,
        status: formData.status,
        purchaseDate: formData.purchaseDate,
        warrantyExpiry: formData.warrantyExpiry || undefined,
        notes: formData.notes || undefined,
      });
      alert("Asset updated successfully");
      setEditDialogOpen(false);
      setSelectedAsset(null);
      resetForm();
      loadAssets();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update asset");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      await assetsService.delete(id);
      alert("Asset deleted successfully");
      loadAssets();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete asset");
    }
  };

  const handleRetire = async (id: string) => {
    if (!confirm("Are you sure you want to retire this asset?")) return;

    try {
      await assetsService.retire(id, "Asset retired by admin");
      alert("Asset retired successfully");
      loadAssets();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to retire asset");
    }
  };

  const handleViewHistory = async (asset: Asset) => {
    try {
      const history = await assetsService.getHistory(asset.id);
      setAssetHistory(history);
      setSelectedAsset(asset);
      setHistoryDialogOpen(true);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to load history");
    }
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      serialNumber: asset.serialNumber,
      type: asset.type,
      brand: asset.brand,
      model: asset.model,
      location: asset.location,
      purchaseDate: asset.purchaseDate.split("T")[0],
      warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split("T")[0] : "",
      notes: asset.notes || "",
      status: asset.status,
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      serialNumber: "",
      type: "LAPTOP",
      brand: "",
      model: "",
      location: "",
      purchaseDate: "",
      warrantyExpiry: "",
      notes: "",
      status: "AVAILABLE",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              Manage IT Assets
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Add, edit, and manage all IT equipment
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setCreateDialogOpen(true);
            }}
            sx={{ textTransform: "none", bgcolor: "#2563EB", "&:hover": { bgcolor: "#1E40AF" } }}
          >
            Add Asset
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>SERIAL #</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>TYPE</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>BRAND / MODEL</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>ASSIGNED TO</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>LOCATION</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280", textAlign: "center" }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#9CA3AF" }}>No assets found. Click "Add Asset" to create one.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#2563EB" }}>
                      {asset.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>{asset.type}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>
                      {asset.brand} {asset.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={asset.status}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[asset.status]?.bg,
                        color: STATUS_COLORS[asset.status]?.text,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>
                      {asset.assignedToName || <span style={{ color: "#9CA3AF" }}>Unassigned</span>}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#6B7280" }}>{asset.location}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      <IconButton size="small" onClick={() => openEditDialog(asset)} title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleViewHistory(asset)} title="History">
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                      {asset.status !== "RETIRED" && (
                        <IconButton
                          size="small"
                          onClick={() => handleRetire(asset.id)}
                          title="Retire"
                          sx={{ color: "#D97706" }}
                        >
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleDelete(asset.id)} title="Delete" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Asset</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Serial Number *"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              size="small"
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Type *</InputLabel>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} label="Type *">
                {ASSET_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Brand *"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Model *"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Location *"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Purchase Date *"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Warranty Expiry"
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              size="small"
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Asset</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField label="Serial Number" value={formData.serialNumber} size="small" fullWidth disabled />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} label="Type">
                {ASSET_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} label="Status">
                {ASSET_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              size="small"
              fullWidth
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Warranty Expiry"
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              size="small"
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Asset History - {selectedAsset?.serialNumber}</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Old Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>New Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Performed By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assetHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No history available
                  </TableCell>
                </TableRow>
              ) : (
                assetHistory.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{new Date(h.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={h.action} size="small" />
                    </TableCell>
                    <TableCell>{h.oldValue || "-"}</TableCell>
                    <TableCell>{h.newValue || "-"}</TableCell>
                    <TableCell>{h.performedBy}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default ManageAssetsPage;
