import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateShoeRequest, type UpdateShoeRequest } from "@shared/routes";
import { z } from "zod";

// Helper to log validation errors
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    console.log("Failed data:", data);
    throw result.error;
  }
  return result.data;
}

export function useShoes(search?: string, trending?: boolean) {
  return useQuery({
    queryKey: [api.shoes.list.path, { search, trending }],
    queryFn: async () => {
      // Build query string manually since URLSearchParams handles undefined oddly
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (trending !== undefined) params.append("trending", String(trending));

      const url = `${api.shoes.list.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch shoes");
      
      const data = await res.json();
      return parseWithLogging(api.shoes.list.responses[200], data, "shoes.list");
    },
  });
}

export function useShoe(id: number) {
  return useQuery({
    queryKey: [api.shoes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.shoes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch shoe");
      
      const data = await res.json();
      return parseWithLogging(api.shoes.get.responses[200], data, "shoes.get");
    },
  });
}

export function useCreateShoe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateShoeRequest) => {
      // Coerce numeric strings to numbers before sending if needed, 
      // but form libraries usually handle this. Zod schema expects numbers.
      const validated = api.shoes.create.input.parse(data);
      
      const res = await fetch(api.shoes.create.path, {
        method: api.shoes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create shoe");
      }
      
      const responseData = await res.json();
      return parseWithLogging(api.shoes.create.responses[201], responseData, "shoes.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.shoes.list.path] });
    },
  });
}
