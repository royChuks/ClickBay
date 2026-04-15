# ClickBay Backend - Setup & Installation Guide

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+
- **Docker**: Latest version (for containerized services)
- **Docker Compose**: v2.0+
- **Git**: For version control
- **PostgreSQL**: v14+ (or use Docker)
- **Neo4j**: v5.0+ (or use Docker)
- **Redis**: Latest (or use Docker)
- **API Keys**: OpenAI API key (for embeddings)

---

## 1. Project Setup

### 1.1 Clone Repository

```bash
git clone https://github.com/yourorg/clickbay.git
cd clickbay/backend
```

### 1.2 Install Dependencies

```bash
npm install
```

**Key dependencies**:
```json
{
  "dependencies": {
    "apollo-server-express": "^4.11.0",
    "graphql": "^16.8.0",
    "express": "^4.18.0",
    "typescript": "^5.3.0",
    "pg": "^8.11.0",
    "neo4j-driver": "^5.14.0",
    "redis": "^4.6.0",
    "jsonwebtoken": "^9.1.0",
    "bcrypt": "^5.1.0",
    "bull": "^4.11.0",
    "data-loader": "^2.2.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.0.0"
  }
}
```

### 1.3 Install TypeScript Dependencies

```bash
npm install -D typescript ts-node @types/node
npx tsc --init
```

---

## 2. Environment Configuration

### 2.1 Create `.env` File

```bash
# Copy template
cp .env.example .env
```

### 2.2 Configure Environment Variables

```env
# ============================================
# Server Configuration
# ============================================
NODE_ENV=development
PORT=4000
HOST=localhost
LOG_LEVEL=info

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_key_min_32_chars
REFRESH_TOKEN_EXPIRY=7d

# ============================================
# PostgreSQL Configuration
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USER=clickbay_user
DB_PASSWORD=secure_password_here
DB_NAME=clickbay_dev
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_SSL=false

# ============================================
# Neo4j Configuration (Knowledge Graph)
# ============================================
NEO4J_URL=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j_password_here
NEO4J_DB=neo4j

# ============================================
# Redis Configuration (Cache & Queue)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ============================================
# Vector Database Configuration
# ============================================
EMBEDDING_PROVIDER=openai              # openai or local
EMBEDDING_MODEL=text-embedding-3-small
VECTOR_DB_TYPE=milvus                  # milvus, pinecone, or weaviate
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_DB_NAME=clickbay
PINECONE_API_KEY=
PINECONE_INDEX_NAME=

# ============================================
# LLM Configuration (For RAG)
# ============================================
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2048

# ============================================
# Content Scraping Configuration
# ============================================
SCRAPER_TIMEOUT=30000
SCRAPER_MAX_SIZE=10485760              # 10MB
SCRAPER_USER_AGENT=ClickBay/1.0
SCRAPER_RATE_LIMIT=10
SCRAPER_CONCURRENT_JOBS=5

# ============================================
# External Services
# ============================================
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@clickbay.com
AWS_S3_BUCKET=clickbay-content
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=

# ============================================
# Security
# ============================================
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12

# ============================================
# Monitoring & Logging
# ============================================
SENTRY_DSN=
LOG_FORMAT=json                         # json or text
LOG_DESTINATION=console                 # console or file

# ============================================
# Feature Flags
# ============================================
ENABLE_SUBSCRIPTIONS=true
ENABLE_GRAPHRAG=true
ENABLE_SEMANTIC_SEARCH=true
ENABLE_RATE_LIMITING=true
ENABLE_CACHING=true
```

---

## 3. Database Setup

### 3.1 Using Docker Compose

**Create `docker-compose.yml`**:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: clickbay-postgres
    environment:
      POSTGRES_USER: clickbay_user
      POSTGRES_PASSWORD: secure_password_here
      POSTGRES_DB: clickbay_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U clickbay_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  neo4j:
    image: neo4j:5-community
    container_name: clickbay-neo4j
    environment:
      NEO4J_AUTH: neo4j/neo4j_password_here
      NEO4J_apoc_import_file_enabled: "true"
    ports:
      - "7687:7687"
      - "7474:7474"
    volumes:
      - neo4j_data:/data
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "neo4j", "-p", "neo4j_password_here", "RETURN 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: clickbay-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  milvus:
    image: milvusdb/milvus:latest
    container_name: clickbay-milvus
    environment:
      COMMON_STORAGEQUOTAWARNINGPERCENTAGE: "90"
    ports:
      - "19530:19530"
      - "9091:9091"
    volumes:
      - milvus_data:/var/lib/milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  neo4j_data:
  redis_data:
  milvus_data:

networks:
  default:
    name: clickbay-network
```

**Start services**:

```bash
docker-compose up -d
```

**Verify services**:

```bash
docker-compose ps
```

### 3.2 Initialize PostgreSQL

```bash
# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

**Migration example** (`migrations/001_initial.sql`):

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(2048) UNIQUE,
  title VARCHAR(500),
  source_type VARCHAR(50),
  content_text TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_created_at ON content(created_at DESC);
