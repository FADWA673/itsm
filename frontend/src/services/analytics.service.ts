// ============================================================================
// Analytics Service - Track User Behavior
// ============================================================================

interface SearchEvent {
  id: string;
  query: string;
  results: number;
  timestamp: Date;
  userId?: string;
  category?: string;
  successful: boolean; // Did user click on a result?
}

interface AnalyticsData {
  searches: SearchEvent[];
  popularSearches: Record<string, number>;
  failedSearches: string[];
  clickThroughRate: number;
}

class AnalyticsService {
  private storageKey = 'itsm-analytics-data';
  private sessionKey = 'itsm-current-session';

  /**
   * Track a search event
   */
  trackSearch(query: string, resultsCount: number, category?: string): string {
    const analytics = this.loadAnalytics();
    
    const searchId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const event: SearchEvent = {
      id: searchId,
      query: query.toLowerCase().trim(),
      results: resultsCount,
      timestamp: new Date(),
      category,
      successful: false, // Will be updated if user clicks
    };

    analytics.searches.push(event);
    
    // Update popular searches
    const queryKey = query.toLowerCase().trim();
    analytics.popularSearches[queryKey] = (analytics.popularSearches[queryKey] || 0) + 1;
    
    // Track failed searches (no results)
    if (resultsCount === 0) {
      analytics.failedSearches.push(queryKey);
    }

    // Keep only last 500 searches
    if (analytics.searches.length > 500) {
      analytics.searches = analytics.searches.slice(-500);
    }

    this.saveAnalytics(analytics);
    
    // Store search ID in session for click tracking
    sessionStorage.setItem(this.sessionKey, searchId);
    
    return searchId;
  }

  /**
   * Track when user clicks on a search result
   */
  trackSearchClick(searchId?: string): void {
    if (!searchId) {
      searchId = sessionStorage.getItem(this.sessionKey) || undefined;
    }
    
    if (!searchId) return;

    const analytics = this.loadAnalytics();
    const search = analytics.searches.find(s => s.id === searchId);
    
    if (search) {
      search.successful = true;
      this.saveAnalytics(analytics);
    }

    sessionStorage.removeItem(this.sessionKey);
  }

  /**
   * Get top searches
   */
  getTopSearches(limit: number = 10): Array<{ query: string; count: number }> {
    const analytics = this.loadAnalytics();
    
    return Object.entries(analytics.popularSearches)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get failed searches (no results)
   */
  getFailedSearches(limit: number = 10): string[] {
    const analytics = this.loadAnalytics();
    
    // Count occurrences
    const counts: Record<string, number> = {};
    analytics.failedSearches.forEach(query => {
      counts[query] = (counts[query] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query);
  }

  /**
   * Get click-through rate (CTR)
   */
  getClickThroughRate(): number {
    const analytics = this.loadAnalytics();
    
    if (analytics.searches.length === 0) return 0;

    const successful = analytics.searches.filter(s => s.successful).length;
    return (successful / analytics.searches.length) * 100;
  }

  /**
   * Get analytics stats
   */
  getStats() {
    const analytics = this.loadAnalytics();
    const topSearches = this.getTopSearches(5);
    const failedSearches = this.getFailedSearches(5);
    const ctr = this.getClickThroughRate();

    return {
      totalSearches: analytics.searches.length,
      uniqueSearches: Object.keys(analytics.popularSearches).length,
      failedSearchCount: analytics.failedSearches.length,
      clickThroughRate: ctr.toFixed(1),
      topSearches,
      failedSearches,
      last7Days: this.getSearchesLast7Days(),
    };
  }

  /**
   * Get searches from last 7 days
   */
  private getSearchesLast7Days(): Array<{ date: string; count: number }> {
    const analytics = this.loadAnalytics();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const searchesByDay: Record<string, number> = {};

    analytics.searches.forEach(search => {
      const searchDate = new Date(search.timestamp);
      if (searchDate >= sevenDaysAgo) {
        const dateKey = searchDate.toISOString().split('T')[0];
        searchesByDay[dateKey] = (searchesByDay[dateKey] || 0) + 1;
      }
    });

    return Object.entries(searchesByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Clear analytics data (admin only)
   */
  clearAnalytics(): void {
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.sessionKey);
  }

  // Private methods

  private loadAnalytics(): AnalyticsData {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        data.searches = data.searches.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }));
        return data;
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }

    return {
      searches: [],
      popularSearches: {},
      failedSearches: [],
      clickThroughRate: 0,
    };
  }

  private saveAnalytics(data: AnalyticsData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
