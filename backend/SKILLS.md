# ClickBay Backend - Technical Skills & Best Practices

## Overview
This document outlines the technical skills, best practices, and implementation patterns for developing the ClickBay backend with GraphQL and GraphRAG.

---

## 1. GraphQL Implementation Skills

### 1.1 Schema Design
**Key Principles**:
- Clear, descriptive type names
- Proper nullable/non-nullable field definitions
- Logical grouping of fields
- Version management for schema changes

**Best Practices**:
```typescript
// ✅ GOOD: Clear, descriptive schema
interface User {
  id: ID!                    // Non-null, required
  email: String!             // Required email
  name: String!              // Required name
  profile: UserProfile       // Nullable related type
  statistics: UserStatistics // Nested related data
  createdAt: DateTime!       // Always timestamp required
}

// ❌ BAD: Vague names, inconsistent nullability
interface Usr {
  i: String                  // Unclear, nullable
  e: String                  // Single letter, confusing
  d: JSON                     // Too generic
}
```

### 1.2 Resolver Implementation
**Key Skills**:
- Efficient data loading (avoid N+1 queries)
- Proper error handling
- Context management
- DataLoader for batching

**Pattern**:
```typescript
// ✅ GOOD: Efficient resolver with batching
const contentResolvers = {
  Query: {
    async content(_, { id }, context) {
      // Use DataLoader to batch database queries
      return context.loaders.contentLoader.load(id);
    },
    async searchContent(_, { query, limit }, context) {
      // Pagination and filtering at resolver level
      const results = await searchService.search(
        query,
        { limit, userId: context.userId }
      );
      return results;
    }
  },
  
  Content: {
    // Resolve related data efficiently
    async analytics(content, _, context) {
      return context.loaders.analyticsLoader.load(content.id);
    }
  }
};

// ❌ BAD: N+1 query problem
const badResolvers = {
  Query: {
    async users() {
      return db.query('SELECT * FROM users');
    }
  },
  User: {
    async content(user) {
      // This runs for EVERY user!
      return db.query('SELECT * FROM content WHERE user_id = ?', [user.id]);
    }
  }
};
```

### 1.3 Query Complexity & Performance
**Skills Required**:
- Query depth limiting
- Query complexity analysis
- Field-level timeout
- Reasonable pagination

**Implementation**:
```typescript
// Query complexity rules
const complexityEstimator = {
  Query: {
    semanticSearch: () => 5,           // Moderate complexity
    userContent: (args) => args.limit * 2, // Scale with limit
  },
  Content: {
    analytics: () => 3,                // Accessing sub-field
    entities: (args) => args.limit,    // Scale with data
  }
};

// Validate query before execution
function validateQueryComplexity(query, maxComplexity = 50) {
  const complexity = getComplexity(
    parseQuery(query),
    complexityEstimator
  );
  
  if (complexity > maxComplexity) {
    throw new Error(`Query too complex: ${complexity}/${maxComplexity}`);
  }
}
```

### 1.4 Real-time Subscriptions
**Skills**:
- WebSocket connection management
- Event broadcasting
- Memory-efficient streaming
- Cleanup and disconnection handling

**Pattern**:
```typescript
const subscriptionResolvers = {
  Subscription: {
    contentScraped: {
      async *subscribe(_, { userId }, { pubSub }) {
        // Subscribe to content scraping events
        yield* pubSub.asyncIterator([`CONTENT_SCRAPED:${userId}`]);
      },
      resolve: (content) => content
    }
  }
};

// Publishing events
async function publishContentScraped(userId, content) {
  await pubSub.publish(`CONTENT_SCRAPED:${userId}`, {
    contentScraped: content
  });
}
```

---

## 2. GraphRAG Implementation Skills

### 2.1 Knowledge Graph Construction

**Key Concepts**:
- Entity extraction and linking
- Relationship identification
- Graph storage and querying
- Embedding management

