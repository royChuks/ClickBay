import { gql } from 'apollo-server-express';
import { queryTypeDefs } from './query';
import { mutationTypeDefs } from './mutation';

// Subscription types
const subscriptionTypeDefs = gql`
  type Subscription {
    contentScraped(userId: ID!): ScrapedContent!
    analyticsUpdated(userId: ID!): AnalyticsUpdate!
  }

  type AnalyticsUpdate {
    id: ID!
    contentId: ID!
    sentiment: Sentiment!
    keywords: [Keyword!]!
    updatedAt: DateTime!
  }
`;

// Combine all type definitions
export const typeDefs = [queryTypeDefs, mutationTypeDefs, subscriptionTypeDefs];
