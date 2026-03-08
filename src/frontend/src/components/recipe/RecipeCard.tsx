import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAddRecipe } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import type { AIRecipe } from "@/utils/openai";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChefHat,
  Clock,
  Flame,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface RecipeCardProps {
  recipe: AIRecipe;
  index: number;
}

const difficultyColor = {
  Easy: "bg-green-100 text-green-800 border-green-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Hard: "bg-red-100 text-red-800 border-red-200",
};

// Chart-derived gradient pairs for color bars
const cardGradients = [
  "from-amber-500 to-orange-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-400",
  "from-violet-500 to-purple-400",
  "from-sky-500 to-blue-400",
];

export function RecipeCard({ recipe, index }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const addRecipe = useAddRecipe();

  const handleSave = async () => {
    try {
      const ingredientStrings = recipe.ingredients.map(
        (ing) => `${ing.item}: ${ing.amount}`,
      );
      await addRecipe.mutateAsync({
        name: recipe.name,
        ingredients: ingredientStrings,
        steps: recipe.steps,
      });
      setSaved(true);
      toast.success(`"${recipe.name}" saved to your recipes!`);
    } catch {
      toast.error("Failed to save recipe. Please try again.");
    }
  };

  const ocidBase = `recipe.card.${index + 1}`;
  const diffKey = (recipe.difficulty || "Easy") as keyof typeof difficultyColor;
  const gradient = cardGradients[index % cardGradients.length];

  return (
    <>
      {/* Card */}
      <motion.div
        data-ocid={ocidBase}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={cn(
          "recipe-card rounded-2xl border border-border bg-card cursor-pointer overflow-hidden",
          "hover:border-accent/50 transition-all duration-200",
        )}
        onClick={() => setExpanded(true)}
      >
        {/* Color bar — 2.5px, gradient, rounded top */}
        <div
          className={cn(
            "h-2.5 w-full rounded-t-2xl bg-gradient-to-r",
            gradient,
          )}
        />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-fraunces font-semibold text-lg leading-tight text-foreground">
              {recipe.name}
            </h3>
            <Badge
              className={cn(
                "text-xs shrink-0 border",
                difficultyColor[diffKey] || difficultyColor.Easy,
              )}
            >
              {recipe.difficulty || "Easy"}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {recipe.cookingTime || "~20 min"}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {recipe.ingredients.length} ingredients
            </span>
            <span className="flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              {recipe.steps.length} steps
            </span>
          </div>

          {/* Top ingredients preview — warm amber chips */}
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredients.slice(0, 4).map((ing) => (
              <span
                key={ing.item}
                className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full"
              >
                {ing.item}
              </span>
            ))}
            {recipe.ingredients.length > 4 && (
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                +{recipe.ingredients.length - 4} more
              </span>
            )}
          </div>

          {/* Click affordance */}
          <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-accent hover:text-accent/80 transition-colors">
            <span>View full recipe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setExpanded(false);
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
                {/* Top gradient bar */}
                <div
                  className={cn(
                    "h-1 w-16 rounded-full bg-gradient-to-r mb-4",
                    gradient,
                  )}
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-fraunces text-2xl font-bold text-foreground leading-tight">
                      {recipe.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {recipe.cookingTime || "~20 min"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4" />
                        {recipe.difficulty || "Easy"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid="recipe.close_button"
                    onClick={() => setExpanded(false)}
                    className="rounded-full p-2 hover:bg-muted transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
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
                    {recipe.ingredients.map((ing, i) => (
                      <div
                        key={ing.item}
                        className={cn(
                          "flex items-baseline justify-between gap-2 rounded-lg px-3 py-2",
                          i % 2 === 0 ? "bg-muted/40" : "bg-amber-50/60",
                        )}
                      >
                        <span className="text-sm font-medium">{ing.item}</span>
                        <span className="text-sm text-accent font-semibold whitespace-nowrap">
                          {ing.amount}
                        </span>
                      </div>
                    ))}
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
                        <span
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-white bg-gradient-to-br",
                            gradient,
                          )}
                        >
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
              <div className="p-4 border-t border-border flex gap-3 bg-gradient-to-r from-card to-primary/3">
                <Button
                  data-ocid="recipe.save_button"
                  onClick={handleSave}
                  disabled={saved || addRecipe.isPending}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  {addRecipe.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-200" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saved
                    ? "Saved!"
                    : addRecipe.isPending
                      ? "Saving..."
                      : "Save Recipe"}
                </Button>
                <Button
                  data-ocid="recipe.close_button"
                  variant="outline"
                  onClick={() => setExpanded(false)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