**Implementation Algorithm**:
```typescript
interface GraphBuildingStep {
  name: string;
  execute: (content: string) => Promise<any>;
  retries: number;
  timeout: number;
}

const graphBuildingPipeline: GraphBuildingStep[] = [
  {
    name: 'Text Preprocessing',
    execute: async (text) => {
      // Clean, normalize, chunk text
      return splitIntoSemanticChunks(text);
    },
    retries: 1,
    timeout: 5000
  },
  {
    name: 'Entity Extraction',
    execute: async (chunks) => {
      // Extract entities: people, orgs, places, topics
      const entities = await nlpService.extractEntities(chunks);
      return entities.filter(e => e.confidence > 0.7);
    },
    retries: 2,
    timeout: 10000
  },
  {
    name: 'Relationship Extraction',
    execute: async (entities) => {
      // Find relationships between entities
      const relationships = await nlpService.extractRelationships(entities);
      return relationships;
    },
    retries: 2,
    timeout: 15000
  },
  {
    name: 'Embedding Generation',
    execute: async (texts) => {
      // Generate vector embeddings
      const embeddings = await embeddingService.generateEmbeddings(texts);
      return embeddings;
    },
    retries: 3,
    timeout: 20000
  },
  {
    name: 'Graph Storage',
    execute: async (graphData) => {
      // Store in Neo4j
      const neo4jResult = await neo4jService.storeGraph(graphData);
      return neo4jResult;
    },
    retries: 2,
    timeout: 10000
  }
];
```

### 2.2 Entity Extraction Best Practices

**Techniques**:
- Named Entity Recognition (NER)
- Relation Extraction (RE)
- Entity Linking (EL)
- Confidence scoring

**Example**:
```typescript
interface ExtractedEntity {
  name: string;
  type: EntityType;
  confidence: number;        // 0-1
  startPos: number;          // Position in text
  endPos: number;
  context: string;           // surrounding text
  linkedEntity?: string;     // WikiData/DBpedia ID
}

class EntityExtractionService {
  async extractEntities(text: string): Promise<ExtractedEntity[]> {
    // 1. Use Pre-trained NER model
    const nlpResult = await this.runNERModel(text);
    
    // 2. Post-process and link entities
    const linkedEntities = await this.linkEntitiesToKB(nlpResult);
    
    // 3. Filter by confidence
    return linkedEntities.filter(e => e.confidence > 0.5);
  }
  
  private async linkEntitiesToKB(entities: any[]) {
    // Link to knowledge bases: WikiData, DBpedia, Crunchbase
    return Promise.all(
      entities.map(async (entity) => ({
        ...entity,
        linkedEntity: await this.findInKB(entity.name, entity.type)
      }))
    );
  }
}
```

### 2.3 Semantic Search Implementation

**Skills**:
- Vector space modeling
- Cosine similarity/distance metrics
- Hybrid search (keyword + semantic)
- Context ranking

**Pattern**:
```typescript
class SemanticSearchService {
  async search(query: string, options: SearchOptions) {
    // 1. Generate embedding for query
    const queryEmbedding = await embeddingService.embed(query);
    
    // 2. Vector search - find similar content chunks
    const vectorResults = await vectorDb.search(
      queryEmbedding,
      {
        limit: options.limit * 2,  // Get extra results
        filters: options.filters
      }
    );
    
    // 3. Optionally expand with graph relationships
    let results = vectorResults;
    if (options.useGraphContext) {
      results = await this.expandWithGraphContext(vectorResults);
    }
    
    // 4. Re-rank by combination of scores
    results = this.rankResults(results, {
      vectorScoreWeight: 0.7,
      graphScoreWeight: 0.3
    });
    
    return results.slice(0, options.limit);
  }
  
  private async expandWithGraphContext(results: SearchResult[]) {
    // For each result, fetch related entities from graph
    return Promise.all(
      results.map(async (result) => ({
        ...result,
        relatedEntities: await neo4j.getRelatedEntities(
          result.entities,
          { depth: 2 }
        )
      }))
    );
  }
  
  private rankResults(
    results: SearchResult[],
    weights: { vectorScoreWeight: number; graphScoreWeight: number }
  ) {
    return results
      .map(result => ({
        ...result,
        relevanceScore:
          (result.similarity * weights.vectorScoreWeight) +
          ((result.graphScore || 0) * weights.graphScoreWeight)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
```

