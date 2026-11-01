import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import {
  knowledgeBaseService,
  type KBCategory,
  type KBArticle,
} from "../../services/knowledgeBase.service";

function CreateKBArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    categoryId: "",
    tags: "",
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const cats = await knowledgeBaseService.getAllCategories();
      setCategories(cats);

      if (isEditMode && id) {
        const article = await knowledgeBaseService.getArticleById(id);
        setFormData({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt || "",
          categoryId: article.categoryId,
          tags: article.tags || "",
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert("Please fill in all required fields (Title, Content, Category)");
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && id) {
        await knowledgeBaseService.updateArticle(id, formData);
        alert("Article updated successfully!");
      } else {
        await knowledgeBaseService.createArticle(formData);
        alert("Article created successfully!");
      }
      navigate("/technician/kb");
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} article`);
    } finally {
      setSaving(false);
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
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
                {isEditMode ? "✏️ Edit Article" : "📝 Create New Article"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
                {isEditMode ? "Update your knowledge base article" : "Write a helpful article for your team"}
              </Typography>
            </Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/technician/kb")}
              sx={{ textTransform: "none", color: "#6B7280" }}
            >
              Back
            </Button>
          </Box>
        </Paper>

        {/* Form */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* Title */}
            <TextField
              label="Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              placeholder="Ex: Comment réinitialiser votre mot de passe"
              helperText="Clear and descriptive title"
            />

            {/* Category */}
            <FormControl fullWidth>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                label="Category *"
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Excerpt */}
            <TextField
              label="Excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Short summary of the article (shown in search results)"
              helperText="Optional - Brief description of what this article covers"
            />

            {/* Content (Markdown) */}
            <Box>
              <TextField
                label="Content * (Markdown supported)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                fullWidth
                multiline
                rows={15}
                placeholder={`# Title

## Step 1: Description
Step details here...

## Step 2: Another step
More details...

## Troubleshooting
- **Problem?** Solution here
- **Another issue?** Fix here`}
                helperText="Use Markdown syntax: # for titles, ## for sections, - for lists, **bold**, *italic*"
              />
              
              <Box sx={{ mt: 2, p: 2, bgcolor: "#F9FAFB", borderRadius: 1, border: "1px solid #E5E7EB" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>
                  💡 Markdown Tips:
                </Typography>
                <Box sx={{ fontSize: 11, color: "#6B7280", "& code": { bgcolor: "#E5E7EB", px: 0.5, borderRadius: 0.5 } }}>
                  <Typography sx={{ fontSize: 11 }}>• <code># Title</code> = Large title</Typography>
                  <Typography sx={{ fontSize: 11 }}>• <code>## Section</code> = Section heading</Typography>
                  <Typography sx={{ fontSize: 11 }}>• <code>**bold**</code> = <strong>bold text</strong></Typography>
                  <Typography sx={{ fontSize: 11 }}>• <code>- item</code> = Bullet point</Typography>
                  <Typography sx={{ fontSize: 11 }}>• <code>`code`</code> = Inline code</Typography>
                </Box>
              </Box>
            </Box>

            {/* Tags */}
            <TextField
              label="Tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              placeholder="wifi,password,network,troubleshooting"
              helperText="Comma-separated keywords for better search"
            />

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/technician/kb")}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={saving}
                sx={{ textTransform: "none", bgcolor: "#2563EB", "&:hover": { bgcolor: "#1E40AF" } }}
              >
                {saving ? "Saving..." : isEditMode ? "Update Article" : "Create Article"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </TechnicianLayout>
  );
}

export default CreateKBArticlePage;
