# ClickBay GraphQL API Schema

## Complete GraphQL Schema Definition

```graphql
# ============================================
# SCALAR TYPES
# ============================================

scalar DateTime
scalar JSON
scalar Upload

# ============================================
# ENUMS
# ============================================

enum UserRole {
  USER
  ADMIN
  PREMIUM
}

enum SourceType {
  ARTICLE
  TWEET
  DOCUMENT
  PDF
  VIDEO
}

enum SentimentLabel {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

enum EntityType {
  PERSON
  ORGANIZATION
  PLACE
  TOPIC
  PRODUCT
}

enum SortOrder {
  ASC
  DESC
}

enum TimeRange {
  LAST_7_DAYS
  LAST_30_DAYS
  LAST_90_DAYS
  LAST_YEAR
}

# ============================================
# INPUT TYPES
# ============================================

input SignupInput {
  email: String!
  password: String!
  name: String!
}

input LoginInput {
  email: String!
  password: String!
}

input UpdateProfileInput {
  name: String
  preferences: JSON
}

input ScrapeContentInput {
  url: String!
  sourceType: SourceType!
}

input SearchContentInput {
  query: String!
  limit: Int
  offset: Int
  filters: SearchFiltersInput
}

input SearchFiltersInput {
  sourceType: SourceType
  dateRange: DateRangeInput
  sentiment: SentimentLabel
}

input DateRangeInput {
  startDate: DateTime
  endDate: DateTime
}

input SemanticSearchInput {
  query: String!
  limit: Int
  useGraphContext: Boolean
  filters: SearchFiltersInput
}

input CreateEntityInput {
  name: String!
  type: EntityType!
  metadata: JSON
}

input CreateRelationshipInput {
  sourceId: ID!
  targetId: ID!
  type: String!
  metadata: JSON
}

# ============================================
# OBJECT TYPES
# ============================================

type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  createdAt: DateTime!
  updatedAt: DateTime!
  profile: UserProfile!
  statistics: UserStatistics!
}

type UserProfile {
  bio: String
  avatar: String
  preferences: JSON
  verified: Boolean!
}

type UserStatistics {
  totalSearches: Int!
  totalBookmarks: Int!
  contentScraped: Int!
  accountAgeInDays: Int!
}

type AuthPayload {
  user: User!
  token: String!
  refreshToken: String!
}

type Content {
  id: ID!
  url: String!
  title: String!
  sourceType: SourceType!
  content: String!
  excerpt: String!
  metadata: ContentMetadata!
  userId: ID!
  createdAt: DateTime!
  scrapedAt: DateTime!
  updatedAt: DateTime!
  analytics: ContentAnalytics
  isBookmarked: Boolean!
  bookmarkCount: Int!
}

type ContentMetadata {
  author: String
  publishDate: DateTime
  favicon: String
  images: [String!]
  language: String
  encoding: String
  canonical: String
}

type ContentAnalytics {
  id: ID!
  contentId: ID!
  sentiment: SentimentAnalysis!
  keywords: [Keyword!]!
  entities: [Entity!]!
  summary: String!
  readTime: Int!
  wordCount: Int!
  topics: [Topic!]!
  languageScore: Float!
  qualityScore: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SentimentAnalysis {
  score: Float! # 0-1
  label: SentimentLabel!
  confidence: Float! # 0-1
  breakdown: SentimentBreakdown!
}

type SentimentBreakdown {
  positive: Float!
  neutral: Float!
  negative: Float!
}

type Keyword {
  text: String!
  frequency: Int!
  score: Float! # Relevance score
  tfidf: Float! # TF-IDF score
}

type Topic {
  id: ID!
  name: String!
  category: String!
  score: Float!
}

type Entity {
  id: ID!
  name: String!
  type: EntityType!
  confidence: Float! # 0-1
  mentionCount: Int!
  relationships: [Relationship!]!
  metadata: JSON
}

type Relationship {
  id: ID!
  source: Entity!
  target: Entity!
  type: String!
  confidence: Float!
  metadata: JSON
}

type Bookmark {
  id: ID!
  userId: ID!
  contentId: ID!
  content: Content!
  createdAt: DateTime!
  tags: [String!]!
  notes: String
}

type Activity {
  id: ID!
  userId: ID!
  type: String!
  description: String!
  metadata: JSON
  createdAt: DateTime!
}

type UserAnalytics {
  userId: ID!
  totalSearches: Int!
  totalBookmarks: Int!
  trendingTopics: [Topic!]!
  recentActivity: [Activity!]!
  preferences: JSON
}

type SearchResult {
  id: ID!
  content: Content!
  analytics: ContentAnalytics!
  relevanceScore: Float! # 0-1
  matchedKeywords: [String!]!
  sourceReferences: [String!]!
}

type SemanticSearchResult {
  id: ID!
  content: Content!
  relevanceScore: Float!
  similarity: Float! # Cosine similarity
  context: String! # Excerpt with highlighted matches
  relatedEntities: [Entity!]!
  relatedDocuments: [Content!]!
}

type TrendingTopic {
  id: ID!
  name: String!
  score: Float!
  mentionCount: Int!
  growthRate: Float!
  relatedTopics: [TrendingTopic!]!
  emergence: DateTime!
}

type GraphNode {
  id: ID!
  label: String!
  type: EntityType!
  properties: JSON!
  degree: Int! # Number of relationships
}

type GraphStatistics {
  totalNodes: Int!
  totalRelationships: Int!
  avgDegree: Float!
  densityScore: Float!
  mostConnectedNodes: [GraphNode!]!
}

type PaginationInfo {
  totalCount: Int!
  currentPage: Int!
  pageSize: Int!
  totalPages: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

type Error {
  message: String!
  code: String!
  path: [String!]
  extensions: ErrorExtensions!
}

type ErrorExtensions {
  code: String!
  timestamp: DateTime!
  traceId: String!
}

# Connection types for pagination
type ContentConnection {
  edges: [ContentEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type ContentEdge {
  node: Content!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# ============================================
# QUERY TYPE
# ============================================

type Query {
  # Authentication & User
  currentUser: User @auth
  user(id: ID!): User @auth
  users(limit: Int = 10, offset: Int = 0): [User!]! @auth(role: ADMIN)
  userAnalytics(userId: ID!, timeRange: TimeRange = LAST_30_DAYS): UserAnalytics! @auth
  
  # Content
  content(id: ID!): Content @auth
  contentByUrl(url: String!): Content @auth
  userContent(userId: ID!, limit: Int = 20, offset: Int = 0): ContentConnection! @auth
  
  # Search
  searchContent(
    query: String!
    limit: Int = 20
    offset: Int = 0
    filters: SearchFiltersInput
  ): [SearchResult!]! @auth
  
  # Semantic Search with GraphRAG
  semanticSearch(
    query: String!
    limit: Int = 10
    useGraphContext: Boolean = true
    filters: SearchFiltersInput
  ): [SemanticSearchResult!]! @auth
  
  # Analytics
  contentAnalytics(contentId: ID!): ContentAnalytics @auth
  
  # Trends
  trendingTopics(
    limit: Int = 10
    timeRange: TimeRange = LAST_30_DAYS
  ): [TrendingTopic!]! @auth
  
  # Entities & Knowledge Graph
  entities(
    type: EntityType
    limit: Int = 20
    offset: Int = 0
  ): [Entity!]! @auth
  
  entity(id: ID!): Entity @auth
  
  entityRelationships(entityId: ID!, depth: Int = 1): [Relationship!]! @auth
  
  # Graph Statistics
  graphStatistics: GraphStatistics! @auth
  
  # Bookmarks
  bookmarks(limit: Int = 20, offset: Int = 0): [Bookmark!]! @auth
  isBookmarked(contentId: ID!): Boolean! @auth
  
  # Activity
  recentActivity(limit: Int = 20): [Activity!]! @auth
  
  # Search History
  searchHistory(limit: Int = 10): [String!]! @auth
}

# ============================================
# MUTATION TYPE
# ============================================

type Mutation {
  # Authentication
  signup(input: SignupInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean! @auth
  refreshToken(refreshToken: String!): AuthPayload!
  resetPassword(email: String!): Boolean!
  changePassword(oldPassword: String!, newPassword: String!): Boolean! @auth
  
  # User Profile
  updateProfile(input: UpdateProfileInput!): User! @auth
  deleteAccount: Boolean! @auth
  
  # Content
  scrapeContent(input: ScrapeContentInput!): Content! @auth(rateLimit: "10/hour")
  updateContent(id: ID!, input: JSON!): Content! @auth
  deleteContent(id: ID!): Boolean! @auth
  
  # Bookmarks
  saveBookmark(contentId: ID!, tags: [String!]): Bookmark! @auth
  removeBookmark(contentId: ID!): Boolean! @auth
  updateBookmark(bookmarkId: ID!, tags: [String!], notes: String): Bookmark! @auth
  
  # Entities & Relationships (GraphRAG)
  createEntity(input: CreateEntityInput!): Entity! @auth(role: PREMIUM)
  updateEntity(id: ID!, input: JSON!): Entity! @auth(role: PREMIUM)
  deleteEntity(id: ID!): Boolean! @auth(role: PREMIUM)
  
  createRelationship(input: CreateRelationshipInput!): Relationship! @auth(role: PREMIUM)
  deleteRelationship(id: ID!): Boolean! @auth(role: PREMIUM)
  
  # Activity
  recordActivity(type: String!, contentId: ID, metadata: JSON): Activity! @auth
}

# ============================================
# SUBSCRIPTION TYPE
# ============================================

type Subscription {
  # Content scraping notifications
  contentScraped(userId: ID!): Content!
  
  # Analytics updates
  analyticsUpdated(userId: ID!): ContentAnalytics!
  
  # Entity updates
  entityAdded(userId: ID!): Entity!
  
  # Real-time search results
  searchResults(userId: ID!, query: String!): SearchResult!
}

# ============================================
# DIRECTIVES
# ============================================

directive @auth(role: UserRole) on FIELD_DEFINITION
directive @rateLimit(limit: String!) on FIELD_DEFINITION
directive @deprecated(reason: String) on FIELD_DEFINITION
directive @cacheControl(maxAge: Int!) on FIELD_DEFINITION
directive @validate(pattern: String) on ARGUMENT_DEFINITION
```