### 2.4 RAG Pipeline (Retrieval-Augmented Generation)

**Pipeline Steps**:
```typescript
class RAGPipeline {
  async generateInsights(contentId: string, query: string) {
    // 1. RETRIEVAL: Get relevant context
    const retrievedContext = await this.retrieveContext(contentId, query);
    
    // 2. RANKING: Re-rank by relevance
    const rankedContext = this.rankContext(retrievedContext);
    
    // 3. CONTEXT COMPILATION: Format for LLM
    const compiledContext = this.compileContext(rankedContext);
    
    // 4. PROMPT ENGINEERING: Craft the prompt
    const prompt = this.engineerPrompt(query, compiledContext);
    
    // 5. GENERATION: Call LLM
    const response = await llmService.generate(prompt);
    
    // 6. POST-PROCESSING: Validate and format
    const insights = this.postProcess(response);
    
    // 7. ATTRIBUTION: Add sources
    return this.addSourceAttribution(insights, rankedContext);
  }
  
  private async retrieveContext(contentId: string, query: string) {
    // Use semantic search to retrieve relevant chunks
    const semanticResults = await this.semanticSearch(query);
    
    // Also use graph traversal for entity-based context
    const graphContext = await this.getGraphContext(contentId);
    
    return { semantic: semanticResults, graph: graphContext };
  }
  
  private rankContext(context: any) {
    // Rank by relevance and remove redundancy
    return context.semantic
      .filter((item, index, array) => 
        !this.isDuplicate(item, array.slice(0, index))
      )
      .slice(0, 10);  // Keep top-10 relevant items
  }
  
  private addSourceAttribution(insights: string, context: any) {
    // Add source references to generated insights
    const sources = context.map(c => ({
      title: c.content.title,
      url: c.content.url,
      relevanceScore: c.similarity
    }));
    
    return {
      insights,
      sources,
      generatedAt: new Date()
    };
  }
}
```

---

## 3. Database Skills

### 3.1 PostgreSQL Optimization

**Key Skills**:
- Indexing strategies
- Query optimization
- Normalization
- Connection pooling

**Best Practices**:
```typescript
// ✅ GOOD: Proper indexing for search
CREATE INDEX idx_content_user_created 
  ON content(user_id, created_at DESC);

CREATE INDEX idx_content_fulltext 
  ON content USING GIN(to_tsvector('english', content_text));

// Use prepared statements
const getContentByUser = db.prepare(`
  SELECT id, title, url, created_at
  FROM content
  WHERE user_id = $1 AND created_at > $2
  ORDER BY created_at DESC
  LIMIT $3
`);

// Connection pooling
const pool = new Pool({
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Timeout
  connectionTimeoutMillis: 2000
});
```

### 3.2 Neo4j Graph Querying

**Skills**:
- Cypher query optimization
- Index management
- Relationship traversal
- Graph algorithms

**Examples**:
```cypher
// Efficient entity relationship query
MATCH (e1:Entity {name: $entityName})
-[r:MENTIONS|APPEARS_IN|RELATED_TO]->(e2:Entity)
WHERE r.confidence > 0.5
RETURN e2, count(r) as relationshipCount
ORDER BY relationshipCount DESC
LIMIT 10;

// Find related documents
MATCH (d1:Document {id: $docId})
-[:HAS_TOPIC]->(t:Topic)
<-[:HAS_TOPIC]-(d2:Document)
RETURN d2, count(t) as commonTopics
ORDER BY commonTopics DESC
LIMIT 5;

// Multi-hop entity relationships
MATCH path = (e1:Entity {name: $sourceName})
-[*1..3]->(e2:Entity {type: $targetType})
WHERE all(r in relationships(path) WHERE r.confidence > 0.6)
RETURN path, length(path) as hops
ORDER BY hops ASC;
```

