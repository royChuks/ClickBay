import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql';

async function startServer(): Promise<void> {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => ({})
  });

  await server.start();
  server.applyMiddleware({ app: app as Parameters<typeof server.applyMiddleware>[0]['app'], path: '/graphql' });

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 GraphQL API ready at http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
