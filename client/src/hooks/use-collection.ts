import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AddToCollectionRequest, type UpdateCollectionItemRequest } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useCollection() {
  return useQuery({
    queryKey: [api.collection.list.path],
    queryFn: async () => {
      const res = await fetch(api.collection.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch collection");
      
      const data = await res.json();
      return parseWithLogging(api.collection.list.responses[200], data, "collection.list");
    },
  });
}

export function useAddToCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddToCollectionRequest) => {
      const validated = api.collection.add.input.parse(data);
      
      const res = await fetch(api.collection.add.path, {
        method: api.collection.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add to collection");
      
      const responseData = await res.json();
      return parseWithLogging(api.collection.add.responses[201], responseData, "collection.add");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.collection.list.path] });
    },
  });
}

export function useUpdateCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateCollectionItemRequest) => {
      const validated = api.collection.update.input.parse(updates);
      const url = buildUrl(api.collection.update.path, { id });
      
      const res = await fetch(url, {
        method: api.collection.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update collection item");
      
      const responseData = await res.json();
      return parseWithLogging(api.collection.update.responses[200], responseData, "collection.update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.collection.list.path] });
    },
  });
}

export function useDeleteFromCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.collection.delete.path, { id });
      const res = await fetch(url, { 
        method: api.collection.delete.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete from collection");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.collection.list.path] });
    },
  });
}
