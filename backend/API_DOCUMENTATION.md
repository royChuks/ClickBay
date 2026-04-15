# ClickBay Backend - Complete API Documentation

## API Endpoints

**Base URL**: `http://localhost:4000`
**GraphQL Endpoint**: `http://localhost:4000/graphql`
**Apollo Studio**: `http://localhost:4000/graphql` (Apollo Sandbox)

---

## 1. Authentication Workflow

### 1.1 User Registration

**Mutation**:
```graphql
mutation RegisterUser {
  signup(input: {
    email: "user@example.com"
    password: "SecurePass123!"
    name: "John Doe"
  }) {
    user {
      id
      email
      name
      role
      createdAt
    }
    token
    refreshToken
  }
}
```

**Response** (Success):
```json
{
  "data": {
    "signup": {
      "user": {
        "id": "user_12345",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "USER",
        "createdAt": "2024-04-15T10:30:00Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Response** (Validation):
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

### 1.2 User Login

**Mutation**:
```graphql
mutation LoginUser {
  login(input: {
    email: "user@example.com"
    password: "SecurePass123!"
  }) {
    user {
      id
      email
      name
      role
      profile {
        avatar
        verified
      }
    }
    token
    refreshToken
  }
}
```

**Response**:
```json
{
  "data": {
    "login": {
      "user": {
        "id": "user_12345",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "USER",
        "profile": {
          "avatar": null,
          "verified": false
        }
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 1.3 Token Refresh

**Mutation**:
```graphql
mutation RefreshAccessToken {
  refreshToken(refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...") {
    token
    refreshToken
  }
}
```

### 1.4 Logout

**Mutation**:
```graphql
mutation LogoutUser {
  logout
}
```

**Response**:
```json
{
  "data": {
    "logout": true
  }
}
```

---

## 2. Content Operations

### 2.1 Scrape Content from URL

**Mutation**:
```graphql
mutation ScrapeWebContent {
  scrapeContent(input: {
    url: "https://techcrunch.com/2024/04/15/ai-trends"
    sourceType: ARTICLE
  }) {
    id
    title
    url
    sourceType
    excerpt
    metadata {
      author
      publishDate
      language
    }
    analytics {
      sentiment {
        score
        label
        confidence
      }
      keywords {
        text
        frequency
      }
      summary
      readTime
    }
    createdAt
  }
}
```

**Response**:
```json
{
  "data": {
    "scrapeContent": {
      "id": "content_67890",
      "title": "AI Trends 2024: What to Watch",
      "url": "https://techcrunch.com/2024/04/15/ai-trends",
      "sourceType": "ARTICLE",
      "excerpt": "This year marks a significant shift in how AI is deployed...",
      "metadata": {
        "author": "Jane Smith",
        "publishDate": "2024-04-15T08:00:00Z",
        "language": "en"
      },
      "analytics": {
        "sentiment": {
          "score": 0.75,
          "label": "POSITIVE",
          "confidence": 0.92
        },
        "keywords": [
          { "text": "AI", "frequency": 45 },
          { "text": "machine learning", "frequency": 28 },
          { "text": "innovation", "frequency": 19 }
        ],
        "summary": "A comprehensive analysis of AI trends expected in 2024...",
        "readTime": 8
      },
      "createdAt": "2024-04-15T10:35:00Z"
    }
  }
}
```

### 2.2 Get User's Scraped Content

**Query**:
```graphql
query GetMyContent {
  userContent(
    userId: "user_12345"
    limit: 20
    offset: 0
  ) {
    edges {
      node {
        id
        title
        url
        sourceType
        excerpt
        createdAt
        isBookmarked
      }
      cursor
    }
    pageInfo {
      hasNextPage
      totalCount
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "userContent": {
      "edges": [
        {
          "node": {
            "id": "content_001",
            "title": "AI Trends 2024",
            "url": "https://techcrunch.com/article1",
            "sourceType": "ARTICLE",
            "excerpt": "This year marks a significant shift...",
            "createdAt": "2024-04-15T10:35:00Z",
            "isBookmarked": true
          },
          "cursor": "Y3Vyc29yOmNvbnRlbnRfMDAx"
        }
      ],
      "pageInfo": {
        "hasNextPage": true,
        "totalCount": 156
      }
    }
  }
}
```

### 2.3 Get Content Details with Analytics

**Query**:
```graphql
query GetContentWithAnalytics {
  content(id: "content_67890") {
    id
    title
    url
    content
    sourceType
    analytics {
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
        id
        name
        type
        confidence
        mentionCount
      }
      topics {
        name
        category
        score
      }
      summary
      wordCount
      readTime
      qualityScore
    }
    metadata {
      author
      publishDate
      favicon
      images
    }
  }
}
```

---

## 3. Search Operations

### 3.1 Full-Text Search

**Query**:
```graphql
query SearchContentFullText {
  searchContent(
    query: "machine learning"
    limit: 20
    filters: {
      sourceType: ARTICLE
      sentiment: POSITIVE
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
    matchedKeywords
  }
}
```

**Response**:
```json
{
  "data": {
    "searchContent": [
      {
        "id": "result_001",
        "content": {
          "id": "content_001",
          "title": "Machine Learning Advances",
          "url": "https://example.com/ml-advances",
          "excerpt": "Recent breakthroughs in machine learning..."
        },
        "analytics": {
          "sentiment": {
            "score": 0.82,
            "label": "POSITIVE"
          },
          "keywords": [
            { "text": "machine learning", "frequency": 23 },
            { "text": "neural networks", "frequency": 15 }
          ]
        },
        "relevanceScore": 0.95,
        "matchedKeywords": ["machine learning", "neural networks"]
      }
    ]
  }
}
```

### 3.2 Semantic Search with GraphRAG

**Query**:
```graphql
query SemanticSearchWithContext {
  semanticSearch(
    query: "What are the latest breakthroughs in artificial intelligence?"
    limit: 10
    useGraphContext: true
    filters: {
      sourceType: ARTICLE
      dateRange: {
        startDate: "2024-03-01T00:00:00Z"
        endDate: "2024-04-15T23:59:59Z"
      }
    }
  ) {
    id
    content {
      id
      title
      url
      excerpt
      metadata {
        author
        publishDate
      }
    }
    relevanceScore
    similarity
    context
    relatedEntities {
      id
      name
      type
      confidence
      mentionCount
    }
    relatedDocuments {
      id
      title
      url
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "semanticSearch": [
      {
        "id": "semantic_result_001",
        "content": {
          "id": "content_001",
          "title": "AI Breakthroughs in 2024",
          "url": "https://example.com/ai-breakthroughs",
          "excerpt": "Recent developments show significant progress...",
          "metadata": {
            "author": "Dr. John Smith",
            "publishDate": "2024-04-14T00:00:00Z"
          }
        },
        "relevanceScore": 0.98,
        "similarity": 0.96,
        "context": "...significant progress in **language models** and **neural networks**...",
        "relatedEntities": [
          {
            "id": "entity_001",
            "name": "Transformer Architecture",
            "type": "TOPIC",
            "confidence": 0.92,
            "mentionCount": 3
          },
          {
            "id": "entity_002",
            "name": "OpenAI",
            "type": "ORGANIZATION",
            "confidence": 0.88,
            "mentionCount": 2
          }
        ],
        "relatedDocuments": [
          {
            "id": "content_002",
            "title": "Understanding Transformers",
            "url": "https://example.com/transformers"
          }
        ]
      }
    ]
  }
}
```

---

## 4. Knowledge Graph & Entity Operations

### 4.1 Get Entity Details

**Query**:
```graphql
query GetEntity {
  entity(id: "entity_001") {
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
    metadata
  }
}
```

**Response**:
```json
{
  "data": {
    "entity": {
      "id": "entity_001",
      "name": "OpenAI",
      "type": "ORGANIZATION",
      "confidence": 0.95,
      "mentionCount": 42,
      "relationships": [
        {
          "id": "rel_001",
          "type": "FOUNDED_BY",
          "confidence": 0.92,
          "target": {
            "id": "entity_002",
            "name": "Sam Altman",
            "type": "PERSON"
          }
        },
        {
          "id": "rel_002",
          "type": "CREATED",
          "confidence": 0.98,
          "target": {
            "id": "entity_003",
            "name": "GPT-4",
            "type": "PRODUCT"
          }
        }
      ],
      "metadata": {
        "website": "openai.com",
        "founded": "2015",
        "headquarters": "San Francisco, CA"
      }
    }
  }
}
```

### 4.2 Get Entity Relationships (Graph Traversal)

**Query**:
```graphql
query GetEntityRelationships {
  entityRelationships(entityId: "entity_001", depth: 2) {
    id
    source {
      name
      type
    }
    type
    confidence
    target {
      name
      type
      relationships {
        type
        target {
          name
        }
      }
    }
    metadata
  }
}
```

### 4.3 List Entities by Type

**Query**:
```graphql
query GetEntitiesByType {
  entities(
    type: PERSON
    limit: 20
    offset: 0
  ) {
    id
    name
    type
    confidence
    mentionCount
  }
}
```

### 4.4 Get Graph Statistics

**Query**:
```graphql
query GetGraphStats {
  graphStatistics {
    totalNodes
    totalRelationships
    avgDegree
    densityScore
    mostConnectedNodes {
      id
      label
      type
      degree
    }
  }
}
```

---

## 5. Analytics & Insights

### 5.1 Content Analytics

**Query**:
```graphql
query GetContentAnalytics {
  contentAnalytics(contentId: "content_001") {
    id
    contentId
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
    }
    topics {
      name
      category
      score
    }
    summary
    readTime
    wordCount
    languageScore
    qualityScore
    createdAt
  }
}
```

### 5.2 User Analytics

**Query**:
```graphql
query GetUserAnalytics {
  userAnalytics(userId: "user_123", timeRange: LAST_30_DAYS) {
    userId
    totalSearches
    totalBookmarks
    trendingTopics {
      name
      score
      mentionCount
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

### 5.3 Trending Topics

**Query**:
```graphql
query GetTrendingTopics {
  trendingTopics(limit: 20, timeRange: LAST_30_DAYS) {
    id
    name
    score
    mentionCount
    growthRate
    emergence
    relatedTopics {
      name
      score
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "trendingTopics": [
      {
        "id": "topic_001",
        "name": "Artificial Intelligence",
        "score": 0.98,
        "mentionCount": 1250,
        "growthRate": 0.35,
        "emergence": "2024-02-15T00:00:00Z",
        "relatedTopics": [
          { "name": "Machine Learning", "score": 0.92 },
          { "name": "Neural Networks", "score": 0.88 }
        ]
      }
    ]
  }
}
```

---

## 6. Bookmark Operations

### 6.1 Save Bookmark

**Mutation**:
```graphql
mutation SaveBookmark {
  saveBookmark(
    contentId: "content_001"
    tags: ["AI", "trending", "must-read"]
  ) {
    id
    contentId
    content {
      title
      url
    }
    tags
    createdAt
  }
}
```

### 6.2 Get User Bookmarks

**Query**:
```graphql
query GetUserBookmarks {
  bookmarks(limit: 50, offset: 0) {
    id
    content {
      id
      title
      url
      excerpt
    }
    tags
    notes
    createdAt
  }
}
```

### 6.3 Update Bookmark

**Mutation**:
```graphql
mutation UpdateBookmark {
  updateBookmark(
    bookmarkId: "bookmark_001"
    tags: ["AI", "archived"]
    notes: "Important reference for Q2 report"
  ) {
    id
    tags
    notes
  }
}
```

### 6.4 Remove Bookmark

**Mutation**:
```graphql
mutation RemoveBookmark {
  removeBookmark(contentId: "content_001")
}
```

---

## 7. User Profile Operations

### 7.1 Get Current User

**Query**:
```graphql
query GetCurrentUser {
  currentUser {
    id
    email
    name
    role
    profile {
      bio
      avatar
      preferences
      verified
    }
    statistics {
      totalSearches
      totalBookmarks
      contentScraped
      accountAgeInDays
    }
    createdAt
  }
}
```

### 7.2 Update User Profile

**Mutation**:
```graphql
mutation UpdateUserProfile {
  updateProfile(input: {
    name: "John Updated Doe"
    preferences: {
      theme: "dark"
      language: "en"
      notifications: true
    }
  }) {
    id
    name
    profile {
      preferences
    }
  }
}
```

---

## 8. Real-time Subscriptions

### 8.1 Subscribe to Content Scraped

**Subscription**:
```graphql
subscription OnContentScraped {
  contentScraped(userId: "user_123") {
    id
    title
    url
    excerpt
    sourceType
    analytics {
      sentiment {
        label
        score
      }
      keywords {
        text
        frequency
      }
    }
    createdAt
  }
}
```

### 8.2 Subscribe to Analytics Updates

**Subscription**:
```graphql
subscription OnAnalyticsUpdated {
  analyticsUpdated(userId: "user_123") {
    id
    contentId
    sentiment {
      score
      label
    }
    keywords {
      text
      frequency
    }
    updatedAt
  }
}
```

---

## 9. Error Handling

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `AUTHENTICATION_ERROR` | 401 | Not authenticated |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Example Error Response

```json
{
  "errors": [
    {
      "message": "Rate limit exceeded. Try again in 3600 seconds.",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED",
        "retryAfter": 3600,
        "limit": 100,
        "remaining": 0,
        "reset": "2024-04-16T11:30:00Z"
      }
    }
  ]
}
```

---

## 10. Rate Limiting

### Rate Limits by Tier

| Tier | Requests/Hour | Scrapes/Hour | Queries/Hour |
|------|---------------|--------------|--------------|
| Free | 100 | 10 | 100 |
| Premium | 10,000 | 100 | 10,000 |
| Enterprise | Custom | Custom | Custom |

### Headers in Response

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1618428000
```

---

## 11. Testing the API

### Using cURL

```bash
# Test health
curl http://localhost:4000/health

# Run query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ currentUser { id email name } }"
  }'
```

### Using GraphQL CLI

```bash
# Execute query from file
graphql query-file.gql \
  --endpoint http://localhost:4000/graphql \
  --header "Authorization: Bearer YOUR_TOKEN"
```

### Using Apollo Sandbox

1. Visit `http://localhost:4000/graphql`
2. Paste token in Headers
3. Run queries interactively

---

## 12. Best Practices

### Query Performance
- Use pagination (limit & offset)
- Request only needed fields
- Use aliases for multiple similar queries
- Cache frequently accessed data

### CursorPagination Example:
```graphql
query GetContentPaginated {
  userContent(
    userId: "user_123"
    limit: 20
    offset: 0
  ) {
    edges {
      node { ... }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```

### Combine Queries Efficiently:
```graphql
query GetDashboard {
  currentUser {
    id
    name
    statistics {
      totalSearches
    }
  }
  trendingTopics(limit: 5) {
    name
    score
  }
  searchHistory: searchHistory(limit: 5)
  bookmarks: bookmarks(limit: 5) {
    content { title }
  }
}
```

