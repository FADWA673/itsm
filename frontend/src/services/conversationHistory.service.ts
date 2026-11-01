// ============================================================================
// Conversation History Service
// Save and retrieve past AI conversations
// ============================================================================

import type { AIConversation } from '../types/aiChat.types';

interface ConversationSummary {
  id: string;
  firstMessage: string;
  date: Date;
  messageCount: number;
  resolved: boolean;
  category?: string;
}

class ConversationHistoryService {
  private storageKey = 'itsm-conversation-history';
  private maxConversations = 50; // Keep last 50 conversations

  /**
   * Save a conversation to history
   */
  saveConversation(conversation: AIConversation): void {
    const history = this.loadHistory();
    
    // Don't save empty conversations
    if (conversation.messages.length === 0) return;

    // Check if conversation already exists
    const existingIndex = history.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      // Update existing
      history[existingIndex] = conversation;
    } else {
      // Add new
      history.unshift(conversation);
    }

    // Keep only last N conversations
    if (history.length > this.maxConversations) {
      history.splice(this.maxConversations);
    }

    this.saveHistory(history);
  }

  /**
   * Get all conversation summaries
   */
  getConversationSummaries(): ConversationSummary[] {
    const history = this.loadHistory();
    
    return history.map(conv => ({
      id: conv.id,
      firstMessage: this.extractFirstUserMessage(conv),
      date: new Date(conv.createdAt),
      messageCount: conv.messages.length,
      resolved: conv.status === 'resolved',
      category: this.extractCategory(conv),
    }));
  }

  /**
   * Get a specific conversation by ID
   */
  getConversation(id: string): AIConversation | null {
    const history = this.loadHistory();
    const conversation = history.find(c => c.id === id);
    
    if (!conversation) return null;

    // Convert date strings back to Date objects
    return {
      ...conversation,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      messages: conversation.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    };
  }

  /**
   * Delete a conversation
   */
  deleteConversation(id: string): void {
    const history = this.loadHistory();
    const filtered = history.filter(c => c.id !== id);
    this.saveHistory(filtered);
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Search conversations by keyword
   */
  searchConversations(keyword: string): ConversationSummary[] {
    const history = this.loadHistory();
    const lowerKeyword = keyword.toLowerCase();

    const filtered = history.filter(conv => {
      // Search in messages
      return conv.messages.some(msg => 
        msg.content.toLowerCase().includes(lowerKeyword)
      );
    });

    return filtered.map(conv => ({
      id: conv.id,
      firstMessage: this.extractFirstUserMessage(conv),
      date: new Date(conv.createdAt),
      messageCount: conv.messages.length,
      resolved: conv.status === 'resolved',
      category: this.extractCategory(conv),
    }));
  }

  /**
   * Get statistics
   */
  getStats() {
    const history = this.loadHistory();
    const summaries = this.getConversationSummaries();

    return {
      totalConversations: history.length,
      resolvedConversations: summaries.filter(s => s.resolved).length,
      averageMessagesPerConversation: history.length > 0
        ? (history.reduce((sum, conv) => sum + conv.messages.length, 0) / history.length).toFixed(1)
        : 0,
      last7Days: this.getConversationsLast7Days(),
    };
  }

  // Private methods

  private extractFirstUserMessage(conversation: AIConversation): string {
    const firstUserMsg = conversation.messages.find(m => m.role === 'user');
    if (!firstUserMsg) return 'No message';
    
    // Truncate to 100 chars
    return firstUserMsg.content.length > 100
      ? firstUserMsg.content.substring(0, 100) + '...'
      : firstUserMsg.content;
  }

  private extractCategory(conversation: AIConversation): string | undefined {
    // Try to extract category from context or messages
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant');
    
    // Look for category mentions in assistant responses
    for (const msg of assistantMessages) {
      if (msg.content.includes('Network')) return 'Network';
      if (msg.content.includes('Hardware')) return 'Hardware';
      if (msg.content.includes('Software')) return 'Software';
      if (msg.content.includes('VPN')) return 'VPN';
      if (msg.content.includes('Password') || msg.content.includes('Access')) return 'Access';
    }

    return undefined;
  }

  private getConversationsLast7Days(): Array<{ date: string; count: number }> {
    const history = this.loadHistory();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const convsByDay: Record<string, number> = {};

    history.forEach(conv => {
      const convDate = new Date(conv.createdAt);
      if (convDate >= sevenDaysAgo) {
        const dateKey = convDate.toISOString().split('T')[0];
        convsByDay[dateKey] = (convsByDay[dateKey] || 0) + 1;
      }
    });

    return Object.entries(convsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private loadHistory(): AIConversation[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
    return [];
  }

  private saveHistory(history: AIConversation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }
}

// Export singleton instance
export const conversationHistoryService = new ConversationHistoryService();
