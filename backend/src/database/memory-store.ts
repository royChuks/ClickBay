import {
  Bookmark,
  Content,
  Entity,
  EntityRelationship,
  User
} from '../types';

type StoredRefreshToken = {
  token: string;
  userId: string;
  expiresAt: number;
};

export const memoryStore = {
  users: new Map<string, User>(),
  contents: new Map<string, Content>(),
  bookmarks: new Map<string, Bookmark>(),
  entities: new Map<string, Entity>(),
  relationships: new Map<string, EntityRelationship>(),
  activeRefreshTokens: new Map<string, StoredRefreshToken>(),
  revokedAccessTokens: new Set<string>()
};

let idCounter = 0;

export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function resetMemoryStore(): void {
  memoryStore.users.clear();
  memoryStore.contents.clear();
  memoryStore.bookmarks.clear();
  memoryStore.entities.clear();
  memoryStore.relationships.clear();
  memoryStore.activeRefreshTokens.clear();
  memoryStore.revokedAccessTokens.clear();
  idCounter = 0;
}
