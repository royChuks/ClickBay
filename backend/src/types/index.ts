// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  profile: UserProfile;
  statistics: UserStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  bio?: string;
  avatar?: string;
  preferences: Preferences;
  verified: boolean;
}

export interface Preferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

export interface UserStatistics {
  totalSearches: number;
  totalBookmarks: number;
  contentScraped: number;
  accountAgeInDays: number;
}

export enum UserRole {
  USER = 'USER',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN'
}

// Content Types
export interface Content {
  id: string;
  userId: string;
  title: string;
  url: string;
  content: string;
  sourceType: SourceType;
  excerpt?: string;
  metadata: ContentMetadata;
  analytics: ContentAnalytics;
  isBookmarked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentMetadata {
  author?: string;
  publishDate?: Date;
  favicon?: string;
  images?: string[];
  language?: string;
}

export interface ContentAnalytics {
  id: string;
  contentId: string;
  sentiment: Sentiment;
  keywords: Keyword[];
  entities: EntityMention[];
  topics: Topic[];
  summary: string;
  wordCount: number;
  readTime: number;
  languageScore?: number;
  qualityScore: number;
  createdAt: Date;
}

export interface Sentiment {
  score: number;
  label: SentimentLabel;
  confidence: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export enum SentimentLabel {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE'
}

export interface Keyword {
  text: string;
  frequency: number;
  score?: number;
  tfidf?: number;
}

export interface Topic {
  name: string;
  category: string;
  score: number;
}

export interface EntityMention {
  id?: string;
  name: string;
  type: EntityType;
  confidence: number;
  mentionCount: number;
}

export enum SourceType {
  ARTICLE = 'ARTICLE',
  NEWS = 'NEWS',
  BLOG = 'BLOG',
  RESEARCH_PAPER = 'RESEARCH_PAPER',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  VIDEO = 'VIDEO',
  DOCUMENTATION = 'DOCUMENTATION'
}

// Entity Types for Knowledge Graph
export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  confidence: number;
  mentionCount: number;
  relationships?: EntityRelationship[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export enum EntityType {
  PERSON = 'PERSON',
  ORGANIZATION = 'ORGANIZATION',
  LOCATION = 'LOCATION',
  PRODUCT = 'PRODUCT',
  TOPIC = 'TOPIC',
  OTHER = 'OTHER'
}

export interface EntityRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  confidence: number;
  metadata?: Record<string, unknown>;
  source?: Entity;
  target?: Entity;
}

// Bookmark Types
export interface Bookmark {
  id: string;
  userId: string;
  contentId: string;
  content?: Content;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Search Types
export interface SearchFilters {
  sourceType?: SourceType;
  sentiment?: SentimentLabel;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface SearchResult {
  id: string;
  content: Content;
  analytics?: ContentAnalytics;
  relevanceScore: number;
  matchedKeywords: string[];
}

export interface SemanticSearchResult {
  id: string;
  content: Content;
  relevanceScore: number;
  similarity: number;
  context: string;
  relatedEntities: Entity[];
  relatedDocuments: Content[];
}

// Analytics Types
export interface UserAnalytics {
  userId: string;
  totalSearches: number;
  totalBookmarks: number;
  trendingTopics: Topic[];
  recentActivity: ActivityLog[];
  preferences: Preferences;
}

export interface ActivityLog {
  type: string;
  description: string;
  createdAt: Date;
}

export interface TrendingTopic {
  id: string;
  name: string;
  score: number;
  mentionCount: number;
  growthRate: number;
  emergence: Date;
  relatedTopics: Topic[];
}

export interface GraphStatistics {
  totalNodes: number;
  totalRelationships: number;
  avgDegree: number;
  densityScore: number;
  mostConnectedNodes: NodeStatistic[];
}

export interface NodeStatistic {
  id: string;
  label: string;
  type: string;
  degree: number;
}

// Auth Types
export interface AuthPayload {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TokenPayload {
  token: string;
  refreshToken: string;
}

// Request Context
export interface RequestContext {
  userId?: string;
  user?: User;
  token?: string;
  isAuthenticated: boolean;
}
