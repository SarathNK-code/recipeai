import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteRecipe, useGetUserRecipes } from "@/hooks/useQueries";
import {
  BookOpen,
  ChefHat,
  Clock,
  Loader2,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Recipe } from "../backend.d";

function RecipeDetailModal({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-card rounded-2xl border border-border shadow-elevated w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header — gradient background */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-card to-primary/5">
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent mb-4" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-fraunces text-2xl font-bold leading-tight">
                {recipe.name}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {recipe.ingredients.length} ingredients
                </span>
                <span className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4" />
                  {recipe.steps.length} steps
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ingredients */}
          <div>
            <h3 className="font-fraunces font-semibold text-base mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-accent/30 to-accent/10 rounded-full flex items-center justify-center text-sm">
                📋
              </span>
              Ingredients
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, i) => {
                const parts = ing.split(":");
                const item = parts[0]?.trim() || ing;
                const amount = parts[1]?.trim() || "";
                return (
                  <div
                    key={ing}
                    className={`flex items-baseline justify-between gap-2 rounded-lg px-3 py-2 ${
                      i % 2 === 0 ? "bg-muted/40" : "bg-amber-50/60"
                    }`}
                  >
                    <span className="text-sm font-medium">{item}</span>
                    {amount && (
                      <span className="text-sm text-accent font-semibold whitespace-nowrap">
                        {amount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="font-fraunces font-semibold text-base mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center text-sm">
                👨‍🍳
              </span>
              Instructions
            </h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: step order is stable
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed pt-1 text-foreground">
                    {step.replace(/^step\s*\d+[:.]\s*/i, "")}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MyRecipes() {
  const { data: recipes, isLoading } = useGetUserRecipes();
  const deleteRecipe = useDeleteRecipe();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleDelete = async (id: bigint, name: string) => {
    try {
      await deleteRecipe.mutateAsync(id);
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error("Failed to delete recipe");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header with decorative background */}
      <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-card via-primary/5 to-accent/5 border border-border p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/8 to-transparent rounded-tr-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-accent" />
            <h1 className="font-fraunces text-3xl font-bold">My Recipes</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Your saved AI-generated recipes
          </p>
          {recipes && recipes.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-muted h-24"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer bg-[length:200%_100%]" />
            </div>
          ))}
        </div>
      ) : !recipes || recipes.length === 0 ? (
        <motion.div
          data-ocid="saved_recipes.empty_state"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border border-dashed border-border rounded-2xl bg-card"
        >
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full blur-xl" />
            <UtensilsCrossed className="relative w-14 h-14 text-muted-foreground/60" />
          </div>
          <h3 className="font-fraunces text-xl font-semibold mb-2">
            No saved recipes yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Generate recipes using the Recipe Builder and save your favorites
            here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {recipes.map((recipe, i) => (
              <motion.div
                key={recipe.id.toString()}
                data-ocid={`saved_recipes.item.${i + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-l-4 border-l-accent border-border p-5 shadow-card group"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: supplemental click-to-expand pattern */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <h3 className="font-fraunces text-lg font-semibold leading-tight group-hover:text-accent transition-colors">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge
                        variant="secondary"
                        className="text-xs flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        {recipe.ingredients.length} ingredients
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        {recipe.steps.length} steps
                      </Badge>
                    </div>

                    {/* Preview of first few ingredients */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {recipe.ingredients.slice(0, 3).map((ing) => {
                        const label = ing.split(":")[0]?.trim() || ing;
                        return (
                          <span
                            key={ing}
                            className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full"
                          >
                            {label}
                          </span>
                        );
                      })}
                      {recipe.ingredients.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                          +{recipe.ingredients.length - 3} more
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-accent mt-2 font-medium">
                      Click to view full recipe →
                    </p>
                  </div>

                  <button
                    type="button"
                    data-ocid={`saved_recipes.delete_button.${i + 1}`}
                    onClick={() => handleDelete(recipe.id, recipe.name)}
                    disabled={deleteRecipe.isPending}
                    className="p-2 rounded-xl hover:bg-destructive/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    aria-label={`Delete ${recipe.name}`}
                  >
                    {deleteRecipe.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-destructive" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Recipe detail modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
