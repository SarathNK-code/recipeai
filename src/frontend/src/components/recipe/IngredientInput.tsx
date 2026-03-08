import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, useState } from "react";

const COMMON_INGREDIENTS = [
  "Tomatoes",
  "Onions",
  "Garlic",
  "Olive Oil",
  "Eggs",
  "Flour",
  "Butter",
  "Milk",
  "Salt",
  "Pepper",
  "Rice",
  "Pasta",
  "Chicken",
  "Potatoes",
  "Carrots",
  "Spinach",
  "Cheese",
  "Lemon",
  "Ginger",
  "Cumin",
];

interface IngredientInputProps {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
}

export function IngredientInput({
  ingredients,
  onAdd,
  onRemove,
}: IngredientInputProps) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      onAdd(trimmed);
      setValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const suggestions = COMMON_INGREDIENTS.filter(
    (s) => !ingredients.includes(s),
  ).slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Input row */}
      <div className="flex gap-2">
        <Input
          data-ocid="ingredients.input"
          placeholder="e.g. Tomatoes, Garlic, Olive Oil..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-card border-border focus-visible:ring-accent"
        />
        <Button
          data-ocid="ingredients.add_button"
          onClick={handleAdd}
          disabled={!value.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Added chips with count badge */}
      {ingredients.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-cabinet uppercase tracking-wider text-muted-foreground">
              Added
            </span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
              {ingredients.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {ingredients.map((ing, i) => (
                <motion.span
                  key={ing}
                  data-ocid={`ingredients.item.${i + 1}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-default bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-foreground transition-all duration-150 hover:border-primary/40"
                >
                  <Leaf className="w-3 h-3 text-accent shrink-0" />
                  {ing}
                  <button
                    type="button"
                    onClick={() => onRemove(ing)}
                    className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                    aria-label={`Remove ${ing}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Quick-add suggestions */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-cabinet uppercase tracking-wider">
          Quick Add
        </p>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <motion.button
              type="button"
              key={s}
              onClick={() => onAdd(s)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors duration-150"
            >
              + {s}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