---

## Example Queries

### 1. User Authentication

```graphql
mutation SignUp {
  signup(input: {
    email: "user@example.com"
    password: "SecurePassword123!"
    name: "John Doe"
  }) {
    user {
      id
      email
      name
      role
    }
    token
    refreshToken
  }
}
```

### 2. Scrape Content

```graphql
mutation ScrapeURL {
  scrapeContent(input: {
    url: "https://example.com/article"
    sourceType: ARTICLE
  }) {
    id
    title
    url
    sourceType
    createdAt
    analytics {
      sentiment {
        score
        label
      }
      keywords {
        text
        frequency
      }
      summary
    }
  }
}
```

### 3. Semantic Search with GraphRAG

```graphql
query SemanticSearch {
  semanticSearch(
    query: "AI trends in 2024"
    limit: 10
    useGraphContext: true
    filters: {
      sourceType: ARTICLE
      dateRange: {
        startDate: "2024-01-01T00:00:00Z"
        endDate: "2024-12-31T23:59:59Z"
      }
    }
  ) {
    id
    content {
      id
      title
      url
      excerpt
    }
    relevanceScore
    similarity
    context
    relatedEntities {
      name
      type
      mentionCount
    }
    relatedDocuments {
      title
      url
    }
  }
}
```

### 4. Get Content Analytics

