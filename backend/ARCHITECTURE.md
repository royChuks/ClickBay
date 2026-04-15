# ClickBay Backend - System Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│              (React/TypeScript - Login, Profile, etc)           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    GraphQL API
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    API Gateway Layer                            │
│  (Express.js + GraphQL Server + Authentication + Rate Limiting) │
└────────────────┬──────────────────────────┬──────────────────────┘
                 │                          │
        ┌────────▼──────────┐    ┌──────────▼────────────┐
        │   GraphQL Layer   │    │  Service Layer        │
        │ (Apollo Server)   │    │  (Business Logic)     │
        └────────┬──────────┘    └──────────┬────────────┘
                 │                          │
        ┌────────▼──────────────────────────▼────────────┐
        │           Core Services                        │
        ├─────────────────────────────────────────────────┤
        │ • Authentication Service                        │
        │ • Content Scraping Service                      │
        │ • GraphRAG Service                              │
        │ • Analytics Service                             │
        │ • Search Service                                │
        │ • Recommendation Service                        │
        └──┬──────────┬──────────┬──────────┬─────────────┘
           │          │          │          │
    ┌──────▼──┐ ┌────▼────┐ ┌────▼──┐ ┌───▼────┐
    │PostgreSQL│ │  Neo4j  │ │ Redis │ │ Vector │
    │   (SQL)  │ │ (Graph) │ │(Cache)│ │   DB   │
    └──────────┘ └─────────┘ └───────┘ └────────┘
           │          │          │          │
    ┌──────▼──────────▼──────────▼──────────▼────┐
    │         Data Persistence Layer             │
    │  (PostgreSQL, Neo4j, Redis, Milvus/Pinecone)
    └───────────────────────────────────────────┘
```

## 1. Layered Architecture

### 1.1 API Gateway Layer
**Responsibility**: Request routing, authentication, rate limiting

**Components**:
- Express.js Server
- JWT Authentication Middleware
- Rate Limiter Middleware
- CORS & Security Headers
- Request/Response Logging

**Key Files**:
```
src/
├── middleware/
│   ├── auth.ts
│   ├── rateLimiter.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── config/
│   └── server.ts
└── index.ts
```

### 1.2 GraphQL Layer
**Responsibility**: Query/Mutation execution, type definitions

**Components**:
- Apollo Server
- GraphQL Schema Definitions
- Resolvers
- Directives
- Subscriptions

**Key Files**:
```
src/
├── graphql/
│   ├── schema/
│   │   ├── user.schema.ts
│   │   ├── content.schema.ts
│   │   ├── analytics.schema.ts
│   │   ├── entity.schema.ts
│   │   └── index.ts
│   ├── resolvers/
│   │   ├── user.resolver.ts
│   │   ├── content.resolver.ts
│   │   ├── analytics.resolver.ts
│   │   └── index.ts
│   └── directives/
│       ├── auth.directive.ts
│       └── rateLimit.directive.ts
```

### 1.3 Service Layer
**Responsibility**: Business logic, orchestration

**Components**:
- UserService
- ContentService
- GraphRAGService
- AnalyticsService
- SearchService
- BookmarkService
- ActivityService

**Key Files**:
```
src/
├── services/
│   ├── user.service.ts
│   ├── content.service.ts
│   ├── graphrag.service.ts
│   ├── analytics.service.ts
│   ├── search.service.ts
│   ├── bookmark.service.ts
│   └── activity.service.ts
```

### 1.4 Data Access Layer
**Responsibility**: Database operations, query building

**Components**:
- User Repository
- Content Repository
- Analytics Repository
- GraphRAG Repository
- Database Connection Management

**Key Files**:
```
src/
├── repositories/
│   ├── user.repository.ts
│   ├── content.repository.ts
│   ├── analytics.repository.ts
│   ├── graphrag.repository.ts
│   └── index.ts
├── models/
│   ├── user.model.ts
│   ├── content.model.ts
│   ├── analytics.model.ts
│   └── index.ts
└── database/
    ├── connection.ts
    └── migrations/
