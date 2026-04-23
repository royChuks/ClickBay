import { RequestContext } from '../../types';
import { UserService } from '../../services/user.service';
import { ContentService } from '../../services/content.service';
import { BookmarkService } from '../../services/bookmark.service';
import { GraphRAGService } from '../../services/graphrag.service';
import { AnalyticsService } from '../../services/analytics.service';
import {
  generateRefreshToken,
  generateToken,
  requireAuth,
  revokeAccessToken,
  revokeAllRefreshTokensForUser,
  revokeRefreshToken,
  verifyRefreshToken
} from '../../middleware/auth';

interface ResolverContext extends RequestContext {}

export const resolvers = {
  Query: {
    // Health check
    health: (): string => 'ok',

    // Authentication queries
    currentUser: async (_: any, __: any, context: ResolverContext) => {
      requireAuth(context);
      return UserService.getCurrentUser(context.userId!);
    },

    // Content queries
    userContent: async (
      _: any,
      { userId, limit = 20, offset = 0 }: any,
      _context: ResolverContext
    ) => {
      const result = await ContentService.getUserContent(userId, limit, offset);
      return {
        edges: result.content.map((content, index) => ({
          node: content,
          cursor: Buffer.from(`${offset + index}`).toString('base64')
        })),
        pageInfo: {
          hasNextPage: result.hasNextPage,
          totalCount: result.total
        }
      };
    },

    content: async (_: any, { id }: any) => {
      return ContentService.getContent(id);
    },

    // Search queries
    searchContent: async (_: any, { query, limit = 20, filters }: any) => {
      return ContentService.searchContent(query, limit, filters);
    },

    semanticSearch: async (_: any, { query, limit = 10, filters }: any) => {
      return GraphRAGService.semanticSearch(query, limit, filters);
    },

    // Entity queries
    entity: async (_: any, { id }: any) => {
      return GraphRAGService.getEntity(id);
    },

    entityRelationships: async (_: any, { entityId, depth = 1 }: any) => {
      return GraphRAGService.getEntityRelationships(entityId, depth);
    },

    entities: async (_: any, { type, limit = 20, offset = 0 }: any) => {
      if (type) {
        return GraphRAGService.getEntitiesByType(type, limit, offset);
      }
      return [];
    },

    graphStatistics: async () => {
      return GraphRAGService.getGraphStatistics();
    },

    // Analytics queries
    contentAnalytics: async (_: any, { contentId }: any) => {
      return AnalyticsService.getContentAnalytics(contentId);
    },

    userAnalytics: async (
      _: any,
      { userId, timeRange = 'LAST_30_DAYS' }: any,
      context: ResolverContext
    ) => {
      requireAuth(context);
      return AnalyticsService.getUserAnalytics(userId, timeRange);
    },

    trendingTopics: async (_: any, { limit = 20, timeRange = 'LAST_30_DAYS' }: any) => {
      return AnalyticsService.getTrendingTopics(timeRange, limit);
    },

    // Bookmark queries
    bookmarks: async (_: any, { limit = 50, offset = 0 }: any, context: ResolverContext) => {
      requireAuth(context);
      const result = await BookmarkService.getUserBookmarks(context.userId!, limit, offset);
      return result.bookmarks;
    }
  },

  Mutation: {
    // Authentication mutations
    signup: async (_: any, { input }: any) => {
      const { user, token, refreshToken } = await UserService.signup(
        input.email,
        input.password,
        input.name
      );
      return { user, token, refreshToken };
    },

    login: async (_: any, { input }: any) => {
      const { user, token, refreshToken } = await UserService.login(
        input.email,
        input.password
      );
      return { user, token, refreshToken };
    },

    refreshToken: async (_: any, { refreshToken }: any) => {
      const decoded = verifyRefreshToken(refreshToken) as { userId: string };
      revokeRefreshToken(refreshToken);

      return {
        token: generateToken(decoded.userId),
        refreshToken: generateRefreshToken(decoded.userId)
      };
    },

    logout: async (_: any, __: any, context: ResolverContext) => {
      requireAuth(context);
      revokeAllRefreshTokensForUser(context.userId!);
      if (context.token) {
        revokeAccessToken(context.token);
      }
      return true;
    },

    // Content mutations
    scrapeContent: async (_: any, { input }: any, context: ResolverContext) => {
      requireAuth(context);
      return ContentService.scrapeContent(
        context.userId!,
        input.url,
        input.sourceType
      );
    },

    // Bookmark mutations
    saveBookmark: async (
      _: any,
      { contentId, tags = [] }: any,
      context: ResolverContext
    ) => {
      requireAuth(context);
      return BookmarkService.saveBookmark(context.userId!, contentId, tags);
    },

    updateBookmark: async (
      _: any,
      { bookmarkId, tags, notes }: any,
      context: ResolverContext
    ) => {
      requireAuth(context);
      return BookmarkService.updateBookmark(bookmarkId, context.userId!, tags, notes);
    },

    removeBookmark: async (_: any, { contentId }: any, context: ResolverContext) => {
      requireAuth(context);
      return BookmarkService.removeBookmark(context.userId!, contentId);
    },

    // User profile mutations
    updateProfile: async (_: any, { input }: any, context: ResolverContext) => {
      requireAuth(context);
      return UserService.updateProfile(context.userId!, input.name, input.preferences);
    }
  },

  Subscription: {
    contentScraped: {
      subscribe: () => {
        // TODO: Implement subscription using PubSub
        return [];
      }
    },

    analyticsUpdated: {
      subscribe: () => {
        // TODO: Implement subscription using PubSub
        return [];
      }
    }
  }
};

