import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import ComputerIcon from "@mui/icons-material/Computer";
import LaptopIcon from "@mui/icons-material/Laptop";
import PrintIcon from "@mui/icons-material/Print";
import RouterIcon from "@mui/icons-material/Router";
import StorageIcon from "@mui/icons-material/Storage";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import { assetsService, type Asset, type CreateAssetData } from "../../services/assets.service";
import { useAuthStore } from "../../store";

const ASSET_TYPES = ["DESKTOP", "LAPTOP", "PRINTER", "SERVER", "ROUTER", "SWITCH", "MONITOR", "PHONE", "TABLET", "OTHER"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#ECFDF5", text: "#059669" },
  MAINTENANCE: { bg: "#FFFBEB", text: "#D97706" },
  RETIRED: { bg: "#F3F4F6", text: "#6B7280" },
  AVAILABLE: { bg: "#EFF6FF", text: "#2563EB" },
  DAMAGED: { bg: "#FEE2E2", text: "#DC2626" },
};

const ASSET_ICONS: Record<string, React.ReactNode> = {
  DESKTOP: <ComputerIcon fontSize="small" />,
  LAPTOP: <LaptopIcon fontSize="small" />,
  PRINTER: <PrintIcon fontSize="small" />,
  SERVER: <StorageIcon fontSize="small" />,
  ROUTER: <RouterIcon fontSize="small" />,
  SWITCH: <RouterIcon fontSize="small" />,
  MONITOR: <ComputerIcon fontSize="small" />,
  PHONE: <InfoOutlinedIcon fontSize="small" />,
  TABLET: <InfoOutlinedIcon fontSize="small" />,
  OTHER: <InfoOutlinedIcon fontSize="small" />,
};

function AssetsPage() {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CreateAssetData>({
    serialNumber: "",
    type: "DESKTOP",
    brand: "",
    model: "",
    location: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    warrantyExpiry: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, search, typeFilter, statusFilter]);

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

  const filterAssets = () => {
    let filtered = [...assets];

    // Search
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
          a.brand.toLowerCase().includes(search.toLowerCase()) ||
          a.model.toLowerCase().includes(search.toLowerCase()) ||
          (a.assignedToName && a.assignedToName.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    setFilteredAssets(filtered);
  };

  const handleOpenDialog = () => {
    setFormData({
      serialNumber: "",
      type: "DESKTOP",
      brand: "",
      model: "",
      location: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      warrantyExpiry: "",
      notes: "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!formData.serialNumber || !formData.brand || !formData.model || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await assetsService.create(formData);
      await loadAssets();
      handleCloseDialog();
      alert("Asset created successfully!");
    } catch (error: any) {
      console.error("Failed to create asset:", error);
      alert(error.response?.data?.message || "Failed to create asset");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, asset: Asset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAsset(null);
  };

  const handleChangeStatus = async (status: string) => {
    if (!selectedAsset) return;
    try {
      await assetsService.update(selectedAsset.id, { status });
      await loadAssets();
      handleMenuClose();
      alert(`Asset status changed to ${status}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <TechnicianLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              IT Assets
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              View and search IT equipment inventory
            </Typography>
          </Box>
          {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                bgcolor: "#2563EB",
                "&:hover": { bgcolor: "#1D4ED8" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Add Asset
            </Button>
          )}
        </Box>
      </Paper>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by serial #, brand, model, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
              <MenuItem value="ALL">All Types</MenuItem>
              {ASSET_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="AVAILABLE">Available</MenuItem>
              <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              <MenuItem value="RETIRED">Retired</MenuItem>
              <MenuItem value="DAMAGED">Damaged</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setStatusFilter("ALL");
            }}
            sx={{ textTransform: "none" }}
          >
            Clear
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
          <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
            Showing {filteredAssets.length} of {assets.length} assets
          </Typography>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>TYPE</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>SERIAL NUMBER</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>BRAND / MODEL</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>ASSIGNED TO</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>LOCATION</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>PURCHASE DATE</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#9CA3AF" }}>No assets found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id} hover sx={{ "&:hover": { bgcolor: "#F9FAFB" } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Box sx={{ color: "#6B7280" }}>{ASSET_ICONS[asset.type] || ASSET_ICONS.OTHER}</Box>
                      <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{asset.type}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#2563EB" }}>
                      {asset.serialNumber}
                    </Typography>
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
                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, asset)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Asset Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Asset</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Serial Number"
              required
              fullWidth
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            />
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {ASSET_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Brand"
              required
              fullWidth
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
            <TextField
              label="Model"
              required
              fullWidth
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
            <TextField
              label="Location"
              required
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <TextField
              label="Purchase Date"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
            <TextField
              label="Warranty Expiry"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
          >
            {submitting ? "Creating..." : "Create Asset"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleChangeStatus("ACTIVE")}>Mark as Active</MenuItem>
        <MenuItem onClick={() => handleChangeStatus("AVAILABLE")}>Mark as Available</MenuItem>
        <MenuItem onClick={() => handleChangeStatus("MAINTENANCE")}>Mark as Maintenance</MenuItem>
        <MenuItem onClick={() => handleChangeStatus("DAMAGED")}>Mark as Damaged</MenuItem>
        <MenuItem onClick={() => handleChangeStatus("RETIRED")}>Mark as Retired</MenuItem>
      </Menu>
    </TechnicianLayout>
  );
}

export default AssetsPage;
