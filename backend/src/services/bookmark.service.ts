import { Bookmark } from '../types';
import { BookmarkRepository } from '../repositories/bookmark.repository';
import { ContentRepository } from '../repositories/content.repository';
import { ValidationError } from '../middleware/errors';

/**
 * Bookmark Service - Business logic for bookmark operations
 */
export class BookmarkService {
  /**
   * Save a bookmark
   */
  static async saveBookmark(
    userId: string,
    contentId: string,
    tags: string[] = []
  ): Promise<Bookmark> {
    // Validate content exists
    const content = await ContentRepository.findById(contentId);
    if (!content) {
      throw new ValidationError(`Content with id ${contentId} not found`);
    }

    // Check if already bookmarked
    const isBookmarked = await BookmarkRepository.isBookmarked(userId, contentId);
    if (isBookmarked) {
      throw new ValidationError('Content is already bookmarked');
    }

    return BookmarkRepository.create(userId, contentId, tags);
  }

  /**
   * Get user bookmarks
   */
  static async getUserBookmarks(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ bookmarks: Bookmark[]; total: number; hasNextPage: boolean }> {
    const result = await BookmarkRepository.getUserBookmarks(userId, Math.min(limit, 100), offset);
    const hasNextPage = offset + limit < result.total;

    return {
      bookmarks: result.bookmarks,
      total: result.total,
      hasNextPage
    };
  }

  /**
   * Update bookmark
   */
  static async updateBookmark(
    bookmarkId: string,
    userId: string,
    tags?: string[],
    notes?: string
  ): Promise<Bookmark> {
    const bookmark = await BookmarkRepository.findById(bookmarkId);
    if (!bookmark) {
      throw new ValidationError('Bookmark not found');
    }

    // Verify ownership
    if (bookmark.userId !== userId) {
      throw new ValidationError('Unauthorized');
    }

    const updated = await BookmarkRepository.update(bookmarkId, tags, notes);
    if (!updated) {
      throw new ValidationError('Failed to update bookmark');
    }

    return updated;
  }

  /**
   * Remove bookmark
   */
  static async removeBookmark(userId: string, contentId: string): Promise<boolean> {
    const isBookmarked = await BookmarkRepository.isBookmarked(userId, contentId);
    if (!isBookmarked) {
      throw new ValidationError('Bookmark not found');
    }

    return BookmarkRepository.deleteByContentId(userId, contentId);
  }

  /**
   * Get bookmarks by tag
   */
  static async getBookmarksByTag(userId: string, tag: string): Promise<Bookmark[]> {
    if (!tag) {
      throw new ValidationError('Tag is required');
    }

    return BookmarkRepository.getByTag(userId, tag);
  }

  /**
   * Search bookmarks
   */
  static async searchBookmarks(userId: string, query: string): Promise<Bookmark[]> {
    if (!query) {
      throw new ValidationError('Search query is required');
    }

    return BookmarkRepository.search(userId, query);
  }
}
