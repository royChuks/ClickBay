// Neo4j Node Models for ClickBay

import {
  User,
  Content,
  Entity,
  Bookmark,
  UserRole,
  SourceType,
  EntityType,
  EntityRelationship
} from '../types';

/**
 * User Node Model
 */
export class UserNode {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public role: UserRole = UserRole.USER,
    public verified: boolean = false,
    public createdAt: Date = new Date()
  ) {}

  toUser(password: string = ''): User {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password,
      role: this.role,
      profile: {
        verified: this.verified,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        }
      },
      statistics: {
        totalSearches: 0,
        totalBookmarks: 0,
        contentScraped: 0,
        accountAgeInDays: Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      },
      createdAt: this.createdAt,
      updatedAt: new Date()
    };
  }
}

/**
 * Content Node Model
 */
export class ContentNode {
  constructor(
    public id: string,
    public userId: string,
    public title: string,
    public url: string,
    public content: string,
    public sourceType: SourceType,
    public excerpt: string = '',
    public createdAt: Date = new Date()
  ) {}

  toContent(analytics: any = null): Content {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      url: this.url,
      content: this.content,
      sourceType: this.sourceType,
      excerpt: this.excerpt,
      metadata: {
        language: 'en'
      },
      analytics: analytics || {
        id: `analytics_${this.id}`,
        contentId: this.id,
        sentiment: {
          score: 0,
          label: 'NEUTRAL',
          confidence: 0,
          breakdown: { positive: 0, neutral: 0, negative: 0 }
        },
        keywords: [],
        entities: [],
        topics: [],
        summary: '',
        wordCount: 0,
        readTime: 0,
        qualityScore: 0,
        createdAt: new Date()
      },
      createdAt: this.createdAt,
      updatedAt: new Date()
    };
  }
}

/**
 * Entity Node Model for Knowledge Graph
 */
export class EntityNode {
  constructor(
    public id: string,
    public name: string,
    public type: EntityType,
    public confidence: number = 0.8,
    public mentionCount: number = 0,
    public createdAt: Date = new Date()
  ) {}

  toEntity(): Entity {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      confidence: this.confidence,
      mentionCount: this.mentionCount,
      relationships: [],
      metadata: {},
      createdAt: this.createdAt,
      updatedAt: new Date()
    };
  }
}

/**
 * Relationship Model for Knowledge Graph
 */
export class RelationshipNode {
  constructor(
    public id: string,
    public sourceId: string,
    public targetId: string,
    public type: string,
    public confidence: number = 0.8
  ) {}

  toEntityRelationship(): EntityRelationship {
    return {
      id: this.id,
      sourceId: this.sourceId,
      targetId: this.targetId,
      type: this.type,
      confidence: this.confidence,
      metadata: {}
    };
  }
}

/**
 * Bookmark Node Model
 */
export class BookmarkNode {
  constructor(
    public id: string,
    public userId: string,
    public contentId: string,
    public tags: string[] = [],
    public notes: string = '',
    public createdAt: Date = new Date()
  ) {}

  toBookmark(): Bookmark {
    return {
      id: this.id,
      userId: this.userId,
      contentId: this.contentId,
      tags: this.tags,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: new Date()
    };
  }
}

/**
 * Cypher Query Helpers
 */
export const CypherQueries = {
  // User queries
  createUser: `
    CREATE (u:User {
      id: $id,
      email: $email,
      name: $name,
      password: $password,
      role: $role,
      verified: false,
      createdAt: datetime()
    })
    RETURN u
  `,

  findUserById: `
    MATCH (u:User {id: $id})
    RETURN u
  `,

  findUserByEmail: `
    MATCH (u:User {email: $email})
    RETURN u
  `,

  // Content queries
  createContent: `
    MATCH (u:User {id: $userId})
    CREATE (c:Content {
      id: $id,
      title: $title,
      url: $url,
      content: $content,
      sourceType: $sourceType,
      excerpt: $excerpt,
      createdAt: datetime()
    })
    CREATE (u)-[:SCRAPED]->(c)
    RETURN c
  `,

  getUserContent: `
    MATCH (u:User {id: $userId})-[:SCRAPED]->(c:Content)
    RETURN c
    ORDER BY c.createdAt DESC
    SKIP $offset
    LIMIT $limit
  `,

  // Entity queries
  createEntity: `
    CREATE (e:Entity {
      id: $id,
      name: $name,
      type: $type,
      confidence: $confidence,
      mentionCount: $mentionCount,
      createdAt: datetime()
    })
    RETURN e
  `,

  findEntityById: `
    MATCH (e:Entity {id: $id})
    RETURN e
  `,

  // Bookmark queries
  createBookmark: `
    MATCH (u:User {id: $userId})
    MATCH (c:Content {id: $contentId})
    CREATE (b:Bookmark {
      id: $id,
      tags: $tags,
      notes: $notes,
      createdAt: datetime()
    })
    CREATE (u)-[:BOOKMARKED]->(b)
    CREATE (b)-[:REFERENCES]->(c)
    RETURN b
  `,

  getUserBookmarks: `
    MATCH (u:User {id: $userId})-[:BOOKMARKED]->(b:Bookmark)-[:REFERENCES]->(c:Content)
    RETURN b, c
    ORDER BY b.createdAt DESC
    LIMIT $limit
  `
};
