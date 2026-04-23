import { Entity, EntityRelationship, EntityType } from '../types';
import { memoryStore, nextId } from '../database/memory-store';

/**
 * Entity Repository - Data access layer for Knowledge Graph Entity operations
 */
export class EntityRepository {
  /**
   * Create an entity
   */
  static async create(
    name: string,
    type: EntityType,
    confidence: number = 0.8,
    mentionCount: number = 0,
    metadata?: Record<string, any>
  ): Promise<Entity> {
    const id = nextId('entity');
    const entity: Entity = {
      id,
      name,
      type,
      confidence,
      mentionCount,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.entities.set(id, entity);
    return entity;
  }

  /**
   * Find entity by ID
   */
  static async findById(id: string): Promise<Entity | null> {
    return memoryStore.entities.get(id) ?? null;
  }

  /**
   * Find entity by name
   */
  static async findByName(name: string): Promise<Entity | null> {
    const entity = Array.from(memoryStore.entities.values()).find(
      item => item.name.toLowerCase() === name.toLowerCase()
    );
    return entity ?? null;
  }

  /**
   * Get entities by type
   */
  static async findByType(type: EntityType, limit: number = 20, offset: number = 0): Promise<Entity[]> {
    return Array.from(memoryStore.entities.values())
      .filter(entity => entity.type === type)
      .slice(offset, offset + limit);
  }

  /**
   * Get all entities with pagination
   */
  static async findAll(limit: number = 50, offset: number = 0): Promise<Entity[]> {
    return Array.from(memoryStore.entities.values()).slice(offset, offset + limit);
  }

  /**
   * Update entity
   */
  static async update(id: string, data: Partial<Entity>): Promise<Entity | null> {
    const existingEntity = memoryStore.entities.get(id);
    if (!existingEntity) {
      return null;
    }

    const updatedEntity: Entity = {
      ...existingEntity,
      ...data,
      updatedAt: new Date()
    };
    memoryStore.entities.set(id, updatedEntity);
    return updatedEntity;
  }

  /**
   * Delete entity
   */
  static async delete(id: string): Promise<boolean> {
    return memoryStore.entities.delete(id);
  }

  /**
   * Create relationship between entities
   */
  static async createRelationship(
    sourceId: string,
    targetId: string,
    type: string,
    confidence: number = 0.8
  ): Promise<EntityRelationship> {
    const id = nextId('rel');
    const relationship: EntityRelationship = {
      id,
      sourceId,
      targetId,
      type,
      confidence,
      metadata: {}
    };
    memoryStore.relationships.set(id, relationship);
    return relationship;
  }

  /**
   * Get entity relationships
   */
  static async getRelationships(entityId: string, _depth: number = 1): Promise<EntityRelationship[]> {
    return Array.from(memoryStore.relationships.values())
      .filter(relationship => relationship.sourceId === entityId || relationship.targetId === entityId)
      .map(relationship => ({
        ...relationship,
        source: memoryStore.entities.get(relationship.sourceId),
        target: memoryStore.entities.get(relationship.targetId)
      }));
  }

  /**
   * Find related entities
   */
  static async findRelated(entityId: string, limit: number = 10): Promise<Entity[]> {
    const relatedIds = Array.from(memoryStore.relationships.values()).flatMap(relationship => {
      if (relationship.sourceId === entityId) {
        return [relationship.targetId];
      }

      if (relationship.targetId === entityId) {
        return [relationship.sourceId];
      }

      return [];
    });

    return relatedIds
      .map(id => memoryStore.entities.get(id))
      .filter((entity): entity is Entity => Boolean(entity))
      .slice(0, limit);
  }

  /**
   * Increment mention count
   */
  static async incrementMentionCount(id: string): Promise<boolean> {
    const existingEntity = memoryStore.entities.get(id);
    if (!existingEntity) {
      return false;
    }

    memoryStore.entities.set(id, {
      ...existingEntity,
      mentionCount: existingEntity.mentionCount + 1,
      updatedAt: new Date()
    });
    return true;
  }

  /**
   * Get graph statistics
   */
  static async getGraphStatistics(): Promise<any> {
    const totalNodes = memoryStore.users.size +
      memoryStore.contents.size +
      memoryStore.bookmarks.size +
      memoryStore.entities.size;

    return {
      totalNodes,
      totalRelationships: memoryStore.relationships.size,
      avgDegree: totalNodes > 0 ? memoryStore.relationships.size / totalNodes : 0,
      densityScore: totalNodes > 1 ? memoryStore.relationships.size / (totalNodes * (totalNodes - 1)) : 0,
      mostConnectedNodes: []
    };
  }

  /**
   * Search entities by name (fuzzy search)
   */
  static async search(query: string, limit: number = 20): Promise<Entity[]> {
    const normalizedQuery = query.trim().toLowerCase();
    return Array.from(memoryStore.entities.values())
      .filter(entity => entity.name.toLowerCase().includes(normalizedQuery))
      .slice(0, limit);
  }
}
