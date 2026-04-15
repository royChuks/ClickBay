# ClickBay Backend - Documentation & Development Guide

## 📋 Overview

ClickBay Backend is a **GraphQL-powered API** built with **Node.js/TypeScript** that leverages **GraphRAG** (Graph Retrieval-Augmented Generation) for intelligent content analysis and semantic search.

**Stack**:
- **API**: GraphQL (Apollo Server) + Express.js
- **Databases**: PostgreSQL, Neo4j, Redis
- **Vector Search**: Milvus/Pinecone 
- **LLM**: OpenAI API
- **Async**: Bull/RabbitMQ
- **Language**: TypeScript + Node.js

---

## 📚 Documentation Files

### 1. **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Project Requirements
   - Functional requirements (user management, scraping, analytics)
   - Technical requirements (stack, performance, security)
   - GraphQL specification
   - GraphRAG architecture
   - Data models and API rate limiting
   - **When to read**: Understanding what the backend needs to do

### 2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System Architecture & Design
   - Detailed layered architecture
   - Database architecture (PostgreSQL, Neo4j, Redis, Vector DB)
   - GraphRAG pipeline implementation
   - Service layer details
   - Data flow examples (registration, scraping, search)
   - Async processing with message queues
   - Caching strategy
   - Security architecture
   - Error handling patterns
   - Deployment architecture
   - **When to read**: Understanding how components interact

### 3. **[GRAPHQL_SCHEMA.md](./GRAPHQL_SCHEMA.md)** - GraphQL API Schema
   - Complete schema definition
   - All Query, Mutation, and Subscription types
   - Input types and object types
   - Enums and scalars
   - Example queries for all major operations
   - Pagination patterns
   - Error response formats
   - Rate limiting info
   - **When to read**: Implementing resolvers and testing API

### 4. **[SKILLS.md](./SKILLS.md)** - Technical Skills & Best Practices
   - GraphQL implementation skills
   - GraphRAG implementation patterns
   - Database skills (PostgreSQL, Neo4j, Vector DB)
   - Security best practices
   - Performance optimization techniques
   - Monitoring & observability
   - Testing strategies
   - Learning resources
   - **When to read**: Understanding how to implement features correctly

### 5. **[SETUP.md](./SETUP.md)** - Installation & Development Setup
   - Prerequisites and dependencies
   - Docker Compose configuration
   - Database initialization (PostgreSQL, Neo4j, Redis)
   - Environment setup
   - Project structure
   - Development server startup
   - Testing setup
   - Code quality tools (ESLint, Prettier)
   - GraphQL Apollo Server configuration
   - Deployment preparation
   - Troubleshooting guide
   - **When to read**: Setting up your development environment

### 6. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API Reference
   - Authentication workflow
   - Content scraping operations
   - Search operations (full-text and semantic)
   - Knowledge graph & entity operations
   - Analytics and insights
   - Bookmark management
   - User profile operations
   - Real-time subscriptions
   - Error codes and handling
   - Rate limiting details
   - cURL and testing examples
   - Best practices for API usage
   - **When to read**: Using the API, writing queries, testing

---

## 🚀 Quick Start

### 1. **Clone & Install**
```bash
cd clickbay/backend
npm install
```

### 2. **Start Services** (Docker)
```bash
docker-compose up -d
```

### 3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. **Initialize Database**
```bash
npm run db:migrate
npm run neo4j:init
```

### 5. **Start Dev Server**
```bash
npm run dev
```

📍 GraphQL API: `http://localhost:4000/graphql`

---

## 📖 Reading Roadmap

### For New Developers:
1. Start with **SETUP.md** - Get your environment ready
2. Read **ARCHITECTURE.md** - Understand the system
3. Review **REQUIREMENTS.md** - Know what to build
4. Explore **SKILLS.md** - Learn implementation patterns
5. Use **GRAPHQL_SCHEMA.md** & **API_DOCUMENTATION.md** - Reference while coding

### For System Architects:
1. **ARCHITECTURE.md** - System design overview
2. **REQUIREMENTS.md** - Detailed specifications
3. **SKILLS.md** - Technical implementation details

