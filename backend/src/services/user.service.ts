import bcrypt from 'bcryptjs';
import { User } from '../types';
import { UserRepository } from '../repositories/user.repository';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { ValidationError, AuthenticationError } from '../middleware/errors';

/**
 * User Service - Business logic for user operations
 */
export class UserService {
  /**
   * Register a new user
   */
  static async signup(email: string, password: string, name: string): Promise<{ user: User; token: string; refreshToken: string }> {
    // Validate inputs
    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserRepository.create(email, name, passwordHash);

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { user, token, refreshToken };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    // Validate inputs
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { user, token, refreshToken };
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId: string): Promise<User> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    name?: string,
    preferences?: any
  ): Promise<User> {
    const user = await UserRepository.updateProfile(userId, name, preferences);
    if (!user) {
      throw new ValidationError('Failed to update profile');
    }
    return user;
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    if (!oldPassword || !newPassword) {
      throw new ValidationError('Old and new passwords are required');
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid password');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return UserRepository.updatePassword(userId, passwordHash);
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(userId: string): Promise<any> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }
    return user.statistics;
  }

  /**
   * Verify email
   */
  static async verifyEmail(userId: string): Promise<boolean> {
    return UserRepository.verifyEmail(userId);
  }
}
