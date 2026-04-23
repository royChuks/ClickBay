import { User, UserRole } from '../types';
import { UserNode } from '../models';
import { memoryStore, nextId } from '../database/memory-store';

/**
 * User Repository - Data access layer for User operations
 */
export class UserRepository {
  /**
   * Create a new user
   */
  static async create(email: string, name: string, passwordHash: string): Promise<User> {
    const id = nextId('user');
    const userNode = new UserNode(id, email, name, UserRole.USER);
    const user = userNode.toUser(passwordHash);
    memoryStore.users.set(id, user);
    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const user = memoryStore.users.get(id);
    if (!user) {
      return null;
    }

    const totalBookmarks = Array.from(memoryStore.bookmarks.values()).filter(
      bookmark => bookmark.userId === id
    ).length;
    const contentScraped = Array.from(memoryStore.contents.values()).filter(
      content => content.userId === id
    ).length;

    return {
      ...user,
      statistics: {
        ...user.statistics,
        totalBookmarks,
        contentScraped,
        accountAgeInDays: Math.max(
          0,
          Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        )
      }
    };
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const user = Array.from(memoryStore.users.values()).find(
      storedUser => storedUser.email.toLowerCase() === email.toLowerCase()
    );
    return user ?? null;
  }

  /**
   * Update user
   */
  static async update(id: string, data: Partial<User>): Promise<User | null> {
    const existingUser = memoryStore.users.get(id);
    if (!existingUser) {
      return null;
    }

    const updatedUser: User = {
      ...existingUser,
      ...data,
      updatedAt: new Date(),
      profile: data.profile ?? existingUser.profile,
      statistics: data.statistics ?? existingUser.statistics
    };
    memoryStore.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    return memoryStore.users.delete(id);
  }

  /**
   * Get all users (admin only)
   */
  static async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    return Array.from(memoryStore.users.values()).slice(offset, offset + limit);
  }

  /**
   * Update user password
   */
  static async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const existingUser = memoryStore.users.get(id);
    if (!existingUser) {
      return false;
    }

    memoryStore.users.set(id, {
      ...existingUser,
      password: passwordHash,
      updatedAt: new Date()
    });
    return true;
  }

  /**
   * Verify user email
   */
  static async verifyEmail(id: string): Promise<boolean> {
    const existingUser = memoryStore.users.get(id);
    if (!existingUser) {
      return false;
    }

    memoryStore.users.set(id, {
      ...existingUser,
      profile: {
        ...existingUser.profile,
        verified: true
      },
      updatedAt: new Date()
    });
    return true;
  }

  /**
   * Update user profile
   */
  static async updateProfile(id: string, name?: string, preferences?: any): Promise<User | null> {
    const existingUser = memoryStore.users.get(id);
    if (!existingUser) {
      return null;
    }

    const updatedUser: User = {
      ...existingUser,
      name: name ?? existingUser.name,
      profile: {
        ...existingUser.profile,
        preferences: preferences
          ? {
              ...existingUser.profile.preferences,
              ...preferences
            }
          : existingUser.profile.preferences
      },
      updatedAt: new Date()
    };

    memoryStore.users.set(id, updatedUser);
    return updatedUser;
  }
}