```

### 1.5 Utility & Infrastructure Layer
**Responsibility**: Cross-cutting concerns

**Components**:
- Logger
- Error Handler
- Type Definitions
- Constants
- Utilities
- Queue Management

**Key Files**:
```
src/
├── utils/
│   ├── logger.ts
│   ├── encryption.ts
│   ├── validators.ts
│   └── helpers.ts
├── types/
│   ├── index.ts
│   ├── user.types.ts
│   └── content.types.ts
├── queue/
│   ├── producer.ts
│   ├── consumer.ts
│   └── jobs/
│       ├── scrapeContent.job.ts
│       ├── generateAnalytics.job.ts
│       └── updateGraphKG.job.ts
└── constants/
    └── index.ts
```

---

## 2. Database Architecture

### 2.1 PostgreSQL - Relational Data
**Tables**:
- `users` - User accounts
- `content` - Scraped web content
- `bookmarks` - User bookmarks
- `activities` - User activity log
- `analytics` - Content analytics
- `search_history` - User searches
- `cache_invalidation` - Cache management

**Indexing Strategy**:
```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Content queries
CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_url ON content(url);
CREATE INDEX idx_content_created_at ON content(created_at);
CREATE FULLTEXT INDEX idx_content_fulltext ON content(title, content_text);

-- Bookmark queries
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_content_id ON bookmarks(content_id);

-- Activity queries
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
```

### 2.2 Neo4j - Knowledge Graph
**Node Types**:
```
(:Entity {name, type, confidence})
(:Document {id, url, title})
(:Topic {name, category})
(:Person {name, mentions})
(:Organization {name, industry})
(:Place {name, coordinates})
```

**Relationships**:
```
(:Entity)-[:MENTIONS]->(:Entity)
(:Entity)-[:APPEARS_IN]->(:Document)
(:Document)-[:RELATED_TO]->(:Document)
(:Document)-[:HAS_TOPIC]->(:Topic)
(:Entity)-[:DISCUSSES]->(:Topic)
(:Person)-[:WORKS_AT]->(:Organization)
(:Organization)-[:LOCATED_AT]->(:Place)
```

**Constraints**:
```cypher
CREATE CONSTRAINT unique_entity_name FOR (e:Entity) REQUIRE e.name IS UNIQUE;
CREATE CONSTRAINT unique_document_url FOR (d:Document) REQUIRE d.url IS UNIQUE;
CREATE INDEX entity_type FOR (e:Entity) ON (e.type);
CREATE INDEX document_created FOR (d:Document) ON (d.created_at);
```

### 2.3 Redis - Caching & Sessions
**Usage**:
```
user:{userId}:profile        -> User profile cache
user:{userId}:preferences    -> User preferences
user:{userId}:sessions       -> Active sessions
content:{contentId}:analytics -> Analytics cache
search:trending:topics       -> Trending topics
entity:{entityId}:graph      -> Entity relationship cache
```

### 2.4 Vector Database (Milvus/Pinecone) - Embeddings
**Collections**:
```
content_embeddings:
  - vector: [768 dimensions]
  - metadata: {contentId, userId, created_at}

entity_embeddings:
  - vector: [768 dimensions]
  - metadata: {entityId, type, confidence}

semantic_index:
  - vector: [768 dimensions]
  - metadata: {chunkId, contentId, position}
```

---

## 3. GraphRAG Architecture

### 3.1 Pipeline Flow

```
Content Input
    ↓
[Document Parser] → Extract text, metadata
    ↓
[Text Chunker] → Split into semantic chunks
    ↓
[Entity Extractor] → Extract persons, organizations, places
    ↓
[Relationship Extractor] → Find relationships between entities
    ↓
[Embedding Generator] → Create vector embeddings (OpenAI/Local LLM)
    ↓
[Vector Storage] → Store embeddings in Milvus/Pinecone
    ↓
[Graph Builder] → Create nodes and relationships in Neo4j
    ↓
[Index Builder] → Build full-text and semantic indexes
    ↓
Ready for Retrieval & Generation
```

### 3.2 Knowledge Graph Construction

**Step 1: Entity Extraction**
```typescript
// Extract entities from content
interface ExtractedEntity {
  name: string;
  type: 'PERSON' | 'ORGANIZATION' | 'PLACE' | 'TOPIC';
  confidence: number;
  metadata: Record<string, any>;
}
```

**Step 2: Relationship Building**
```typescript
// Build relationships between entities
interface ExtractedRelationship {
  source: ExtractedEntity;
  target: ExtractedEntity;
  type: string; // MENTIONS, CO_OCCURS, RELATED_TO, etc.
  confidence: number;
  context: string;
}
```

**Step 3: Graph Storage**
- Create nodes in Neo4j
- Add relationships with metadata
- Create indexes for fast traversal

### 3.3 Retrieval & Generation (RAG)

**Retrieval Pipeline**:
```
User Query
    ↓
