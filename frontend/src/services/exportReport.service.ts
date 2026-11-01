import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface AnalyticsData {
  totalSearches: number;
  uniqueQueries: number;
  clickThroughRate: string;
  failedSearches: number;
  topSearches: Array<{ query: string; count: number }>;
  activityByDay: Array<{ day: string; count: number }>;
}

class ExportReportService {
  /**
   * Export Analytics to PDF
   */
  exportAnalyticsToPDF(data: AnalyticsData): void {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text('📊 Analytics Report - ITSM', 14, 20);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray
    doc.text(`Generated on: ${new Date().toLocaleString('fr-FR')}`, 14, 28);
    
    // Statistics Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', 14, 40);
    
    const summaryData = [
      ['Total Searches', data.totalSearches.toString()],
      ['Unique Queries', data.uniqueQueries.toString()],
      ['Click-Through Rate', data.clickThroughRate],
      ['Failed Searches', data.failedSearches.toString()],
    ];
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 },
    });
    
    // Top 10 Searches
    doc.setFontSize(14);
    doc.text('Top 10 Most Popular Searches', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const topSearchesData = data.topSearches.slice(0, 10).map((item, index) => [
      (index + 1).toString(),
      item.query,
      item.count.toString(),
    ]);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['#', 'Search Query', 'Count']],
      body: topSearchesData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });
    
    // Activity by Day
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Activity Over Last 7 Days', 14, 20);
    
    const activityData = data.activityByDay.map((item) => [
      item.day,
      item.count.toString(),
    ]);
    
    autoTable(doc, {
      startY: 25,
      head: [['Day', 'Searches']],
      body: activityData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 },
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'ITSM Platform - Analytics Report',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Save
    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Export Analytics to Excel
   */
  exportAnalyticsToExcel(data: AnalyticsData): void {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Summary Statistics
    const summaryData = [
      ['Analytics Report - ITSM'],
      ['Generated on:', new Date().toLocaleString('fr-FR')],
      [],
      ['Metric', 'Value'],
      ['Total Searches', data.totalSearches],
      ['Unique Queries', data.uniqueQueries],
      ['Click-Through Rate', data.clickThroughRate],
      ['Failed Searches', data.failedSearches],
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style header
    ws1['A1'] = { v: 'Analytics Report - ITSM', t: 's', s: { font: { bold: true, sz: 16 } } };
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
    
    // Sheet 2: Top Searches
    const topSearchesData = [
      ['Top 10 Most Popular Searches'],
      [],
      ['Rank', 'Search Query', 'Count'],
      ...data.topSearches.slice(0, 10).map((item, index) => [
        index + 1,
        item.query,
        item.count,
      ]),
    ];
    
    const ws2 = XLSX.utils.aoa_to_sheet(topSearchesData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Top Searches');
    
    // Sheet 3: Activity by Day
    const activityData = [
      ['Search Activity - Last 7 Days'],
      [],
      ['Day', 'Number of Searches'],
      ...data.activityByDay.map((item) => [item.day, item.count]),
    ];
    
    const ws3 = XLSX.utils.aoa_to_sheet(activityData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Activity');
    
    // Save
    XLSX.writeFile(wb, `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Export Ticket List to PDF
   */
  exportTicketsToPDF(tickets: any[]): void {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('🎫 Tickets Report - ITSM', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${new Date().toLocaleString('fr-FR')}`, 14, 28);
    doc.text(`Total Tickets: ${tickets.length}`, 14, 34);
    
    const ticketData = tickets.map((ticket) => [
      ticket.id || 'N/A',
      ticket.title || 'N/A',
      ticket.status || 'N/A',
      ticket.priority || 'N/A',
      ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-FR') : 'N/A',
    ]);
    
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Title', 'Status', 'Priority', 'Created']],
      body: ticketData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 70 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
      },
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`tickets-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Export Ticket List to Excel
   */
  exportTicketsToExcel(tickets: any[]): void {
    const wb = XLSX.utils.book_new();
    
    const ticketData = [
      ['Tickets Report - ITSM'],
      ['Generated on:', new Date().toLocaleString('fr-FR')],
      ['Total Tickets:', tickets.length],
      [],
      ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Created', 'Updated'],
      ...tickets.map((ticket) => [
        ticket.id || 'N/A',
        ticket.title || 'N/A',
        ticket.description || 'N/A',
        ticket.status || 'N/A',
        ticket.priority || 'N/A',
        ticket.category || 'N/A',
        ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('fr-FR') : 'N/A',
        ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('fr-FR') : 'N/A',
      ]),
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(ticketData);
    
    // Auto-size columns
    const wscols = [
      { wch: 15 }, // ID
      { wch: 40 }, // Title
      { wch: 60 }, // Description
      { wch: 15 }, // Status
      { wch: 12 }, // Priority
      { wch: 20 }, // Category
      { wch: 20 }, // Created
      { wch: 20 }, // Updated
    ];
    ws['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    
    XLSX.writeFile(wb, `tickets-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}

export const exportReportService = new ExportReportService();