CREATE FULLTEXT INDEX idx_content_fulltext ON content USING GIN(to_tsvector('english', content_text));
```

### 3.3 Initialize Neo4j

```bash
# Access Neo4j browser
# http://localhost:7474

# Create constraints
npm run neo4j:init
```

**Neo4j initialization script** (`scripts/neo4j-init.cypher`):

```cypher
-- Create constraints
CREATE CONSTRAINT unique_entity_name FOR (e:Entity) REQUIRE e.name IS UNIQUE;
CREATE CONSTRAINT unique_document_url FOR (d:Document) REQUIRE d.url IS UNIQUE;

-- Create indexes
CREATE INDEX entity_type FOR (e:Entity) ON (e.type);
CREATE INDEX document_created FOR (d:Document) ON (d.created_at);
CREATE INDEX entity_confidence FOR (e:Entity) ON (e.confidence);
```

---

## 4. Project Structure Setup

```bash
mkdir -p src/{
  middleware,
  graphql/{schema,resolvers,directives},
  services,
  repositories,
  models,
  database,
  queue,
  utils,
  types,
  constants
}
```

**Scaffold files**:

```bash
# Create TypeScript source files
touch src/index.ts
touch src/server.ts
touch src/database/connection.ts
touch src/graphql/schema/index.ts
touch src/graphql/resolvers/index.ts
touch src/services/user.service.ts
touch src/services/content.service.ts
touch src/services/graphrag.service.ts
```

---

## 5. Development Server Setup

### 5.1 Create `package.json` Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "ts-node scripts/migrate.ts",
    "db:seed": "ts-node scripts/seed.ts",
    "neo4j:init": "ts-node scripts/neo4j-init.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit"
  }
}
```

### 5.2 Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@/*": ["./src/*"],
      "@schemas/*": ["./src/graphql/schema/*"],
      "@resolvers/*": ["./src/graphql/resolvers/*"],
      "@services/*": ["./src/services/*"],
      "@models/*": ["./src/models/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

### 5.3 Start Development Server

```bash
npm run dev
```

Expected output:
```
🚀 GraphQL API running at http://localhost:4000/graphql
📊 Database connected successfully
🔌 Redis cache initialized
🧠 Neo4j knowledge graph connected
```

---

## 6. Testing Setup

### 6.1 Jest Configuration

**Create `jest.config.js`**:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### 6.2 Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 7. Code Quality Setup

### 7.1 ESLint Configuration

**Create `.eslintrc.json`**:

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-types": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 7.2 Prettier Configuration

**Create `.prettierrc`**:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "singleQuote": true,
  "arrowParens": "always"
}
```

---

## 8. GraphQL Apollo Server Setup

**`src/index.ts`**:

```typescript
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql';
import { authenticateToken } from './middleware/auth';
import { initializeDatabases } from './database';

const app = express();

app.use(express.json());
app.use(authenticateToken);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    userId: req.user?.id,
    userRole: req.user?.role,
    loaders: createDataLoaders()
  }),
  plugins: {
    didResolveOperation: ({ operationName }) => {
      console.log(`Operation: ${operationName}`);
    }
  }
});

server.start().then(() => {
  server.applyMiddleware({ app });
  
  initializeDatabases();
  
  app.listen(process.env.PORT || 4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  });
});
```

---

## 9. Deployment Preparation

### 9.1 Build for Production

```bash
npm run build
```

### 9.2 Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

### 9.3 Deploy to Cloud

```bash
# Build Docker image
docker build -t clickbay-backend:latest .

# Push to registry
docker push your-registry/clickbay-backend:latest

# Deploy to Kubernetes/Cloud Run
kubectl apply -f k8s/deployment.yaml
```

---

## 10. Verification Checklist

- [ ] All services running (`docker-compose ps`)
- [ ] Database migrations completed
- [ ] GraphQL API accessible (`http://localhost:4000/graphql`)
- [ ] Apollo Studio connected
- [ ] Environment variables configured
- [ ] Tests passing (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compilation successful
- [ ] Sample queries executing correctly
- [ ] Redis cache working
- [ ] Neo4j connected and initialized

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Test PostgreSQL connection
psql -h localhost -U clickbay_user -d clickbay_dev

# Check Docker logs
docker-compose logs postgres
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Check Redis logs
docker-compose logs redis
```

### Neo4j Connection Failed

```bash
# Access Neo4j browser
# http://localhost:7474

# Default credentials: neo4j/neo4j_password_here
```

---

## Next Steps

1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Check [GRAPHQL_SCHEMA.md](./GRAPHQL_SCHEMA.md) for API details
3. Read [SKILLS.md](./SKILLS.md) for implementation patterns
4. Review [REQUIREMENTS.md](./REQUIREMENTS.md) for feature specs
5. Start implementing services in `src/services/`
6. Create GraphQL resolvers in `src/graphql/resolvers/`

