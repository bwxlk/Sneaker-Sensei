import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export * from "./models/auth";

// Shoes table - Global catalog of shoes
export const shoes = pgTable("shoes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  colorway: text("colorway").notNull(),
  retailPrice: integer("retail_price").notNull(), // stored in cents
  marketPrice: integer("market_price"), // stored in cents, can be null
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  isTrending: boolean("is_trending").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collection items - User's personal inventory
export const collectionItems = pgTable("collection_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  shoeId: integer("shoe_id").notNull().references(() => shoes.id),
  size: text("size").notNull(),
  purchasePrice: integer("purchase_price"), // stored in cents
  purchaseDate: date("purchase_date"),
  condition: text("condition").notNull().default("new"), // new, used, worn
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wishlist items - User's want list
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  shoeId: integer("shoe_id").notNull().references(() => shoes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const shoesRelations = relations(shoes, ({ many }) => ({
  inCollections: many(collectionItems),
  inWishlists: many(wishlistItems),
}));

export const collectionItemsRelations = relations(collectionItems, ({ one }) => ({
  shoe: one(shoes, {
    fields: [collectionItems.shoeId],
    references: [shoes.id],
  }),
  user: one(users, {
    fields: [collectionItems.userId],
    references: [users.id],
  }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  shoe: one(shoes, {
    fields: [wishlistItems.shoeId],
    references: [shoes.id],
  }),
  user: one(users, {
    fields: [wishlistItems.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertShoeSchema = createInsertSchema(shoes).omit({ id: true, createdAt: true });
export const insertCollectionItemSchema = createInsertSchema(collectionItems).omit({ id: true, userId: true, createdAt: true });
export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({ id: true, userId: true, createdAt: true });

// Types
export type Shoe = typeof shoes.$inferSelect;
export type InsertShoe = z.infer<typeof insertShoeSchema>;

export type CollectionItem = typeof collectionItems.$inferSelect;
export type InsertCollectionItem = z.infer<typeof insertCollectionItemSchema>;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;

// Request Types
export type CreateShoeRequest = InsertShoe;
export type UpdateShoeRequest = Partial<InsertShoe>;

export type AddToCollectionRequest = InsertCollectionItem;
export type UpdateCollectionItemRequest = Partial<InsertCollectionItem>;

export type AddToWishlistRequest = InsertWishlistItem;

// Extended Types for Responses (including joined data)
export type CollectionItemWithShoe = CollectionItem & { shoe: Shoe };
export type WishlistItemWithShoe = WishlistItem & { shoe: Shoe };
