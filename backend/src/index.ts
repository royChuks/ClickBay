import 'dotenv/config';
import express, { Request } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql';
import { 
  corsMiddleware, 
  requestLogger, 
  healthCheck 
} from './middleware/cors';
import { 
  authenticateToken, 
  buildAuthContext 
} from './middleware/auth';
import { errorHandler } from './middleware/errors';

async function startServer(): Promise<void> {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(authenticateToken);

  // Health check endpoint
  app.get('/health', healthCheck);

  // Apollo GraphQL Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: { req: Request }) => {
      return buildAuthContext(req);
    }
  });

  await server.start();
  server.applyMiddleware({ 
    app: app as Parameters<typeof server.applyMiddleware>[0]['app'], 
    path: '/graphql' 
  });

  // Error handling middleware
  app.use(errorHandler);

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 GraphQL API ready at http://localhost:${port}${server.graphqlPath}`);
    // eslint-disable-next-line no-console
    console.log(`📊 Health check: http://localhost:${port}/health`);
  });
}

startServer().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