[Query Embedding] → Generate vector embedding
    ↓
[Vector Search] → Find similar content chunks
    ↓
[Graph Traversal] → Traverse relationships in Neo4j
    ↓
[Context Ranking] → Rank retrieved context by relevance
    ↓
[Context Compilation] → Combine top-k results
    ↓
Generated Context
```

**Generation Pipeline**:
```
Query + Context
    ↓
[LLM Prompt Engineering] → Structure prompt with context
    ↓
[LLM API Call] → Call OpenAI/Local LLM
    ↓
[Response Post-processing] → Validate and format response
    ↓
[Source Attribution] → Add source references
    ↓
Generated Response
```

### 3.4 Semantic Search Implementation

```typescript
interface SemanticSearchOptions {
  query: string;
  limit?: number;
  filters?: {
    entityType?: string;
    dateRange?: { start: Date; end: Date };
    userId?: string;
  };
  useGraphContext?: boolean;
}

async function semanticSearch(options: SemanticSearchOptions) {
  // 1. Generate embedding for query
  const queryEmbedding = await generateEmbedding(options.query);
  
  // 2. Search vector DB for similar chunks
  const similarChunks = await vectorDb.search(queryEmbedding, options.limit);
  
  // 3. Optionally expand with graph relationships
  if (options.useGraphContext) {
    const expandedContext = await expandWithGraphRelationships(similarChunks);
  }
  
  // 4. Return ranked results
  return rankResults(similarChunks);
}
```

---

## 4. Service Layer Details

### 4.1 Authentication Service
```
┌─────────────────────────────────────────┐
│      Authentication Service             │
├─────────────────────────────────────────┤
│ • signup(email, password, name)         │
│ • login(email, password)                │
│ • logout(token)                         │
│ • refreshToken(token)                   │
│ • verifyToken(token)                    │
│ • changePassword(userId, oldPwd, newPwd)│
│ • resetPassword(email)                  │
└─────────────────────────────────────────┘
```

### 4.2 Content Scraping Service
```
┌─────────────────────────────────────────┐
│   Content Scraping Service              │
├─────────────────────────────────────────┤
│ • scrapeURL(url, sourceType)            │
│ • validateURL(url)                      │
│ • parseContent(html)                    │
│ • extractMetadata(content)              │
│ • deduplicateContent(content)           │
│ • archiveContent(contentId)             │
│ • deleteContent(contentId)              │
└─────────────────────────────────────────┘
```

### 4.3 GraphRAG Service
```
┌──────────────────────────────────────────────────┐
│          GraphRAG Service                        │
├──────────────────────────────────────────────────┤
│ • buildKnowledgeGraph(contentId)                 │
│ • extractEntities(text)                          │
│ • generateEmbeddings(texts)                      │
│ • storeInVectorDB(embeddings)                    │
│ • createGraphRelationships(entities)             │
│ • semanticSearch(query, limit)                   │
│ • generateInsights(contentId)                    │
│ • expandContext(chunk, hops)                     │
│ • detectAnomalies(graphData)                     │
└──────────────────────────────────────────────────┘
```

### 4.4 Analytics Service
```
┌──────────────────────────────────────────┐
│      Analytics Service                   │
├──────────────────────────────────────────┤
│ • analyzeSentiment(text)                 │
│ • extractKeywords(text, limit)           │
│ • generateSummary(text)                  │
│ • analyzeReadability(text)               │
│ • detectTopics(text)                     │
│ • trackActivity(userId, action)          │
│ • getUserStats(userId, timeRange)        │
│ • getTrendingTopics(limit, timeRange)    │
└──────────────────────────────────────────┘
```

---

## 5. Data Flow Examples

### 5.1 User Registration Flow
```
User submits signup form
         ↓
GraphQL Mutation: signup(email, password, name)
         ↓
AuthService.signup()
         ├─ Validate input
         ├─ Hash password (bcrypt)
         ├─ Create user in PostgreSQL
         └─ Generate JWT token
         ↓
Return AuthPayload { user, token, refreshToken }
         ↓
Frontend stores token in localStorage
```

### 5.2 Content Scraping & Analysis Flow
```
User submits URL to scrape
         ↓
