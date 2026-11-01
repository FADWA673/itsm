import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useAuthStore, useNotificationStore } from "../../store";
import { createTicketApi } from "../../services/tickets.service";
import { attachmentsService } from "../../services/attachments.service";
import { getAllCategories, type TicketCategory, formatCategoryDisplay } from "../../services/ticketCategories.service";
import { aiService } from "../../services/ai.service";

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const IMPACTS = ["Individual", "Department", "Multiple Departments", "Entire Organization"];

function CreateTicketPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();
  void user;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ categoryId: "", subject: "", description: "", priority: "", impact: "" });
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // États pour le dialog "Créer avec IA"
  const [aiCreateDialogOpen, setAiCreateDialogOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Charger les catégories au montage du composant
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(f => f.size <= 25 * 1024 * 1024); // Max 25MB
      setSelectedFiles(prev => [...prev, ...validFiles]);
      if (files.length !== validFiles.length) {
        setError("Some files exceed 25 MB and were not added");
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Fonction pour analyser avec l'IA
  const handleAnalyzeWithAI = async () => {
    if (!aiText.trim()) {
      setAiError('Please describe your problem');
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      // Utiliser aiService qui gère automatiquement l'authentification
      const analysis = await aiService.analyzeTicketText(aiText);
      
      // Trouver la catégorie correspondante
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase() === analysis.category?.toLowerCase() ||
        cat.name.toLowerCase().includes(analysis.category?.toLowerCase() || '') ||
        (analysis.category?.toLowerCase() || '').includes(cat.name.toLowerCase())
      );

      // Remplir le formulaire avec les résultats de l'IA
      setForm({
        ...form,
        categoryId: matchingCategory?.id || form.categoryId,
        subject: analysis.suggestedTitle || aiText.substring(0, 100),
        description: analysis.description || aiText,
        priority: analysis.priority || 'Medium',
        impact: form.impact || 'Individual'
      });

      // Fermer le dialog
      setAiCreateDialogOpen(false);
      setAiText('');
      
      // Message de succès
      addNotification('✅ Form filled automatically! Please review and submit.', 'success');
    } catch (error: any) {
      console.error('Error analyzing with AI:', error);
      setAiError(error.message || 'Connection error to AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.categoryId || !form.subject || !form.description || !form.priority || !form.impact) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Créer le ticket
      const ticket = await createTicketApi({
        categoryId: form.categoryId,
        subject: form.subject,
        description: form.description,
        priority: form.priority.toUpperCase(),
        impact: form.impact.toUpperCase().replace(/ /g, "_"),
      });

      // 2. Uploader les fichiers si présents
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          try {
            await attachmentsService.upload(ticket.id, file);
          } catch (err) {
            console.error('Failed to upload file:', file.name, err);
          }
        }
        setUploadingFiles(false);
      }

      addNotification("Ticket submitted successfully!", "success");
      navigate(`/employee/tickets/${ticket.id}`);
    } catch (err) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to submit ticket";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EmployeeLayout>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>Create New Ticket</Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setAiCreateDialogOpen(true)}
            sx={{
              textTransform: "none",
              bgcolor: "#7C3AED",
              color: "white",
              "&:hover": { bgcolor: "#6D28D9" },
            }}
          >
            ✨ Create with AI
          </Button>
        </Box>
        <Typography variant="body2" sx={{ color: "#6B7280" }}>
          Use "Create with AI" to fill the form automatically, or use the floating chat assistant (💬) for instant help!
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Ticket Information</Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Category + Subject */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
            <FormControl size="small" fullWidth required disabled={loadingCategories}>
              <InputLabel>Category *</InputLabel>
              <Select 
                label="Category *" 
                value={form.categoryId} 
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {loadingCategories ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading...
                  </MenuItem>
                ) : categories.length === 0 ? (
                  <MenuItem disabled>No categories available</MenuItem>
                ) : (
                  categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {formatCategoryDisplay(cat)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField label="Subject *" size="small" fullWidth placeholder="Enter ticket subject..." value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </Box>

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Description *"
              multiline
              rows={5}
              fullWidth
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </Box>

          {/* Priority + Impact */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel>Priority *</InputLabel>
              <Select label="Priority *" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth required>
              <InputLabel>Impact *</InputLabel>
              <Select label="Impact *" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}>
                {IMPACTS.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          {/* Attachments */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#374151", mb: 1 }}>Attachments</Typography>
            
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            
            <label htmlFor="file-upload">
              <Box
                sx={{
                  border: "2px dashed #D1D5DB",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#2563EB", bgcolor: "#EFF6FF" },
                  transition: "all 0.2s",
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: "#6B7280", mb: 1 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Upload Files</Typography>
                <Typography sx={{ fontSize: 12, color: "#9CA3AF", mt: 0.5 }}>Click to browse</Typography>
                <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.5 }}>Supported formats: PDF, JPG, PNG, DOCX. Maximum file size: 25 MB</Typography>
              </Box>
            </label>

            {/* Liste des fichiers sélectionnés */}
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    icon={<AttachFileIcon />}
                    label={`${file.name} (${attachmentsService.formatFileSize(file.size)})`}
                    onDelete={() => removeFile(index)}
                    deleteIcon={<DeleteIcon />}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}

            {uploadingFiles && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 1, textAlign: "center" }}>
                  Uploading attachments...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate("/employee/tickets")} sx={{ textTransform: "none", borderColor: "#D1D5DB", color: "#374151", "&:hover": { borderColor: "#9CA3AF" } }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting} sx={{ bgcolor: "#2563EB", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { bgcolor: "#1D4ED8" } }}>
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Dialog "Créer avec IA" */}
      <Dialog
        open={aiCreateDialogOpen}
        onClose={() => !aiLoading && setAiCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: "#7C3AED" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ✨ Create Ticket with AI
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Describe your problem in detail. AI will analyze your text and automatically fill the form.
          </Alert>
          
          {aiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {aiError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Describe your problem"
            placeholder="Example: My computer won't start since this morning. I tried restarting but nothing changes. It's urgent, I have a presentation at 2pm."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            disabled={aiLoading}
            sx={{ mb: 2 }}
          />

          <Typography variant="caption" sx={{ color: "#6B7280", fontStyle: "italic" }}>
            💡 Tip: Be as detailed as possible for better results. Supported languages: French, English, Arabic, Darija.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}>
          <Button
            onClick={() => setAiCreateDialogOpen(false)}
            disabled={aiLoading}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleAnalyzeWithAI}
            variant="contained"
            disabled={aiLoading || !aiText.trim()}
            startIcon={aiLoading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            sx={{
              bgcolor: "#7C3AED",
              textTransform: "none",
              "&:hover": { bgcolor: "#6D28D9" },
            }}
          >
            {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
          </Button>
        </DialogActions>
      </Dialog>
    </EmployeeLayout>
  );
}

export default CreateTicketPage;
