import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import AdminLayout from "../../layouts/AdminLayout";
import { analyticsService } from "../../services/analytics.service";
import { exportReportService } from "../../services/exportReport.service";

function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const data = analyticsService.getStats();
    setStats(data);
  };

  const handleExportPDF = () => {
    exportReportService.exportAnalyticsToPDF(stats);
  };

  const handleExportExcel = () => {
    exportReportService.exportAnalyticsToExcel(stats);
  };

  if (!stats) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Loading analytics...</Typography>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              📊 Search Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Insights about user searches in Knowledge Base
            </Typography>
          </Box>
          
          {/* Export Buttons */}
          <ButtonGroup variant="contained" size="small">
            <Button
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportPDF}
              sx={{
                bgcolor: "#DC2626",
                "&:hover": { bgcolor: "#B91C1C" },
              }}
            >
              Export PDF
            </Button>
            <Button
              startIcon={<TableViewIcon />}
              onClick={handleExportExcel}
              sx={{
                bgcolor: "#059669",
                "&:hover": { bgcolor: "#047857" },
              }}
            >
              Export Excel
            </Button>
          </ButtonGroup>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <SearchIcon sx={{ color: "#2563EB", fontSize: 24 }} />
                <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                  Total Searches
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
                {stats.totalSearches}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.5 }}>
                {stats.uniqueSearches} unique queries
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TouchAppIcon sx={{ color: "#059669", fontSize: 24 }} />
                <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                  Click-Through Rate
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#059669" }}>
                {stats.clickThroughRate}%
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.5 }}>
                Users clicking results
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <ErrorOutlined sx={{ color: "#DC2626", fontSize: 24 }} />
                <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                  Failed Searches
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#DC2626" }}>
                {stats.failedSearchCount}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.5 }}>
                No results found
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TrendingUpIcon sx={{ color: "#7C3AED", fontSize: 24 }} />
                <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                  Last 7 Days
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#7C3AED" }}>
                {stats.last7Days.reduce((sum: number, day: any) => sum + day.count, 0)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.5 }}>
                Recent activity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Searches */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827", mb: 2 }}>
              🔥 Top Searches
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Query</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.topSearches.map((search: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{ 
                              bgcolor: index === 0 ? "#FEF3C7" : "#F3F4F6",
                              color: index === 0 ? "#D97706" : "#6B7280",
                              fontSize: 11,
                            }}
                          />
                          <Typography sx={{ fontSize: 14 }}>{search.query}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={search.count}
                          size="small"
                          sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {stats.topSearches.length === 0 && (
              <Typography sx={{ textAlign: "center", color: "#9CA3AF", py: 3 }}>
                No search data yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Failed Searches */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827", mb: 2 }}>
              ⚠️ Failed Searches (No Results)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Query</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.failedSearches.map((query: string, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography sx={{ fontSize: 14, color: "#DC2626" }}>
                          {query}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label="Create Article"
                          size="small"
                          sx={{ 
                            bgcolor: "#FEE2E2",
                            color: "#DC2626",
                            fontSize: 11,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#FECACA" }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {stats.failedSearches.length === 0 && (
              <Typography sx={{ textAlign: "center", color: "#9CA3AF", py: 3 }}>
                All searches found results! 🎉
              </Typography>
            )}
            {stats.failedSearches.length > 0 && (
              <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 2, fontStyle: "italic" }}>
                💡 Consider creating KB articles for these topics
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Activity Last 7 Days */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827", mb: 2 }}>
              📈 Search Activity (Last 7 Days)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Searches</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.last7Days.map((day: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography sx={{ fontSize: 14 }}>
                          {new Date(day.date).toLocaleDateString('fr-FR', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={day.count}
                          size="small"
                          sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: `${Math.min((day.count / 20) * 100, 100)}%`,
                              height: 8,
                              bgcolor: "#7C3AED",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {stats.last7Days.length === 0 && (
              <Typography sx={{ textAlign: "center", color: "#9CA3AF", py: 3 }}>
                No activity in the last 7 days
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}

export default AnalyticsPage;
