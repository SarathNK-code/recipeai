import { cn } from "@/lib/utils";
import { Check, ChefHat, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface LocalUtensil {
  name: string;
  type: string;
  size: string;
  emoji: string;
}

const COMMON_UTENSILS: LocalUtensil[] = [
  { name: "Teaspoon", type: "spoon", size: "5ml", emoji: "🥄" },
  { name: "Tablespoon", type: "spoon", size: "15ml", emoji: "🥄" },
  { name: "Cup", type: "measuring", size: "240ml", emoji: "🥛" },
  { name: "Small Pan", type: "pan", size: "20cm", emoji: "🍳" },
  { name: "Large Pan", type: "pan", size: "30cm", emoji: "🍳" },
  { name: "Small Pot", type: "pot", size: "1L", emoji: "🫕" },
  { name: "Large Pot", type: "pot", size: "3L", emoji: "🫕" },
  { name: "Small Bowl", type: "bowl", size: "300ml", emoji: "🥣" },
  { name: "Large Bowl", type: "bowl", size: "1.5L", emoji: "🥣" },
  { name: "Ladle", type: "utensil", size: "60ml", emoji: "🍵" },
  { name: "Spatula", type: "utensil", size: "standard", emoji: "🧑‍🍳" },
  { name: "Wok", type: "pan", size: "32cm", emoji: "🥘" },
  { name: "Baking Tray", type: "baking", size: "30x20cm", emoji: "🍞" },
  { name: "Grater", type: "utensil", size: "standard", emoji: "🧀" },
];

interface SelectedUtensil {
  name: string;
  type: string;
  size: string;
}

interface UtensilPickerProps {
  selectedUtensils: SelectedUtensil[];
  onAdd: (utensil: SelectedUtensil) => void;
  onRemove: (name: string) => void;
}

export function UtensilPicker({
  selectedUtensils,
  onAdd,
  onRemove,
}: UtensilPickerProps) {
  const isSelected = (name: string) =>
    selectedUtensils.some((u) => u.name === name);

  return (
    <div className="space-y-4">
      {/* Grid of common utensils */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {COMMON_UTENSILS.map((u, i) => {
          const selected = isSelected(u.name);
          return (
            <button
              type="button"
              key={u.name}
              data-ocid={`utensils.pick_list.item.${i + 1}`}
              onClick={() => {
                if (selected) {
                  onRemove(u.name);
                } else {
                  onAdd({ name: u.name, type: u.type, size: u.size });
                }
              }}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all duration-150 text-sm",
                selected
                  ? "bg-accent/15 border-accent text-foreground"
                  : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-lg leading-none">{u.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs leading-tight truncate">
                  {u.name}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {u.size}
                </p>
              </div>
              {selected && (
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected utensils as chips */}
      {selectedUtensils.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-cabinet uppercase tracking-wider">
            Selected ({selectedUtensils.length})
          </p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedUtensils.map((u, i) => (
                <motion.span
                  key={u.name}
                  data-ocid={`utensils.item.${i + 1}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="ingredient-chip"
                >
                  <ChefHat className="w-3 h-3 text-accent" />
                  {u.name}
                  <span className="text-xs text-muted-foreground">
                    {u.size}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(u.name)}
                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                    aria-label={`Remove ${u.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