### 3.3 Vector Database Operations

**Skills**:
- Vector embedding management
- Similarity search optimization
- Batch operations
- Index selection

**Example**:
```typescript
class VectorDBOperations {
  async insertEmbeddings(chunks: TextChunk[]) {
    // Batch insert for performance
    const vectors = chunks.map(chunk => ({
      id: chunk.id,
      vector: chunk.embedding,  // 768-dim vector
      metadata: {
        contentId: chunk.contentId,
        chunkIndex: chunk.index,
        created_at: new Date()
      }
    }));
    
    await vectorDb.upsert(vectors, { batchSize: 100 });
  }
  
  async semanticSearch(
    queryVector: number[],
    options: {
      limit: number;
      filters?: Record<string, any>;
      minSimilarity?: number;
    }
  ) {
    const results = await vectorDb.search(queryVector, {
      topK: options.limit,
      filter: options.filters,
      includeMetadata: true,
      includeValues: false  // Don't return embeddings
    });
    
    return results.filter(
      r => r.score >= (options.minSimilarity || 0.7)
    );
  }
}
```

---

## 4. Security Skills

### 4.1 Authentication & Authorization

**Patterns**:
- JWT token management
- Role-based access control
- Directive-based authorization
- Permission verification

**Implementation**:
```typescript
// JWT token generation
function generateTokens(userId: string, role: UserRole) {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }  // Short expiry
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// GraphQL Authorization Directive
@Directive('@auth(role: UserRole)')
class AuthDirective {
  visitFieldDefinition(field, context) {
    const originalResolver = field.resolve;
    
    field.resolve = async (parent, args, context, info) => {
      // Check authentication
      if (!context.userId) {
        throw new AuthenticationError('Not authenticated');
      }
      
      // Check authorization
      const requiredRole = directive.role;
      if (requiredRole && context.userRole !== requiredRole) {
        throw new AuthorizationError('Insufficient permissions');
      }
      
      return originalResolver(parent, args, context, info);
    };
  }
}
```

### 4.2 Input Validation

**Skills**:
- Field-level validation
- Custom validators
- Sanitization
- Type checking

**Pattern**:
```typescript
// Validation rules
const validationRules = {
  signup: (input: SignupInput) => {
    const errors: ValidationError[] = [];
    
    // Email validation
    if (!isValidEmail(input.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
    
    // Password strength
    if (input.password.length < 8) {
      errors.push({ field: 'password', message: 'Min 8 characters' });
    }
    if (!/[A-Z]/.test(input.password)) {
      errors.push({ field: 'password', message: 'Needs uppercase' });
    }
    
    // Name validation
    if (input.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Min 2 characters' });
    }
    
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }
};
```

---

## 5. Performance Optimization Skills

### 5.1 Caching Strategy

**Techniques**:
- Multi-tier caching
- Cache invalidation
- Warm-up strategies
- TTL management

**Implementation**:
```typescript
class CachingService {
  private l1Cache = new NodeCache({ stdTTL: 300 });  // 5 min in-memory
  private l2Cache = redis;                           // Redis layer
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // L1: Check in-memory cache
    const l1Result = this.l1Cache.get<T>(key);
    if (l1Result) return l1Result;
    
    // L2: Check Redis
    const l2Result = await this.l2Cache.get(key);
    if (l2Result) {
      this.l1Cache.set(key, l2Result);
      return JSON.parse(l2Result);
    }
    
    // Miss: Fetch and cache
    const value = await fetcher();
    await this.set(key, value, 1800);  // 30 min TTL
    return value;
  }
  
  async set<T>(key: string, value: T, ttl: number) {
    this.l1Cache.set(key, value, ttl);
    await this.l2Cache.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string) {
    // Invalidate in-memory cache
    this.l1Cache.keys().forEach(key => {
      if (this.matchesPattern(key, pattern)) {
        this.l1Cache.del(key);
      }
    });
    
    // Invalidate Redis cache
    const keys = await this.l2Cache.keys(pattern);
    if (keys.length > 0) {
      await this.l2Cache.del(...keys);
    }
  }
}
```

