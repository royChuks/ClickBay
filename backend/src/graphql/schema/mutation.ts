import { gql } from 'apollo-server-express';

export const mutationTypeDefs = gql`
  # Main Mutation Type
  type Mutation {
    # Authentication Mutations
    signup(input: SignupInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): TokenPayload!
    logout: Boolean!
    
    # Content Operations
    scrapeContent(input: ScrapeContentInput!): ScrapedContent!
    
    # Bookmark Operations
    saveBookmark(contentId: ID!, tags: [String!]): Bookmark!
    updateBookmark(
      bookmarkId: ID!
      tags: [String!]
      notes: String
    ): Bookmark!
    removeBookmark(contentId: ID!): Boolean!
    
    # User Profile Operations
    updateProfile(input: UpdateProfileInput!): User!
  }

  # Input Types
  input SignupInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ScrapeContentInput {
    url: String!
    sourceType: SourceType!
  }

  input UpdateProfileInput {
    name: String
    preferences: PreferencesInput
  }

  input PreferencesInput {
    theme: String
    language: String
    notifications: Boolean
  }

  # Payload Types
  type AuthPayload {
    user: User!
    token: String!
    refreshToken: String!
  }

  type TokenPayload {
    token: String!
    refreshToken: String!
  }

  type ScrapedContent {
    id: ID!
    title: String!
    url: String!
    sourceType: SourceType!
    excerpt: String
    metadata: ContentMetadata!
    analytics: ContentAnalytics!
    createdAt: DateTime!
  }
`;