```graphql
query GetAnalytics {
  contentAnalytics(contentId: "content_123") {
    id
    sentiment {
      score
      label
      confidence
      breakdown {
        positive
        neutral
        negative
      }
    }
    keywords {
      text
      frequency
      score
      tfidf
    }
    entities {
      name
      type
      confidence
      mentionCount
      relationships {
        type
        target {
          name
          type
        }
      }
    }
    topics {
      name
      category
      score
    }
    summary
    readTime
    wordCount
    qualityScore
  }
}
```

### 5. Get Trending Topics

```graphql
query GetTrends {
  trendingTopics(
    limit: 10
    timeRange: LAST_30_DAYS
  ) {
    name
    score
    mentionCount
    growthRate
    relatedTopics {
      name
      score
    }
  }
}
```

### 6. Graph Entity Relationships

```graphql
query GetEntityGraph {
  entity(id: "entity_123") {
    id
    name
    type
    confidence
    mentionCount
    relationships {
      id
      type
      confidence
      target {
        id
        name
        type
      }
    }
  }
}
```

### 7. User Analytics

```graphql
query GetUserAnalytics {
  userAnalytics(userId: "user_123", timeRange: LAST_30_DAYS) {
    userId
    totalSearches
    totalBookmarks
    trendingTopics {
      name
      score
    }
    recentActivity {
      type
      description
      createdAt
    }
    preferences
  }
}
```

### 8. Full Text + Semantic Search

```graphql
query CombinedSearch {
  searchContent(
    query: "machine learning"
    limit: 20
    filters: {
      sourceType: ARTICLE
      sentiment: POSITIVE
    }
  ) {
    id
    content {
      title
      excerpt
      url
    }
    analytics {
      sentiment {
        score
        label
      }
      keywords {
        text
        frequency
      }
    }
    relevanceScore
  }
  
  semanticSearch(
    query: "machine learning advances"
    limit: 10
    useGraphContext: true
  ) {
    id
    content {
      title
      url
    }
    similarity
    relatedEntities {
      name
      type
    }
  }
}
```

---

## Subscription Examples

### Content Scraped Subscription

```graphql
subscription OnContentScraped {
  contentScraped(userId: "user_123") {
    id
    title
    url
    createdAt
    analytics {
      sentiment {
        label
        score
      }
    }
  }
}
```

---

## Rate Limiting

- **Free Tier**: 100 requests/hour
- **Premium Tier**: 10,000 requests/hour
- **Scraping**: 10 URLs/hour per user
- **Semantic Search**: 100 queries/hour

Rate limit headers in response:
```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9950
X-RateLimit-Reset: 1618428000
```

---

## Error Responses

### Validation Error
```json
{
  "errors": [
    {
      "message": "Invalid email format",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "path": ["signup", "input", "email"]
      }
    }
  ]
}
```

### Authentication Error
```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "AUTHENTICATION_ERROR",
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### Rate Limit Error
```json
{
  "errors": [
    {
      "message": "Rate limit exceeded. Try again in 3600 seconds.",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED",
        "retryAfter": 3600
      }
    }
  ]
}
```

---

## Pagination

All list queries support cursor-based pagination:

```graphql
query GetPaginatedContent {
  userContent(
    userId: "user_123"
    limit: 20
    offset: 0
  ) {
    edges {
      node {
        id
        title
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```
