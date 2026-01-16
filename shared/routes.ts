import { z } from 'zod';
import { insertShoeSchema, insertCollectionItemSchema, insertWishlistItemSchema, shoes, collectionItems, wishlistItems } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  shoes: {
    list: {
      method: 'GET' as const,
      path: '/api/shoes',
      input: z.object({
        search: z.string().optional(),
        trending: z.enum(['true', 'false']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof shoes.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/shoes/:id',
      responses: {
        200: z.custom<typeof shoes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/shoes',
      input: insertShoeSchema,
      responses: {
        201: z.custom<typeof shoes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  collection: {
    list: {
      method: 'GET' as const,
      path: '/api/collection',
      responses: {
        200: z.array(z.custom<typeof collectionItems.$inferSelect & { shoe: typeof shoes.$inferSelect }>()),
        401: errorSchemas.internal,
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/collection',
      input: insertCollectionItemSchema,
      responses: {
        201: z.custom<typeof collectionItems.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.internal,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/collection/:id',
      input: insertCollectionItemSchema.partial(),
      responses: {
        200: z.custom<typeof collectionItems.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/collection/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  wishlist: {
    list: {
      method: 'GET' as const,
      path: '/api/wishlist',
      responses: {
        200: z.array(z.custom<typeof wishlistItems.$inferSelect & { shoe: typeof shoes.$inferSelect }>()),
        401: errorSchemas.internal,
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/wishlist',
      input: insertWishlistItemSchema,
      responses: {
        201: z.custom<typeof wishlistItems.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.internal,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/wishlist/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
