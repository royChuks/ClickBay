import { Content, SourceType, SearchFilters, SearchResult } from '../types';
import { ContentRepository } from '../repositories/content.repository';
import { BookmarkRepository } from '../repositories/bookmark.repository';
import { ValidationError } from '../middleware/errors';

/**
 * Content Service - Business logic for content operations
 */
export class ContentService {
  /**
   * Scrape and create content from URL
   */
  static async scrapeContent(
    userId: string,
    url: string,
    sourceType: SourceType
  ): Promise<Content> {
    // Validate inputs
    if (!url || !sourceType) {
      throw new ValidationError('URL and source type are required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new ValidationError('Invalid URL format');
    }

    // TODO: Implement web scraping logic
    // This would use a library like Cheerio or Puppeteer to fetch and parse the content
    const title = 'Scraped Content';
    const content = 'Content would be extracted from the URL';
    const excerpt = 'Excerpt would be generated from the content';

    // Create content in database
    const createdContent = await ContentRepository.create(
      userId,
      title,
      url,
      content,
      sourceType,
      excerpt
    );

    return createdContent;
  }

  /**
   * Get user's content with pagination
   */
  static async getUserContent(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ content: Content[]; total: number; hasNextPage: boolean }> {
    const result = await ContentRepository.getUserContent(userId, Math.min(limit, 100), offset);
    const hasNextPage = offset + limit < result.total;
    
    return {
      content: result.content,
      total: result.total,
      hasNextPage
    };
  }

  /**
   * Get content by ID
   */
  static async getContent(id: string): Promise<Content> {
    const content = await ContentRepository.findById(id);
    if (!content) {
      throw new ValidationError(`Content with id ${id} not found`);
    }

    // Increment view count
    await ContentRepository.incrementViews(id);

    return content;
  }

  /**
   * Search content with filters
   */
  static async searchContent(
    query: string,
    limit: number = 20,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      throw new ValidationError('Search query cannot be empty');
    }

    // TODO: Implement full-text search with Elasticsearch or similar
    const results = await ContentRepository.search(query, Math.min(limit, 100), filters);

    return results.map(content => ({
      id: `result_${content.id}`,
      content,
      analytics: content.analytics,
      relevanceScore: 0.95,
      matchedKeywords: [query]
    }));
  }

  /**
   * Get trending content
   */
  static async getTrendingContent(
    timeRange: string = 'LAST_30_DAYS',
    limit: number = 20
  ): Promise<Content[]> {
    return ContentRepository.getTrendingContent(timeRange, Math.min(limit, 100));
  }

  /**
   * Delete content
   */
  static async deleteContent(contentId: string): Promise<boolean> {
    // Remove related bookmarks
    await BookmarkRepository.deleteByContentId('*', contentId);
    
    return ContentRepository.delete(contentId);
  }
}
