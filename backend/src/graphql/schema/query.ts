import { gql } from 'apollo-server-express';

export const queryTypeDefs = gql`
  # Main Query Type
  type Query {
    # Authentication
    currentUser: User
    
    # Content Operations
    userContent(
      userId: ID!
      limit: Int
      offset: Int
    ): ContentConnection!
    
    content(id: ID!): ContentWithAnalytics
    
    # Search Operations
    searchContent(
      query: String!
      limit: Int
      filters: SearchFiltersInput
    ): [SearchResult!]!
    
    semanticSearch(
      query: String!
      limit: Int
      useGraphContext: Boolean
      filters: SearchFiltersInput
    ): [SemanticSearchResult!]!
    
    # Knowledge Graph & Entity Operations
    entity(id: ID!): Entity
    entityRelationships(entityId: ID!, depth: Int): [EntityRelationship!]!
    entities(
      type: EntityType
      limit: Int
      offset: Int
    ): [Entity!]!
    
    graphStatistics: GraphStatistics!
    
    # Analytics & Insights
    contentAnalytics(contentId: ID!): ContentAnalytics
    userAnalytics(userId: ID!, timeRange: TimeRange): UserAnalytics
    trendingTopics(limit: Int, timeRange: TimeRange): [TrendingTopic!]!
    
    # Bookmark Operations
    bookmarks(limit: Int, offset: Int): [Bookmark!]!
    
    # Health check
    health: String!
  }

  # Types
  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    profile: UserProfile
    statistics: UserStatistics
    createdAt: DateTime!
  }

  type UserProfile {
    bio: String
    avatar: String
    preferences: Preferences
    verified: Boolean!
  }

  type Preferences {
    theme: String
    language: String
    notifications: Boolean
  }

  type UserStatistics {
    totalSearches: Int!
    totalBookmarks: Int!
    contentScraped: Int!
    accountAgeInDays: Int!
  }

  enum UserRole {
    USER
    PREMIUM
    ADMIN
  }

  # Content Types
  type ContentConnection {
    edges: [ContentEdge!]!
    pageInfo: PageInfo!
  }

  type ContentEdge {
    node: Content!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    totalCount: Int!
  }

  type Content {
    id: ID!
    title: String!
    url: String!
    sourceType: SourceType!
    excerpt: String
    isBookmarked: Boolean
    createdAt: DateTime!
  }

  type ContentWithAnalytics {
    id: ID!
    title: String!
    url: String!
    content: String
    sourceType: SourceType!
    analytics: ContentAnalytics
    metadata: ContentMetadata
  }

  type ContentMetadata {
    author: String
    publishDate: DateTime
    favicon: String
    images: [String!]
  }

  enum SourceType {
    ARTICLE
    NEWS
    BLOG
    RESEARCH_PAPER
    SOCIAL_MEDIA
    VIDEO
    DOCUMENTATION
  }

  # Analytics Types
  type ContentAnalytics {
    id: ID!
    contentId: ID!
    sentiment: Sentiment!
    keywords: [Keyword!]!
    entities: [EntityMention!]!
    topics: [Topic!]!
    summary: String!
    wordCount: Int!
    readTime: Int!
    languageScore: Float
    qualityScore: Float!
    createdAt: DateTime!
  }

  type Sentiment {
    score: Float!
    label: SentimentLabel!
    confidence: Float!
    breakdown: SentimentBreakdown
  }

  enum SentimentLabel {
    POSITIVE
    NEUTRAL
    NEGATIVE
  }

  type SentimentBreakdown {
    positive: Float!
    neutral: Float!
    negative: Float!
  }

  type Keyword {
    text: String!
    frequency: Int!
    score: Float
    tfidf: Float
  }

  type EntityMention {
    id: ID
    name: String!
    type: EntityType!
    confidence: Float!
    mentionCount: Int!
  }

  enum EntityType {
    PERSON
    ORGANIZATION
    LOCATION
    PRODUCT
    TOPIC
    OTHER
  }

  type Topic {
    name: String!
    category: String!
    score: Float!
  }

  type UserAnalytics {
    userId: ID!
    totalSearches: Int!
    totalBookmarks: Int!
    trendingTopics: [Topic!]!
    recentActivity: [ActivityLog!]!
    preferences: Preferences
  }

  type ActivityLog {
    type: String!
    description: String!
    createdAt: DateTime!
  }

  type TrendingTopic {
    id: ID!
    name: String!
    score: Float!
    mentionCount: Int!
    growthRate: Float!
    emergence: DateTime!
    relatedTopics: [Topic!]!
  }

  # Search Types
  input SearchFiltersInput {
    sourceType: SourceType
    sentiment: SentimentLabel
    dateRange: DateRangeInput
  }

  input DateRangeInput {
    startDate: DateTime!
    endDate: DateTime!
  }

  type DateRange {
    startDate: DateTime!
    endDate: DateTime!
  }

  type SearchResult {
    id: ID!
    content: Content!
    analytics: ContentAnalytics
    relevanceScore: Float!
    matchedKeywords: [String!]!
  }

  type SemanticSearchResult {
    id: ID!
    content: Content!
    relevanceScore: Float!
    similarity: Float!
    context: String!
    relatedEntities: [Entity!]!
    relatedDocuments: [Content!]!
  }

  # Entity Types
  type Entity {
    id: ID!
    name: String!
    type: EntityType!
    confidence: Float!
    mentionCount: Int!
    relationships: [EntityRelationship!]
    metadata: String
  }

  type EntityRelationship {
    id: ID!
    source: Entity!
    type: String!
    confidence: Float!
    target: Entity!
    metadata: String
  }

  type GraphStatistics {
    totalNodes: Int!
    totalRelationships: Int!
    avgDegree: Float!
    densityScore: Float!
    mostConnectedNodes: [NodeStatistic!]!
  }

  type NodeStatistic {
    id: ID!
    label: String!
    type: String!
    degree: Int!
  }

  # Bookmark Types
  type Bookmark {
    id: ID!
    contentId: ID!
    content: Content!
    tags: [String!]!
    notes: String
    createdAt: DateTime!
  }

  # Enums
  enum TimeRange {
    LAST_7_DAYS
    LAST_30_DAYS
    LAST_90_DAYS
    LAST_YEAR
    ALL_TIME
  }

  # Scalars
  scalar DateTime
`;