### For API Consumers:
1. **API_DOCUMENTATION.md** - Query/Mutation examples
2. **GRAPHQL_SCHEMA.md** - Type definitions
3. **SETUP.md** - Local testing setup

---

## 🏗️ Backend Architecture at a Glance

```
┌─────────────────────────────────────────┐
│         GraphQL API (Apollo)            │
├─────────────────────────────────────────┤
│  Queries │ Mutations │ Subscriptions    │
├─────────────────────────────────────────┤
│       Service Layer (Business Logic)    │
├─────────────────────────────────────────┤
│    Data Access Layer (Repositories)     │
├─────────────────────────────────────────┤
│  PostgreSQL │ Neo4j │ Redis │ Vector DB│
└─────────────────────────────────────────┘
        Async Jobs (Bull Queue)
        GraphRAG Pipeline
```

---

## 🔑 Key Features

### 1. **User Authentication & Authorization**
- JWT token-based auth
- Role-based access control (RBAC)
- Secure password hashing

### 2. **Content Scraping & Management**
- Scrape content from URLs
- Extract metadata and normalize
- Deduplication and archiving

### 3. **GraphRAG Integration**
- Build knowledge graphs automatically
- Entity extraction and linking
- Semantic relationship discovery
- Multi-hop graph traversal

### 4. **Intelligent Search**
- Full-text search with filters
- Semantic search using embeddings
- Graph-augmented context retrieval
- Relevance ranking

### 5. **Analytics & Insights**
- Sentiment analysis
- Keyword extraction
- Entity recognition
- Content summarization
- Trending topics detection

### 6. **Real-time Capabilities**
- WebSocket subscriptions
- Event-driven updates
- Live analytics streaming

---

## 🛠️ Technology Stack Breakdown

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **API** | Apollo Server + Express | GraphQL endpoint & routing |
| **Language** | TypeScript + Node.js | Type-safe backend development |
| **Relational DB** | PostgreSQL | User data, content metadata |
| **Graph DB** | Neo4j | Knowledge graph storage |
| **Cache** | Redis | Session & query caching |
| **Vector Search** | Milvus/Pinecone | Semantic search embeddings |
| **LLM** | OpenAI API | Embeddings & RAG generation |
| **Async** | Bull + Redis | Job queue & background processing |
| **Auth** | JWT + bcrypt | Authentication & authorization |
| **Monitoring** | Structured logging + Sentry | Observability & error tracking |

---

## 📊 System Capabilities

### Performance
- **API Response Time**: < 200ms for GraphQL queries
- **Database Query Latency**: < 100ms average
- **Vector Search**: < 50ms for semantic queries
- **Concurrent Connections**: 1000+ users

### Scalability
- Horizontal auto-scaling for API servers
- Database replication & failover
- Distributed caching (Redis cluster)
- Async job processing (Bull workers)

### Reliability
- 99.5% uptime SLA
- Graceful error handling
- Circuit breaker pattern for external APIs
- Comprehensive logging & monitoring

### Security
- JWT token-based authentication
- HTTPS/TLS encryption
- SQL injection prevention (parameterized queries)
- CORS configuration
- Rate limiting (100-10k requests/hour)

---

## 📝 File Organization

```
backend/
├── REQUIREMENTS.md          # Functional & technical specs
├── ARCHITECTURE.md          # System design & components
├── GRAPHQL_SCHEMA.md        # GraphQL type definitions
├── SKILLS.md               # Implementation patterns
├── SETUP.md                # Installation guide
├── API_DOCUMENTATION.md    # API reference & examples
├── README.md               # This file
│
├── src/
│   ├── index.ts            # Server entry point
│   ├── graphql/
│   │   ├── schema/         # Type definitions
│   │   ├── resolvers/      # Query/Mutation handlers
│   │   └── directives/     # Custom directives
│   ├── services/           # Business logic
│   ├── repositories/       # Data access
│   ├── database/           # DB connections
│   ├── middleware/         # Express middleware
│   ├── queue/              # Job processing
│   ├── types/              # TypeScript types
│   ├── utils/              # Helper functions
│   └── constants/          # App constants
│
├── tests/                  # Test suites
│   ├── unit/              # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/          # Test data
│
├── scripts/               # Utility scripts
│   ├── migrate.ts         # Run migrations
│   ├── seed.ts            # Seed data
│   └── neo4j-init.ts      # Initialize graph DB
│
├── docker-compose.yml     # Local services
├── Dockerfile             # Container image
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── .env.example           # Environment template
```

