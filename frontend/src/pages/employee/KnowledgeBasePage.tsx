import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { knowledgeBaseService, type KBArticle, type KBCategory } from "../../services/knowledgeBase.service";
import { aiService } from "../../services/ai.service";
import { analyticsService } from "../../services/analytics.service";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PUBLISHED: { bg: "#ECFDF5", text: "#059669" },
  DRAFT: { bg: "#F3F4F6", text: "#6B7280" },
  PENDING_REVIEW: { bg: "#FEF3C7", text: "#D97706" },
  REJECTED: { bg: "#FEE2E2", text: "#DC2626" },
};

function KnowledgeBasePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // AI Search states
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState("");
  const [aiResults, setAiResults] = useState<KBArticle[]>([]);
  const [currentSearchId, setCurrentSearchId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, search, selectedCategory]);

  const loadData = async () => {
    try {
      const [cats, arts] = await Promise.all([
        knowledgeBaseService.getAllCategories(),
        knowledgeBaseService.getPublishedArticles(),
      ]);
      setCategories(cats);
      setArticles(arts);
    } catch (error) {
      console.error("Failed to load KB data:", error);
      alert("Failed to load knowledge base");
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    if (selectedCategory) {
      filtered = filtered.filter((a) => a.categoryId === selectedCategory);
    }

    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(search.toLowerCase())) ||
          (a.tags && a.tags.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  };

  const handleVote = async (articleId: string, helpful: boolean) => {
    try {
      await knowledgeBaseService.voteArticle(articleId, helpful);
      // Reload articles to get updated counts
      const updatedArticles = await knowledgeBaseService.getPublishedArticles();
      setArticles(updatedArticles);
      alert(helpful ? "Thanks for your feedback!" : "Thanks for letting us know");
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  // AI Search handler
  const handleAISearch = async () => {
    if (!aiSearchQuery.trim()) {
      setAiSearchError("Please describe what you're looking for");
      return;
    }

    setAiSearching(true);
    setAiSearchError("");
    setAiResults([]);

    try {
      // Use AI to understand the query and find relevant articles
      const analysis = await aiService.analyzeTicketText(aiSearchQuery);
      
      // Search articles based on AI analysis
      const category = analysis.category || "";
      const keywords = aiSearchQuery.toLowerCase().split(" ");
      
      // Intelligent article filtering
      const relevantArticles = articles.filter((article) => {
        // Check if category matches
        const categoryMatch = article.categoryName?.toLowerCase().includes(category.toLowerCase());
        
        // Check if title or excerpt contains keywords
        const titleMatch = keywords.some(keyword => 
          article.title.toLowerCase().includes(keyword)
        );
        const excerptMatch = keywords.some(keyword => 
          article.excerpt?.toLowerCase().includes(keyword)
        );
        const tagsMatch = keywords.some(keyword => 
          article.tags?.toLowerCase().includes(keyword)
        );
        
        // Score the relevance
        const relevanceScore = 
          (categoryMatch ? 3 : 0) +
          (titleMatch ? 2 : 0) +
          (excerptMatch ? 1 : 0) +
          (tagsMatch ? 1 : 0);
        
        return relevanceScore > 0;
      });

      // Sort by relevance
      const sortedResults = relevantArticles.sort((a, b) => {
        const scoreA = (a.helpful || 0) - (a.notHelpful || 0);
        const scoreB = (b.helpful || 0) - (b.notHelpful || 0);
        return scoreB - scoreA;
      });

      setAiResults(sortedResults.slice(0, 6)); // Top 6 results
      
      // Track search in analytics
      const searchId = analyticsService.trackSearch(
        aiSearchQuery,
        sortedResults.length,
        analysis.category
      );
      setCurrentSearchId(searchId);
      
      if (sortedResults.length === 0) {
        setAiSearchError("No articles found matching your query. Try different keywords.");
      }
    } catch (error: any) {
      console.error("AI search failed:", error);
      setAiSearchError(error.message || "Failed to search. Please try again.");
      
      // Track failed search
      analyticsService.trackSearch(aiSearchQuery, 0);
    } finally {
      setAiSearching(false);
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

  return (
    <EmployeeLayout>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              📚 Knowledge Base
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Find answers to common questions and issues
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setAiSearchOpen(true)}
            sx={{
              textTransform: "none",
              bgcolor: "#7C3AED",
              color: "white",
              "&:hover": { bgcolor: "#6D28D9" },
            }}
          >
            🤖 AI Search
          </Button>
        </Box>
      </Paper>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <TextField
          fullWidth
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Categories */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2, color: "#374151" }}>Categories</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label="All"
            onClick={() => setSelectedCategory(null)}
            sx={{
              bgcolor: selectedCategory === null ? "#2563EB" : "#F3F4F6",
              color: selectedCategory === null ? "white" : "#374151",
              "&:hover": { bgcolor: selectedCategory === null ? "#1E40AF" : "#E5E7EB" },
            }}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={`${cat.icon || ""} ${cat.name} (${cat.articleCount || 0})`}
              onClick={() => setSelectedCategory(cat.id)}
              sx={{
                bgcolor: selectedCategory === cat.id ? "#2563EB" : "#F3F4F6",
                color: selectedCategory === cat.id ? "white" : "#374151",
                "&:hover": { bgcolor: selectedCategory === cat.id ? "#1E40AF" : "#E5E7EB" },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #E5E7EB", textAlign: "center" }}>
          <Typography sx={{ color: "#9CA3AF" }}>
            {search ? `No articles found for "${search}"` : "No articles available"}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredArticles.map((article) => (
            <Grid item xs={12} md={6} lg={4} key={article.id}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#2563EB", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)" },
                }}
                onClick={() => navigate(`/employee/kb/${article.slug}`)}
              >
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={article.categoryName}
                      size="small"
                      sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontSize: 11, mb: 1 }}
                    />
                  </Box>

                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827", mb: 1 }}>
                    {article.title}
                  </Typography>

                  {article.excerpt && (
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#6B7280",
                        mb: 2,
                        flex: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {article.excerpt}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", pt: 2, borderTop: "1px solid #E5E7EB" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <VisibilityIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{article.views}</Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(article.id, true);
                        }}
                        sx={{ color: "#059669" }}
                      >
                        <ThumbUpIcon fontSize="small" />
                        <Typography sx={{ fontSize: 11, ml: 0.5 }}>{article.helpful}</Typography>
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(article.id, false);
                        }}
                        sx={{ color: "#DC2626" }}
                      >
                        <ThumbDownIcon fontSize="small" />
                        <Typography sx={{ fontSize: 11, ml: 0.5 }}>{article.notHelpful}</Typography>
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* AI Search Dialog */}
      <Dialog
        open={aiSearchOpen}
        onClose={() => !aiSearching && setAiSearchOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: "#7C3AED" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              🤖 AI-Powered Search
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Describe your problem or question in natural language. AI will find the most relevant articles for you.
          </Alert>

          {aiSearchError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {aiSearchError}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="What are you looking for?"
            placeholder="Example: How do I reset my password? My computer is running slow. I can't connect to the VPN..."
            value={aiSearchQuery}
            onChange={(e) => setAiSearchQuery(e.target.value)}
            disabled={aiSearching}
            sx={{ mb: 3 }}
          />

          {aiSearching && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2, color: "#6B7280" }}>AI is searching...</Typography>
            </Box>
          )}

          {aiResults.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2, color: "#374151" }}>
                ✨ Found {aiResults.length} relevant articles:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {aiResults.map((article) => (
                  <Card
                    key={article.id}
                    elevation={0}
                    sx={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 2,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2563EB", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.1)" },
                    }}
                    onClick={() => {
                      setAiSearchOpen(false);
                      analyticsService.trackSearchClick(currentSearchId);
                      navigate(`/employee/kb/${article.slug}`);
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Chip
                          label={article.categoryName}
                          size="small"
                          sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontSize: 11 }}
                        />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
                          <ThumbUpIcon sx={{ fontSize: 14, color: "#059669" }} />
                          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{article.helpful}</Typography>
                          <VisibilityIcon sx={{ fontSize: 14, color: "#9CA3AF", ml: 1 }} />
                          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{article.views}</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827", mb: 0.5 }}>
                        {article.title}
                      </Typography>
                      {article.excerpt && (
                        <Typography sx={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
                          {article.excerpt.substring(0, 150)}...
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}>
          <Button
            onClick={() => {
              setAiSearchOpen(false);
              setAiSearchQuery("");
              setAiResults([]);
              setAiSearchError("");
            }}
            disabled={aiSearching}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>

          <Button
            onClick={handleAISearch}
            variant="contained"
            disabled={aiSearching || !aiSearchQuery.trim()}
            startIcon={aiSearching ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            sx={{
              bgcolor: "#7C3AED",
              textTransform: "none",
              "&:hover": { bgcolor: "#6D28D9" },
            }}
          >
            {aiSearching ? "Searching..." : "Search with AI"}
          </Button>
        </DialogActions>
      </Dialog>
    </EmployeeLayout>
  );
}

export default KnowledgeBasePage;
