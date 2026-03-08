import { IngredientInput } from "@/components/recipe/IngredientInput";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { UtensilCamera } from "@/components/recipe/UtensilCamera";
import { UtensilPicker } from "@/components/recipe/UtensilPicker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddHistoryEntry } from "@/hooks/useQueries";
import {
  type AIRecipe,
  type RecipeGenerationResult,
  generateRecipes,
  hasApiKey,
} from "@/utils/openai";
import { AlertCircle, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface SelectedUtensil {
  name: string;
  type: string;
  size: string;
}

export function RecipeBuilder() {
  const [ingredients, setIngredients] = useState<string[]>([
    "Tomatoes",
    "Garlic",
    "Olive Oil",
    "Pasta",
  ]);
  const [selectedUtensils, setSelectedUtensils] = useState<SelectedUtensil[]>([
    { name: "Large Pot", type: "pot", size: "3L" },
    { name: "Tablespoon", type: "spoon", size: "15ml" },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<RecipeGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const addHistory = useAddHistoryEntry();

  const handleAddIngredient = (ing: string) => {
    setIngredients((prev) => [...prev, ing]);
  };

  const handleRemoveIngredient = (ing: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ing));
  };

  const handleAddUtensil = (u: SelectedUtensil) => {
    setSelectedUtensils((prev) => [...prev, u]);
  };

  const handleRemoveUtensil = (name: string) => {
    setSelectedUtensils((prev) => prev.filter((u) => u.name !== name));
  };

  const handleConfirmUtensilFromPhoto = (u: {
    name: string;
    type: string;
    size: string;
  }) => {
    if (!selectedUtensils.some((existing) => existing.name === u.name)) {
      setSelectedUtensils((prev) => [...prev, u]);
    }
    toast.success(`Added ${u.name} to your utensils!`);
  };

  const handleSuggestRecipes = async () => {
    if (!hasApiKey()) {
      setError(
        "OpenAI API key not configured. Add VITE_OPENAI_API_KEY to enable AI features.",
      );
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await generateRecipes(ingredients, selectedUtensils);
      setResult(res);

      // Save to history
      const rawText = res.rawText ?? res.recipes.map((r) => r.name).join(", ");
      addHistory.mutate({ ingredients, aiResponse: rawText });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to generate recipes";
      setError(message);
      toast.error("Recipe generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-kitchen-banner.dim_1600x600.jpg"
          alt="Kitchen ingredients"
          className="w-full h-52 md:h-72 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-black/40 to-black/75" />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="font-fraunces text-4xl md:text-5xl font-bold text-white drop-shadow-lg tracking-tight"
          >
            RecipeAI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="text-white/85 text-lg mt-2 max-w-sm"
          >
            Cook smarter with what you have
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-4 flex gap-2"
          >
            <span className="text-xs bg-white/15 border border-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              🤖 GPT-4o Vision
            </span>
            <span className="text-xs bg-white/15 border border-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              🍳 Utensil-aware
            </span>
          </motion.div>
        </div>
      </div>

      {/* API key notice */}
      {!hasApiKey() && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200/80 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mt-0.5 sm:mt-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                AI Features Disabled
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Add your OpenAI API key to enable AI recipe generation and photo
                analysis. Set{" "}
                <code className="font-mono bg-amber-100 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-xs font-medium">
                  VITE_OPENAI_API_KEY
                </code>{" "}
                in your environment variables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left panel: Inputs ── */}
          <div className="space-y-6">
            {/* Ingredients */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl border border-border border-t-4 border-t-primary p-6 shadow-card"
            >
              <h2 className="font-fraunces text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🥦</span>
                My Ingredients
              </h2>
              <IngredientInput
                ingredients={ingredients}
                onAdd={handleAddIngredient}
                onRemove={handleRemoveIngredient}
              />
            </motion.section>

            {/* Utensils */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-card rounded-2xl border border-border border-t-4 border-t-accent p-6 shadow-card"
            >
              <h2 className="font-fraunces text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🍳</span>
                My Utensils
              </h2>

              <Tabs defaultValue="pick-list">
                <TabsList className="w-full mb-4">
                  <TabsTrigger
                    data-ocid="utensils.tab"
                    value="pick-list"
                    className="flex-1"
                  >
                    Pick from List
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="utensils.tab"
                    value="photo"
                    className="flex-1"
                  >
                    📸 Identify by Photo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pick-list">
                  <UtensilPicker
                    selectedUtensils={selectedUtensils}
                    onAdd={handleAddUtensil}
                    onRemove={handleRemoveUtensil}
                  />
                </TabsContent>

                <TabsContent value="photo">
                  <UtensilCamera
                    onConfirmUtensil={handleConfirmUtensilFromPhoto}
                  />
                </TabsContent>
              </Tabs>
            </motion.section>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Button
                data-ocid="recipe.suggest_button"
                onClick={handleSuggestRecipes}
                disabled={
                  ingredients.length === 0 || isGenerating || !hasApiKey()
                }
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-accent/25 h-14 text-base font-semibold rounded-xl shadow-card transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating recipes...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Suggest Recipes
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {ingredients.length === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Add at least one ingredient to get started
                </p>
              )}
            </motion.div>
          </div>

          {/* ── Right panel: Results ── */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isGenerating && (
                <motion.div
                  key="loading"
                  data-ocid="recipe.loading_state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-card rounded-2xl border border-border p-8 shadow-card text-center"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    <span className="font-fraunces text-lg">
                      Crafting your recipes...
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI is analyzing your ingredients and utensil sizes to create
                    personalized recipes
                  </p>
                  {/* Shimmer skeleton cards */}
                  <div className="space-y-3 mt-6">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 rounded-xl overflow-hidden relative bg-muted"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer bg-[length:200%_100%]" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {error && !isGenerating && (
                <motion.div
                  key="error"
                  data-ocid="recipe.error_state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 text-center"
                >
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              {result && !isGenerating && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {result.recipes.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <h2 className="font-fraunces text-xl font-semibold">
                          Recipe Suggestions
                        </h2>
                        <span className="text-sm text-muted-foreground">
                          ({result.recipes.length} recipes)
                        </span>
                      </div>
                      {result.recipes.map((recipe: AIRecipe, i: number) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: recipe order from AI is stable
                        <RecipeCard key={i} recipe={recipe} index={i} />
                      ))}
                    </>
                  ) : result.rawText ? (
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                      <h3 className="font-fraunces text-lg font-semibold mb-3">
                        AI Suggestions
                      </h3>
                      <div className="prose prose-sm max-w-none text-foreground">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-outfit">
                          {result.rawText}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recipes found. Try adding more ingredients.
                    </div>
                  )}
                </motion.div>
              )}

              {!result && !isGenerating && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-2xl border border-border border-dashed p-12 text-center"
                >
                  {/* Radial soft background */}
                  <div className="relative inline-flex items-center justify-center mb-5">
                    <div className="absolute w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full blur-xl" />
                    <span className="relative text-6xl">🍽️</span>
                  </div>
                  <h3 className="font-fraunces text-xl font-semibold mb-2">
                    Your recipes will appear here
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Add your ingredients, select your utensils, then hit{" "}
                    <span className="font-medium text-accent">
                      "Suggest Recipes"
                    </span>{" "}
                    to get personalized cooking ideas
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