---

## 🔄 Development Workflow

### 1. Feature Development
```bash
git checkout -b feature/my-feature
nano src/services/my.service.ts
npm run dev
# Test in GraphQL Playground
```

### 2. Testing
```bash
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### 3. Code Quality
```bash
npm run lint              # Check linting
npm run format            # Auto-format
npm run type-check        # TypeScript check
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

---

## 🧪 Testing Strategy

### Unit Tests
- Test services in isolation with mocks
- File: `src/services/__tests__/user.service.test.ts`

### Integration Tests
- Test resolver + service + database interaction
- File: `tests/integration/content.integration.test.ts`

### Mutation Tests
- Verify GraphQL mutations work correctly
- File: `tests/mutations/scrapeContent.mutation.test.ts`

### Load Tests
- Test performance under load
- File: `tests/load/search.load.test.ts`

---

## 📈 Monitoring & Debugging

### View Logs
```bash
# Development
npm run dev

# Production
docker logs clickbay-api
```

### Database Debugging
```bash
# PostgreSQL
psql -h localhost -U clickbay_user -d clickbay_dev
\dt                    # List tables
SELECT * FROM users;   # Query

# Neo4j
# Browser: http://localhost:7474
# Query: MATCH (n) RETURN n LIMIT 25;

# Redis
redis-cli
KEYS *
GET user:123:profile
```

### GraphQL Debugging
- Apollo Studio: `http://localhost:4000/graphql`
- Query complexity analyzer
- Performance tracing
- Error tracking (Sentry integration)

---

## 🚢 Deployment

### Development
```bash
npm run dev
# Runs on http://localhost:4000
```

### Staging/Production
```bash
npm run build
docker build -t clickbay-backend:latest .
docker run -p 4000:4000 --env-file .env clickbay-backend:latest
```

### Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

## 🤝 Contributing

### Code Standards
- Follow TypeScript strict mode
- Use meaningful variable names
- Add JSDoc comments for public functions
- Write unit tests for new features
- Update documentation

### Commit Message Format
```
feat: Add new feature
fix: Fix bug in service
docs: Update API documentation
test: Add unit tests
refactor: Restructure database layer
```

---

## 📚 Additional Resources

- **GraphQL**: [apollo.dev](https://www.apollographql.com/docs/apollo-server/)
- **Neo4j**: [neo4j.com/developer](https://neo4j.com/developer/)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org/)
- **RAG**: [llamaindex.ai](https://www.llamaindex.ai/)
- **Embeddings**: [openai.com/embeddings](https://platform.openai.com/docs/guides/embeddings)

---

## 🆘 Troubleshooting

### Services Won't Start
1. Check Docker: `docker ps`
2. Review logs: `docker-compose logs`
3. Verify ports: `netstat -tuln | grep 4000`

### Database Migration Failed
1. Check migration file syntax
2. Verify database connection
3. Manual rollback: `psql ... < rollback.sql`

### GraphQL Errors
1. Check schema syntax in `src/graphql/schema/`
2. Verify resolver implementations
3. Run: `npm run type-check`

See [SETUP.md](./SETUP.md) Troubleshooting section for more.

---

## 📋 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm test` | Run tests |
| `npm run build` | Build for production |
| `npm run lint` | Check code style |
| `npm run format` | Auto-format code |
| `npm run db:migrate` | Run database migrations |
| `npm run neo4j:init` | Initialize Neo4j |
| `docker-compose up` | Start all services |
| `npm run type-check` | TypeScript validation |

---

## 📞 Support

For issues, questions, or contributions:
1. Check the relevant documentation file
2. Review [TROUBLESHOOTING.md](./SETUP.md#troubleshooting)
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: April 15, 2024
**Maintained By**: ClickBay Development Team
**Version**: 1.0.0
