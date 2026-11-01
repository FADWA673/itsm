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
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReactMarkdown from "react-markdown";
import AdminLayout from "../../layouts/AdminLayout";
import { knowledgeBaseService, type KBArticle } from "../../services/knowledgeBase.service";

function PendingKBArticlesPage() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
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
    loadPendingArticles();
  }, []);

  const loadPendingArticles = async () => {
    try {
      const data = await knowledgeBaseService.getPendingArticles();
      setArticles(data);
    } catch (error) {
      console.error("Failed to load pending articles:", error);
      alert("Failed to load pending articles");
    } finally {
      setLoading(false);
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
      loadPendingArticles();
    } catch (error) {
      console.error("Failed to review article:", error);
      alert("Failed to review article");
    }
  };

  const handlePreview = (article: KBArticle) => {
    setPreviewDialog({ open: true, article });
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
            📋 Pending KB Articles
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Review and approve articles submitted by technicians
          </Typography>
        </Box>

        {/* Stats */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#FEF3C7", border: "1px solid #FCD34D" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#92400E" }}>
            {articles.length} article{articles.length !== 1 ? "s" : ""} waiting for review
          </Typography>
        </Paper>

        {/* Table */}
        {articles.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "#6B7280" }}>
              🎉 No pending articles! All caught up.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {article.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {article.excerpt}
                      </Typography>
                    </TableCell>
                    <TableCell>{article.authorName || "Unknown"}</TableCell>
                    <TableCell>
                      <Chip
                        label={article.categoryName || article.category?.name || "N/A"}
                        size="small"
                        sx={{ bgcolor: "#E0E7FF", color: "#3730A3" }}
                      />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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

export default PendingKBArticlesPage;
