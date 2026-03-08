import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Recipe, Utensil } from "../backend.d";
import { useActor } from "./useActor";

// ─── Utensils ────────────────────────────────────────────────────────────────

export function useGetUserUtensils() {
  const { actor, isFetching } = useActor();
  return useQuery<Utensil[]>({
    queryKey: ["utensils"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserUtensils();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddUtensil() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      type,
      size,
    }: {
      name: string;
      type: string;
      size: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addUtensil(name, type, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utensils"] });
    },
  });
}

export function useUpdateUtensil() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      type,
      size,
    }: {
      id: bigint;
      name: string;
      type: string;
      size: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateUtensil(id, name, type, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utensils"] });
    },
  });
}

export function useDeleteUtensil() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteUtensil(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utensils"] });
    },
  });
}

// ─── Recipes ─────────────────────────────────────────────────────────────────

export function useGetUserRecipes() {
  const { actor, isFetching } = useActor();
  return useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserRecipes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      ingredients,
      steps,
    }: {
      name: string;
      ingredients: string[];
      steps: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addRecipe(name, ingredients, steps);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useDeleteRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteRecipe(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useAddHistoryEntry() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      ingredients,
      aiResponse,
    }: {
      ingredients: string[];
      aiResponse: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addHistoryEntry(ingredients, aiResponse);
    },
  });
}
