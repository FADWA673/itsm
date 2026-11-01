import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { knowledgeBaseService, type KBArticle, type KBCategory } from "../../services/knowledgeBase.service";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "#F3F4F6", text: "#6B7280" },
  PENDING_REVIEW: { bg: "#FEF3C7", text: "#D97706" },
  PUBLISHED: { bg: "#ECFDF5", text: "#059669" },
  REJECTED: { bg: "#FEE2E2", text: "#DC2626" },
  ARCHIVED: { bg: "#E5E7EB", text: "#374151" },
};

function ManageKBArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    article: KBArticle | null;
    action: "approve" | "reject" | null;
  }>({ open: false, article: null, action: null });
  const [feedback, setFeedback] = useState("");
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    article: KBArticle | null;
  }>({ open: false, article: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger à la fois les articles publiés et les pending
      const [publishedArticles, pendingArticles, categoriesData] = await Promise.all([
        knowledgeBaseService.getPublishedArticles(),
        knowledgeBaseService.getPendingArticles(),
        knowledgeBaseService.getAllCategories(),
      ]);
      
      // Combiner les deux listes
      const allArticles = [...publishedArticles, ...pendingArticles];
      
      setArticles(allArticles);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await knowledgeBaseService.deleteArticle(id);
      alert("Article deleted successfully");
      loadData();
    } catch (error) {
      console.error("Failed to delete article:", error);
      alert("Failed to delete article");
    }
  };

  const handleOpenReview = (article: KBArticle, action: "approve" | "reject") => {
    setReviewDialog({ open: true, article, action });
    setFeedback("");
  };

  const handleCloseReview = () => {
    setReviewDialog({ open: false, article: null, action: null });
    setFeedback("");
  };

  const handleSubmitReview = async () => {
    if (!reviewDialog.article || !reviewDialog.action) return;

    try {
      await knowledgeBaseService.reviewArticle(
        reviewDialog.article.id,
        reviewDialog.action,
        feedback || undefined
      );
      alert(
        reviewDialog.action === "approve"
          ? "Article approved and published!"
          : "Article rejected"
      );
      handleCloseReview();
      loadData();
    } catch (error) {
      console.error("Failed to review article:", error);
      alert("Failed to review article");
    }
  };

  const handlePreview = (article: KBArticle) => {
    setPreviewDialog({ open: true, article });
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || article.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || article.category.id === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    draft: articles.filter((a) => a.status === "DRAFT").length,
    pending: articles.filter((a) => a.status === "PENDING_REVIEW").length,
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
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827", mb: 1 }}>
            📚 Manage KB Articles
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            View, filter, approve, and manage all knowledge base articles
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#EFF6FF", border: "1px solid #DBEAFE" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E40AF" }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ color: "#3730A3" }}>
                Total Articles
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#ECFDF5", border: "1px solid #D1FAE5" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#059669" }}>
                {stats.published}
              </Typography>
              <Typography variant="body2" sx={{ color: "#047857" }}>
                Published
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#FEF3C7", border: "1px solid #FCD34D" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#D97706" }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" sx={{ color: "#92400E" }}>
                Pending Review
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#F3F4F6", border: "1px solid #E5E7EB" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#6B7280" }}>
                {stats.draft}
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151" }}>
                Drafts
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search articles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or content..."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="PUBLISHED">Published</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PENDING_REVIEW">Pending Review</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Results */}
        <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
          Showing {filteredArticles.length} of {articles.length} articles
        </Typography>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Views</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Helpful</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {article.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      {article.excerpt?.substring(0, 60)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {article.authorName || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={article.categoryName || article.category?.name || "N/A"}
                      size="small"
                      sx={{ bgcolor: "#E0E7FF", color: "#3730A3" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={article.status}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[article.status]?.bg,
                        color: STATUS_COLORS[article.status]?.text,
                      }}
                    />
                  </TableCell>
                  <TableCell>{article.viewCount || 0}</TableCell>
                  <TableCell>
                    {article.helpfulCount || 0} / {article.notHelpfulCount || 0}
                  </TableCell>
                  <TableCell>
                    {new Date(article.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(article)}
                      title="Preview"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {article.status === "PENDING_REVIEW" && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenReview(article, "approve")}
                          sx={{ color: "#059669" }}
                          title="Approve"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenReview(article, "reject")}
                          sx={{ color: "#DC2626" }}
                          title="Reject"
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(article.id, article.title)}
                      sx={{ color: "#DC2626" }}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredArticles.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center", mt: 2 }}>
            <Typography variant="body1" sx={{ color: "#6B7280" }}>
              No articles found matching your filters
            </Typography>
          </Paper>
        )}

        {/* Review Dialog */}
        <Dialog
          open={reviewDialog.open}
          onClose={handleCloseReview}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {reviewDialog.action === "approve" ? "✅ Approve Article" : "❌ Reject Article"}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: "#6B7280" }}>
              {reviewDialog.action === "approve"
                ? "This article will be published and visible to all employees."
                : "This article will be sent back to the author with your feedback."}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={reviewDialog.action === "approve" ? "Feedback (optional)" : "Rejection reason"}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                reviewDialog.action === "approve"
                  ? "Great article! Consider adding more examples..."
                  : "Please provide more details about..."
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReview}>Cancel</Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              color={reviewDialog.action === "approve" ? "success" : "error"}
            >
              {reviewDialog.action === "approve" ? "Approve & Publish" : "Reject"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={previewDialog.open}
          onClose={() => setPreviewDialog({ open: false, article: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>📄 Article Preview</DialogTitle>
          <DialogContent>
            {previewDialog.article && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  {previewDialog.article.title}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={previewDialog.article.categoryName || previewDialog.article.category?.name || "N/A"}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {previewDialog.article.tags?.split(',').map((tag) => (
                    <Chip key={tag} label={tag.trim()} size="small" sx={{ mr: 1 }} />
                  ))}
                </Box>
                <Typography variant="body2" sx={{ color: "#6B7280", mb: 3, fontStyle: "italic" }}>
                  {previewDialog.article.excerpt}
                </Typography>
                <Box sx={{ "& h1": { fontSize: "1.5rem", fontWeight: 600, mt: 2, mb: 1 } }}>
                  <ReactMarkdown>{previewDialog.article.content}</ReactMarkdown>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialog({ open: false, article: null })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default ManageKBArticlesPage;
