import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
// Auth is disabled for local dev
// import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertShoeSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 🔒 Auth disabled for now while running outside Replit
  // await setupAuth(app);
  // registerAuthRoutes(app);

  // Shoes Routes (public)
  app.get(api.shoes.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const trending = req.query.trending === "true";
    const shoes = await storage.getShoes(search, trending);
    res.json(shoes);
  });

  app.get(api.shoes.get.path, async (req, res) => {
    const shoe = await storage.getShoe(Number(req.params.id));
    if (!shoe) {
      return res.status(404).json({ message: "Shoe not found" });
    }
    res.json(shoe);
  });

  app.post(api.shoes.create.path, async (req, res) => {
    try {
      const input = api.shoes.create.input.parse(req.body);
      const shoe = await storage.createShoe(input);
      res.status(201).json(shoe);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // For local dev, just use a fixed user id
  const getDevUserId = () => "dev-user";

  // Collection Routes (UNPROTECTED for now)
  app.get(api.collection.list.path, async (req, res) => {
    const userId = getDevUserId();
    const items = await storage.getCollection(userId);
    res.json(items);
  });

  app.post(api.collection.add.path, async (req, res) => {
    try {
      const userId = getDevUserId();
      const input = api.collection.add.input.parse({ ...req.body, userId });
      const item = await storage.addToCollection(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.collection.update.path, async (req, res) => {
    try {
      const userId = getDevUserId();
      const input = api.collection.update.input.parse(req.body);
      const item = await storage.updateCollectionItem(
        Number(req.params.id),
        userId,
        input
      );
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.collection.delete.path, async (req, res) => {
    const userId = getDevUserId();
    await storage.deleteCollectionItem(Number(req.params.id), userId);
    res.status(204).send();
  });

  // Wishlist Routes (UNPROTECTED for now)
  app.get(api.wishlist.list.path, async (req, res) => {
    const userId = getDevUserId();
    const items = await storage.getWishlist(userId);
    res.json(items);
  });

  app.post(api.wishlist.add.path, async (req, res) => {
    try {
      const userId = getDevUserId();
      const input = api.wishlist.add.input.parse({ ...req.body, userId });
      const item = await storage.addToWishlist(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.wishlist.delete.path, async (req, res) => {
    const userId = getDevUserId();
    await storage.removeFromWishlist(Number(req.params.id), userId);
    res.status(204).send();
  });

  // Seed database on startup
  seedDatabase().catch(console.error);

  return httpServer;
}

export async function seedDatabase() {
  const existingShoes = await storage.getShoes();
  if (existingShoes.length === 0) {
    const seedShoes: z.infer<typeof insertShoeSchema>[] = [
      {
        name: "Air Jordan 1 Retro High OG 'Lost & Found'",
        brand: "Jordan",
        model: "Air Jordan 1",
        colorway: "Varsity Red/Black/Sail/Muslin",
        retailPrice: 18000,
        marketPrice: 35000,
        imageUrl:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1600",
        description:
          "The Air Jordan 1 Retro High OG 'Lost & Found' brings back the iconic Chicago colorway with a vintage aesthetic.",
        isTrending: true,
      },
      {
        name: "Nike Dunk Low 'Panda'",
        brand: "Nike",
        model: "Dunk Low",
        colorway: "White/Black",
        retailPrice: 11000,
        marketPrice: 15000,
        imageUrl:
          "https://images.unsplash.com/photo-1636718282215-288214292275?auto=format&fit=crop&q=80&w=1600",
        description:
          "A simple yet classic colorway that has taken the world by storm.",
        isTrending: true,
      },
    ];

    for (const shoe of seedShoes) {
      await storage.createShoe(shoe);
    }
    console.log("Database seeded with shoes!");
  }
}
