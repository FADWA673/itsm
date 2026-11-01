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
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import { knowledgeBaseService, type KBArticle } from "../../services/knowledgeBase.service";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "#F3F4F6", text: "#6B7280" },
  PENDING_REVIEW: { bg: "#FEF3C7", text: "#D97706" },
  PUBLISHED: { bg: "#ECFDF5", text: "#059669" },
  REJECTED: { bg: "#FEE2E2", text: "#DC2626" },
};

function MyKBArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await knowledgeBaseService.getMyArticles();
      setArticles(data);
    } catch (error) {
      console.error("Failed to load articles:", error);
      alert("Failed to load your articles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    if (!confirm("Submit this article for review?")) return;

    try {
      await knowledgeBaseService.submitForReview(id);
      alert("Article submitted for review!");
      loadArticles();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit article");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article? This action cannot be undone.")) return;

    try {
      await knowledgeBaseService.deleteArticle(id);
      alert("Article deleted");
      loadArticles();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete article");
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
              📝 My KB Articles
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Create and manage your knowledge base articles
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/technician/kb/create")}
            sx={{ textTransform: "none", bgcolor: "#2563EB", "&:hover": { bgcolor: "#1E40AF" } }}
          >
            New Article
          </Button>
        </Box>
      </Paper>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED"].map((status) => {
          const count = articles.filter((a) => a.status === status).length;
          return (
            <Paper
              key={status}
              elevation={0}
              sx={{ p: 2, flex: 1, borderRadius: 2, border: "1px solid #E5E7EB", textAlign: "center" }}
            >
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{count}</Typography>
              <Typography sx={{ fontSize: 12, color: "#6B7280", textTransform: "capitalize" }}>
                {status.replace(/_/g, " ").toLowerCase()}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>TITLE</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>CATEGORY</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>VIEWS</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>HELPFUL</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>UPDATED</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280", textAlign: "center" }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#9CA3AF", mb: 2 }}>No articles yet</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/technician/kb/create")}
                    sx={{ textTransform: "none", bgcolor: "#2563EB" }}
                  >
                    Create Your First Article
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                      {article.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={article.categoryName} size="small" sx={{ fontSize: 11 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={article.status.replace(/_/g, " ")}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[article.status]?.bg,
                        color: STATUS_COLORS[article.status]?.text,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#6B7280" }}>{article.views}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#059669" }}>
                      {article.helpful} / {article.notHelpful}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      {article.status === "PUBLISHED" && (
                        <IconButton
                          size="small"
                          onClick={() => window.open(`/employee/kb/${article.slug}`, "_blank")}
                          title="View"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {(article.status === "DRAFT" || article.status === "REJECTED") && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/technician/kb/edit/${article.id}`)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleSubmitForReview(article.id)}
                            title="Submit for Review"
                            sx={{ color: "#2563EB" }}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(article.id)}
                            title="Delete"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}

                      {article.status === "REJECTED" && article.rejectedReason && (
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "#DC2626",
                            fontStyle: "italic",
                            ml: 1,
                            maxWidth: 200,
                          }}
                        >
                          Rejected: {article.rejectedReason}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </TechnicianLayout>
  );
}

export default MyKBArticlesPage;
