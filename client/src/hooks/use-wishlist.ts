import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AddToWishlistRequest } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useWishlist() {
  return useQuery({
    queryKey: [api.wishlist.list.path],
    queryFn: async () => {
      const res = await fetch(api.wishlist.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      
      const data = await res.json();
      return parseWithLogging(api.wishlist.list.responses[200], data, "wishlist.list");
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddToWishlistRequest) => {
      const validated = api.wishlist.add.input.parse(data);
      
      const res = await fetch(api.wishlist.add.path, {
        method: api.wishlist.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add to wishlist");
      
      const responseData = await res.json();
      return parseWithLogging(api.wishlist.add.responses[201], responseData, "wishlist.add");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wishlist.list.path] });
    },
  });
}

export function useDeleteFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.wishlist.delete.path, { id });
      const res = await fetch(url, { 
        method: api.wishlist.delete.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete from wishlist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wishlist.list.path] });
    },
  });
}