GraphQL Mutation: scrapeContent(url, sourceType)
         ↓
Queue: Add job to scraping queue (Bull/RabbitMQ)
         ↓
Worker: ContentService.scrapeURL()
         ├─ Fetch URL (Puppeteer/Cheerio)
         ├─ Extract content & metadata
         ├─ Store in PostgreSQL
         └─ Queue GraphRAG job
         ↓
Worker: GraphRAGService.buildKnowledgeGraph()
         ├─ Extract entities
         ├─ Generate embeddings
         ├─ Store embeddings in Vector DB
         ├─ Create graph nodes in Neo4j
         └─ Queue analytics job
         ↓
Worker: AnalyticsService.analyzeContent()
         ├─ Sentiment analysis
         ├─ Keyword extraction
         ├─ Summarization
         └─ Store results in PostgreSQL
         ↓
Cache: Update content analytics cache in Redis
         ↓
Subscription: contentScraped event to user
         ↓
Frontend: Display content with analytics
```

### 5.3 Semantic Search Flow
```
User searches: "AI trends 2024"
         ↓
GraphQL Query: semanticSearch(query, limit)
         ↓
GraphRAGService.semanticSearch()
         ├─ Generate embedding for query
         ├─ Vector search in Milvus
         ├─ Retrieve top-k similar content
         ├─ Traverse relationships in Neo4j (optional)
         ├─ Rank results by relevance
         └─ Add source metadata
         ↓
Cache: Store results in Redis (5 min TTL)
         ↓
Return SearchResult[] with content + relevance scores + source references
         ↓
Frontend: Display ranked results
```

---

## 6. Async Processing with Message Queues

### 6.1 Job Queue Architecture
```
┌──────────────────┐
│   GraphQL API    │
└────────┬─────────┘
         │ (enqueue job)
         ↓
┌──────────────────────┐
│  Message Queue       │
│  (Bull/RabbitMQ)     │
└────────┬─────────────┘
         │
    ┌────┴─────┬──────────┬──────────┐
    │           │          │          │
    ↓           ↓          ↓          ↓
┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│Worker 1│ │Worker 2│ │Worker 3│ │Worker N  │
│Scraper │ │GraphRAG│ │Analyzer│ │...       │
└───┬────┘ └───┬────┘ └───┬────┘ └────┬──────┘
    │          │          │           │
    └──────────┼──────────┼───────────┘
               │          │
               ↓          ↓
      ┌─────────────────────────────┐
      │    Data Persistence         │
      │ (PostgreSQL, Neo4j, Redis)  │
      └─────────────────────────────┘
```

### 6.2 Job Types
```
scrapeContent
  ├─ Input: { url, userId, sourceType }
  ├─ Worker: ContentService
  └─ Retry: 3 attempts

generateGraphKG
  ├─ Input: { contentId }
  ├─ Worker: GraphRAGService
  └─ Retry: 2 attempts

analyzeContent
  ├─ Input: { contentId }
  ├─ Worker: AnalyticsService
  └─ Retry: 2 attempts

generateEmbeddings
  ├─ Input: { texts }
  ├─ Worker: GraphRAGService
  └─ Retry: 3 attempts

sendNotification
  ├─ Input: { userId, message }
  ├─ Worker: NotificationService
  └─ Retry: 5 attempts
```

---

## 7. Caching Strategy

### 7.1 Cache Layers
```
L1: In-Memory Cache (node-cache)
    ├─ TTL: 5 minutes
    └─ Size: 100 MB

L2: Redis Cache
    ├─ TTL: Varies by entity
    ├─ User profiles: 1 hour
    ├─ Content analytics: 30 minutes
    ├─ Search results: 5 minutes
    └─ Trending topics: 15 minutes

L3: Database Query Cache
    └─ Database indexes + query optimization
```

### 7.2 Cache Invalidation
```
When user updates profile:
  ├─ Invalidate user:{userId}:profile
  └─ Invalidate user:{userId}:preferences

When content is scraped:
  ├─ Invalidate search results
  └─ Queue rebuild of trending topics

When entity is added to graph:
  ├─ Invalidate entity:{entityId}:graph
  └─ Invalidate related search results
```

---

## 8. Security Architecture

### 8.1 Authentication Flow
```
Browser
    │
    ├─ POST /graphql { query: signup(...) }
    │
    ↓
