import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { knowledgeBaseService, type KBArticle } from "../../services/knowledgeBase.service";
import ReactMarkdown from "react-markdown";

function KBArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<KBArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const loadArticle = async (articleSlug: string) => {
    try {
      const data = await knowledgeBaseService.getArticleBySlug(articleSlug);
      setArticle(data);
    } catch (error) {
      console.error("Failed to load article:", error);
      alert("Article not found");
      navigate("/employee/kb");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (helpful: boolean) => {
    if (!article) return;

    try {
      const updated = await knowledgeBaseService.voteArticle(article.id, helpful);
      setArticle(updated);
      alert(helpful ? "Thanks for your feedback!" : "Thanks for letting us know");
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </EmployeeLayout>
    );
  }

  if (!article) return null;

  return (
    <EmployeeLayout>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/employee/kb")}
          sx={{ mb: 3, textTransform: "none", color: "#2563EB" }}
        >
          Back to Knowledge Base
        </Button>

        {/* Article Header */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Chip
            label={article.categoryName}
            size="small"
            sx={{ bgcolor: "#EFF6FF", color: "#2563EB", mb: 2 }}
          />

          <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827", mb: 2 }}>
            {article.title}
          </Typography>

          <Box sx={{ display: "flex", gap: 3, alignItems: "center", color: "#6B7280", fontSize: 14 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <VisibilityIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: 13 }}>{article.views} views</Typography>
            </Box>

            <Typography sx={{ fontSize: 13 }}>By {article.authorName}</Typography>

            {article.publishedAt && (
              <Typography sx={{ fontSize: 13 }}>
                Published {new Date(article.publishedAt).toLocaleDateString()}
              </Typography>
            )}
          </Box>

          {article.tags && (
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              {article.tags.split(",").map((tag, idx) => (
                <Chip key={idx} label={tag.trim()} size="small" sx={{ bgcolor: "#F3F4F6", fontSize: 11 }} />
              ))}
            </Box>
          )}
        </Paper>

        {/* Article Content */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
          <Box
            sx={{
              "& h1": { fontSize: 28, fontWeight: 700, mb: 2, color: "#111827" },
              "& h2": { fontSize: 22, fontWeight: 600, mt: 3, mb: 1.5, color: "#111827" },
              "& h3": { fontSize: 18, fontWeight: 600, mt: 2, mb: 1, color: "#374151" },
              "& p": { fontSize: 15, lineHeight: 1.7, mb: 2, color: "#374151" },
              "& ul, & ol": { pl: 3, mb: 2 },
              "& li": { fontSize: 15, lineHeight: 1.7, mb: 0.5, color: "#374151" },
              "& code": {
                bgcolor: "#F3F4F6",
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: 13,
                fontFamily: "monospace",
              },
              "& pre": {
                bgcolor: "#1F2937",
                color: "#F9FAFB",
                p: 2,
                borderRadius: 1,
                overflow: "auto",
                fontSize: 13,
                fontFamily: "monospace",
              },
            }}
          >
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </Box>
        </Paper>

        {/* Feedback Section */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #E5E7EB", textAlign: "center" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2, color: "#111827" }}>
            Was this article helpful?
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              startIcon={<ThumbUpIcon />}
              onClick={() => handleVote(true)}
              sx={{
                textTransform: "none",
                borderColor: "#059669",
                color: "#059669",
                "&:hover": { borderColor: "#047857", bgcolor: "#ECFDF5" },
              }}
            >
              Yes ({article.helpful})
            </Button>

            <Button
              variant="outlined"
              startIcon={<ThumbDownIcon />}
              onClick={() => handleVote(false)}
              sx={{
                textTransform: "none",
                borderColor: "#DC2626",
                color: "#DC2626",
                "&:hover": { borderColor: "#B91C1C", bgcolor: "#FEE2E2" },
              }}
            >
              No ({article.notHelpful})
            </Button>
          </Box>
        </Paper>
      </Box>
    </EmployeeLayout>
  );
}

export default KBArticleDetailPage;
