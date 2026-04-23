import { Bookmark } from '../types';
import { memoryStore, nextId } from '../database/memory-store';

/**
 * Bookmark Repository - Data access layer for Bookmark operations
 */
export class BookmarkRepository {
  /**
   * Create a bookmark
   */
  static async create(
    userId: string,
    contentId: string,
    tags: string[] = [],
    notes: string = ''
  ): Promise<Bookmark> {
    const id = nextId('bookmark');
    const bookmark: Bookmark = {
      id,
      userId,
      contentId,
      content: memoryStore.contents.get(contentId),
      tags,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.bookmarks.set(id, bookmark);
    return bookmark;
  }

  /**
   * Find bookmark by ID
   */
  static async findById(id: string): Promise<Bookmark | null> {
    const bookmark = memoryStore.bookmarks.get(id);
    return bookmark ? { ...bookmark, content: memoryStore.contents.get(bookmark.contentId) } : null;
  }

  /**
   * Get user's bookmarks
   */
  static async getUserBookmarks(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ bookmarks: Bookmark[]; total: number }> {
    const bookmarks = Array.from(memoryStore.bookmarks.values())
      .filter(bookmark => bookmark.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(bookmark => ({
        ...bookmark,
        content: memoryStore.contents.get(bookmark.contentId)
      }));

    return {
      bookmarks: bookmarks.slice(offset, offset + limit),
      total: bookmarks.length
    };
  }

  /**
   * Check if content is bookmarked by user
   */
  static async isBookmarked(userId: string, contentId: string): Promise<boolean> {
    return Array.from(memoryStore.bookmarks.values()).some(
      bookmark => bookmark.userId === userId && bookmark.contentId === contentId
    );
  }

  /**
   * Update bookmark
   */
  static async update(id: string, tags?: string[], notes?: string): Promise<Bookmark | null> {
    const existingBookmark = memoryStore.bookmarks.get(id);
    if (!existingBookmark) {
      return null;
    }

    const updatedBookmark: Bookmark = {
      ...existingBookmark,
      tags: tags ?? existingBookmark.tags,
      notes: notes ?? existingBookmark.notes,
      content: memoryStore.contents.get(existingBookmark.contentId),
      updatedAt: new Date()
    };
    memoryStore.bookmarks.set(id, updatedBookmark);
    return updatedBookmark;
  }

  /**
   * Remove bookmark
   */
  static async delete(id: string): Promise<boolean> {
    return memoryStore.bookmarks.delete(id);
  }

  /**
   * Remove bookmark by content ID
   */
  static async deleteByContentId(userId: string, contentId: string): Promise<boolean> {
    const bookmark = Array.from(memoryStore.bookmarks.values()).find(
      item => item.userId === userId && item.contentId === contentId
    );
    if (!bookmark) {
      return false;
    }

    return memoryStore.bookmarks.delete(bookmark.id);
  }

  /**
   * Get bookmarks by tag
   */
  static async getByTag(userId: string, tag: string): Promise<Bookmark[]> {
    return Array.from(memoryStore.bookmarks.values())
      .filter(bookmark => bookmark.userId === userId && bookmark.tags.includes(tag))
      .map(bookmark => ({
        ...bookmark,
        content: memoryStore.contents.get(bookmark.contentId)
      }));
  }

  /**
   * Search bookmarks
   */
  static async search(userId: string, query: string): Promise<Bookmark[]> {
    const normalizedQuery = query.trim().toLowerCase();
    return Array.from(memoryStore.bookmarks.values())
      .filter(bookmark => {
        if (bookmark.userId !== userId) {
          return false;
        }

        const content = memoryStore.contents.get(bookmark.contentId);
        const haystack = `${bookmark.notes ?? ''} ${bookmark.tags.join(' ')} ${content?.title ?? ''}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .map(bookmark => ({
        ...bookmark,
        content: memoryStore.contents.get(bookmark.contentId)
      }));
  }
}