API Gateway
    ├─ Parse request
    ├─ Validate input (XSS, SQLi prevention)
    └─ Pass to GraphQL
    
GraphQL Server
    ├─ Resolve mutation
    ├─ Call AuthService.signup()
    └─ Generate JWT
    
Response
    ├─ token (Access token, 15 min expiry)
    ├─ refreshToken (Refresh token, 7 day expiry)
    └─ user (User object)

Browser
    ├─ Store token in httpOnly cookie (secure)
    ├─ Store refreshToken in httpOnly cookie
    └─ Include token in Authorization header for requests
```

### 8.2 Authorization Flow
```
Request with token
    │
    ├─ Headers: { Authorization: "Bearer <token>" }
    │
    ↓
GraphQL Middleware
    ├─ Extract token from header
    ├─ Verify JWT signature
    ├─ Validate expiry
    └─ Extract userId from payload
    
GraphQL Directive (@auth)
    ├─ Check if user is authenticated
    ├─ Check user permissions/roles
    └─ Allow/deny access

Resolver
    ├─ Access user context (userId, role)
    ├─ Execute query/mutation
    └─ Return results (filtered by user context)
```

---

## 9. Error Handling Strategy

```
┌──────────────────────────────────┐
│         Error Occurs             │
└─────────────┬──────────────────┘
              │
              ├─ Validation Error
              │  ├─ Return 400 with error details
              │  └─ Log for monitoring
              │
              ├─ Authentication Error
              │  ├─ Return 401
              │  └─ Refresh token if expired
              │
              ├─ Authorization Error
              │  ├─ Return 403
              │  └─ Log security event
              │
              ├─ Not Found Error
              │  ├─ Return 404
              │  └─ Suggest alternatives
              │
              ├─ Rate Limit Error
              │  ├─ Return 429
              │  ├─ Include retry-after header
              │  └─ Queue request if possible
              │
              ├─ Service Error
              │  ├─ Return 503 Service Unavailable
              │  ├─ Circuit breaker pattern
              │  └─ Retry with exponential backoff
              │
              └─ Unexpected Error
                 ├─ Return 500 Internal Server Error
                 ├─ Log full error details
                 ├─ Send to error tracking (Sentry)
                 └─ Alert operations team
```

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Load Balancer (Nginx/HAProxy)       │
└────────┬────────────────────────────────┬──┘
         │                                │
    ┌────▼─────┐                     ┌────▼─────┐
    │  API App  │                     │  API App  │
    │ Container │                     │ Container │
    └────┬─────┘                     └────┬─────┘
         │                                │
    ┌────▼────┐                      ┌────▼────┐
    │ Worker  │                      │ Worker  │
    │ Queue   │                      │ Queue   │
    └────┬────┘                      └────┬────┘
         │                                │
         └────────────┬───────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    ┌───▼──┐    ┌────▼────┐   ┌──▼────┐
    │  PG  │    │  Neo4j  │   │ Redis │
    └──────┘    └─────────┘   └───────┘
    
    ┌──────────────────────────────┐
    │  Vector DB (Milvus/Pinecone)│
    └──────────────────────────────┘
```

---

## 11. Monitoring & Observability

### Metrics to Monitor
- Request latency (p50, p95, p99)
- Error rate and error distribution
- Cache hit/miss rates
- Database query performance
- GraphQL query complexity
- Scraping success/failure rates
- Queue depth and processing time
- API request rate and tokens
- Vector DB latency
- Neo4j traversal performance

### Logging Strategy
```json
{
  "timestamp": "2024-04-15T10:30:00Z",
  "level": "INFO",
  "service": "graphql-api",
  "userId": "user_123",
  "requestId": "req_456",
  "operation": "querySemantic_search",
  "duration_ms": 145,
  "status": "success",
  "metadata": {
    "resultsCount": 5,
    "cacheHit": true
  }
}
```

---

## Key Design Principles

1. **Separation of Concerns** - Each layer has distinct responsibility
2. **Scalability** - Horizontal scaling via async workers and caching
3. **Performance** - Multi-tiered caching, indexing, and optimization
4. **Security** - Defense in depth with validation, authentication, authorization
5. **Reliability** - Error handling, retries, circuit breakers, monitoring
6. **Maintainability** - TypeScript, structured logging, clear abstractions
7. **Knowledge Integration** - GraphRAG for semantic understanding
