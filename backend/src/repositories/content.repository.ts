import { Content, SourceType } from '../types';
import { ContentNode } from '../models';
import { memoryStore, nextId } from '../database/memory-store';

/**
 * Content Repository - Data access layer for Content operations
 */
export class ContentRepository {
  /**
   * Create new content
   */
  static async create(
    userId: string,
    title: string,
    url: string,
    content: string,
    sourceType: SourceType,
    excerpt?: string
  ): Promise<Content> {
    const id = nextId('content');
    const contentNode = new ContentNode(id, userId, title, url, content, sourceType, excerpt);
    const createdContent = contentNode.toContent();
    memoryStore.contents.set(id, createdContent);
    return createdContent;
  }

  /**
   * Find content by ID
   */
  static async findById(id: string): Promise<Content | null> {
    return memoryStore.contents.get(id) ?? null;
  }

  /**
   * Get user's content with pagination
   */
  static async getUserContent(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ content: Content[]; total: number }> {
    const content = Array.from(memoryStore.contents.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      content: content.slice(offset, offset + limit),
      total: content.length
    };
  }

  /**
   * Update content
   */
  static async update(id: string, data: Partial<Content>): Promise<Content | null> {
    const existingContent = memoryStore.contents.get(id);
    if (!existingContent) {
      return null;
    }

    const updatedContent: Content = {
      ...existingContent,
      ...data,
      metadata: data.metadata ?? existingContent.metadata,
      analytics: data.analytics ?? existingContent.analytics,
      updatedAt: new Date()
    };
    memoryStore.contents.set(id, updatedContent);
    return updatedContent;
  }

  /**
   * Delete content
   */
  static async delete(id: string): Promise<boolean> {
    return memoryStore.contents.delete(id);
  }

  /**
   * Search content by full-text query
   */
  static async search(
    query: string,
    limit: number = 20,
    filters?: any
  ): Promise<Content[]> {
    const normalizedQuery = query.trim().toLowerCase();
    let results = Array.from(memoryStore.contents.values()).filter(content => {
      const haystack = `${content.title} ${content.excerpt ?? ''} ${content.content}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    if (filters?.sourceType) {
      results = results.filter(content => content.sourceType === filters.sourceType);
    }

    if (filters?.sentiment) {
      results = results.filter(content => content.analytics.sentiment.label === filters.sentiment);
    }

    if (filters?.dateRange) {
      const startDate = new Date(filters.dateRange.startDate).getTime();
      const endDate = new Date(filters.dateRange.endDate).getTime();
      results = results.filter(content => {
        const createdAt = content.createdAt.getTime();
        return createdAt >= startDate && createdAt <= endDate;
      });
    }

    return results
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get trending content
   */
  static async getTrendingContent(
    _timeRange: string = 'LAST_30_DAYS',
    limit: number = 20
  ): Promise<Content[]> {
    return Array.from(memoryStore.contents.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Increment view count
   */
  static async incrementViews(id: string): Promise<boolean> {
    return memoryStore.contents.has(id);
  }
}