### 5.2 Database Query Optimization

**Techniques**:
- Batch operations
- Projection (select specific fields)
- Pagination
- Connection pooling

**Example**:
```typescript
// ✅ GOOD: Efficient batch query
const getContentBatch = async (contentIds: string[]) => {
  return db.query(
    'SELECT id, title, url FROM content WHERE id = ANY($1)',
    [contentIds]
  );
};

// ✅ GOOD: Pagination
const getPaginatedContent = async (
  userId: string,
  limit: number,
  offset: number
) => {
  return db.query(
    `SELECT id, title, url, created_at
     FROM content
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
};

// ❌ BAD: Fetching all fields
const getAllContent = async () => {
  return db.query('SELECT * FROM content');  // Wasteful!
};
```

---

## 6. Monitoring & Observability Skills

### 6.1 Structured Logging

**Pattern**:
```typescript
interface LogEntry {
  timestamp: ISO8601;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  service: string;
  operation: string;
  userId?: string;
  duration_ms: number;
  status: 'success' | 'error' | 'partial';
  metadata?: Record<string, any>;
}

const logger = {
  info: (operation: string, data: any) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      operation,
      ...data
    }));
  },
  
  error: (operation: string, error: Error, context: any) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      operation,
      error: error.message,
      stack: error.stack,
      ...context
    }));
  }
};
```

### 6.2 Performance Metrics

**Metrics to Track**:
- Query execution time (p50, p95, p99)
- Cache hit rate
- Error rate by operation
- Vector DB latency
- Neo4j traversal time
- API response time

---

## 7. Testing Skills

### 7.1 Unit Tests

```typescript
describe('GraphRAGService', () => {
  let service: GraphRAGService;
  let mockNlp: MockNLPService;
  
  beforeEach(() => {
    mockNlp = new MockNLPService();
    service = new GraphRAGService(mockNlp);
  });
  
  it('should extract entities with high confidence', async () => {
    const text = 'Steve Jobs founded Apple Inc.';
    const entities = await service.extractEntities(text);
    
    expect(entities).toHaveLength(2);
    expect(entities[0]).toMatchObject({
      name: 'Steve Jobs',
      type: 'PERSON',
      confidence: expect.any(Number)
    });
  });
});
```

### 7.2 Integration Tests

```typescript
describe('Content Scraping Pipeline', () => {
  it('should scrape, analyze, and store content', async () => {
    const url = 'https://example.com/article';
    const result = await scrapeAndAnalyze(url);
    
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('analytics');
    expect(result.analytics.keywords).toHaveLength(expect.any(Number));
  });
});
```

---

## Summary of Key Skills

| Area | Key Skills |
|------|------------|
| **GraphQL** | Schema design, Resolvers, DataLoader, Subscriptions |
| **GraphRAG** | Entity extraction, Embeddings, Graph DB, RAG pipeline |
| **Database** | PostgreSQL optimization, Neo4j Cypher, Vector search |
| **Backend** | Node.js, TypeScript, Express, async patterns |
| **Security** | JWT, RBAC, Input validation, Encryption |
| **Performance** | Caching, Indexing, Query optimization, Batching |
| **DevOps** | Docker, CI/CD, Monitoring, Logging |
| **Testing** | Unit tests, Integration tests, Load testing |

---

## Learning Resources

- **GraphQL**: apollo.dev/docs
- **Neo4j**: neo4j.com/developer
- **LLM/RAG**: huggingface.co, pinecone.io
- **Performance**: database.guide, explain.depesz.com
- **Security**: owasp.org, auth0.com

