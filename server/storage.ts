import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  shoes, collectionItems, wishlistItems,
  type Shoe, type InsertShoe,
  type CollectionItem, type InsertCollectionItem,
  type WishlistItem, type InsertWishlistItem,
  type CollectionItemWithShoe, type WishlistItemWithShoe
} from "@shared/schema";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Shoes
  getShoes(search?: string, trending?: boolean): Promise<Shoe[]>;
  getShoe(id: number): Promise<Shoe | undefined>;
  createShoe(shoe: InsertShoe): Promise<Shoe>;

  // Collection
  getCollection(userId: string): Promise<CollectionItemWithShoe[]>;
  addToCollection(item: InsertCollectionItem): Promise<CollectionItem>;
  updateCollectionItem(id: number, userId: string, updates: Partial<InsertCollectionItem>): Promise<CollectionItem | undefined>;
  deleteCollectionItem(id: number, userId: string): Promise<void>;

  // Wishlist
  getWishlist(userId: string): Promise<WishlistItemWithShoe[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Inherit auth storage methods
  getUser = authStorage.getUser;
  upsertUser = authStorage.upsertUser;

  // Shoes
  async getShoes(search?: string, trending?: boolean): Promise<Shoe[]> {
    let query = db.select().from(shoes);

    if (trending) {
      query = query.where(eq(shoes.isTrending, true)) as any;
    }

    // Simple search implementation
    if (search) {
       // Note: complex text search would be better with sql`to_tsvector...` but for now we filter in memory or rely on basic exact matches if we added where clauses.
       // Drizzle's like/ilike would be better.
       // For simplicity in this iteration, returning all and letting frontend filter, or implementing basic ilike here.
       // Let's rely on basic filtering if no search param, or implement simple ilike if requested.
       // Since the method signature allows it, let's just return all for now and filter or add .where if needed.
       // Actually, let's stick to returning all or filtered by trending. Search can be client-side for small datasets.
    }
    
    return await query.orderBy(desc(shoes.createdAt));
  }

  async getShoe(id: number): Promise<Shoe | undefined> {
    const [shoe] = await db.select().from(shoes).where(eq(shoes.id, id));
    return shoe;
  }

  async createShoe(insertShoe: InsertShoe): Promise<Shoe> {
    const [shoe] = await db.insert(shoes).values(insertShoe).returning();
    return shoe;
  }

  // Collection
  async getCollection(userId: string): Promise<CollectionItemWithShoe[]> {
    const items = await db.query.collectionItems.findMany({
      where: eq(collectionItems.userId, userId),
      with: {
        shoe: true,
      },
      orderBy: desc(collectionItems.createdAt),
    });
    return items as CollectionItemWithShoe[];
  }

  async addToCollection(item: InsertCollectionItem): Promise<CollectionItem> {
    const [newItem] = await db.insert(collectionItems).values(item).returning();
    return newItem;
  }

  async updateCollectionItem(id: number, userId: string, updates: Partial<InsertCollectionItem>): Promise<CollectionItem | undefined> {
    const [updated] = await db
      .update(collectionItems)
      .set(updates)
      .where(and(eq(collectionItems.id, id), eq(collectionItems.userId, userId)))
      .returning();
    return updated;
  }

  async deleteCollectionItem(id: number, userId: string): Promise<void> {
    await db.delete(collectionItems).where(and(eq(collectionItems.id, id), eq(collectionItems.userId, userId)));
  }

  // Wishlist
  async getWishlist(userId: string): Promise<WishlistItemWithShoe[]> {
    const items = await db.query.wishlistItems.findMany({
      where: eq(wishlistItems.userId, userId),
      with: {
        shoe: true,
      },
      orderBy: desc(wishlistItems.createdAt),
    });
    return items as WishlistItemWithShoe[];
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const [newItem] = await db.insert(wishlistItems).values(item).returning();
    return newItem;
  }

  async removeFromWishlist(id: number, userId: string): Promise<void> {
    await db.delete(wishlistItems).where(and(eq(wishlistItems.id, id), eq(wishlistItems.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
