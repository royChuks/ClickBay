import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, concat, gql, Operation, FetchResult } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = new ApolloLink((operation: Operation, forward: (op: Operation) => Observable<FetchResult>) => {
  const token = localStorage.getItem('token');
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });
  return forward(operation);
});

export const client = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

// GraphQL Queries and Mutations
export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signup(input: { email: $email, password: $password, name: $name }) {
      token
      refreshToken
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      refreshToken
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      name
      email
      profile {
        preferences {
          theme
          language
          notifications
        }
      }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String, $preferences: PreferencesInput) {
    updateProfile(input: { name: $name, preferences: $preferences }) {
      id
      name
      email
      profile {
        preferences {
          theme
          language
          notifications
        }
      }
    }
  }
`;

export const SEARCH_CONTENT_QUERY = gql`
  query SearchContent($query: String!, $limit: Int, $filters: SearchFiltersInput) {
    searchContent(query: $query, limit: $limit, filters: $filters) {
      id
      content {
        title
        url
        excerpt
      }
      relevanceScore
    }
  }
`;

export const SEMANTIC_SEARCH_QUERY = gql`
  query SemanticSearch($query: String!, $limit: Int, $useGraphContext: Boolean, $filters: SearchFiltersInput) {
    semanticSearch(query: $query, limit: $limit, useGraphContext: $useGraphContext, filters: $filters) {
      id
      content {
        title
        url
        excerpt
      }
      relevanceScore
      similarity
    }
  }
`;

export type User = {
  id: string;
  name: string;
  email: string;
  profile?: {
    preferences?: {
      theme?: string;
      language?: string;
      notifications?: boolean;
    };
  };
};

export type AuthPayload = {
  token: string;
  refreshToken: string;
  user: User;
};

export type ContentResult = {
  id: string;
  content: {
    title: string;
    url: string;
    excerpt?: string;
  };
  relevanceScore: number;
  similarity?: number;
};

export type SearchResults = ContentResult[];
