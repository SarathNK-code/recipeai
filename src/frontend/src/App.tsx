import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { BookMarked, ChefHat, Sparkles, Utensils } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { MyRecipes } from "./pages/MyRecipes";
import { MyUtensils } from "./pages/MyUtensils";
import { RecipeBuilder } from "./pages/RecipeBuilder";

type Page = "builder" | "utensils" | "recipes";

const navItems: Array<{
  id: Page;
  label: string;
  ocid: string;
  icon: React.ReactNode;
}> = [
  {
    id: "builder",
    label: "Recipe Builder",
    ocid: "nav.recipe_builder.link",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "utensils",
    label: "My Utensils",
    ocid: "nav.my_utensils.link",
    icon: <Utensils className="w-4 h-4" />,
  },
  {
    id: "recipes",
    label: "My Recipes",
    ocid: "nav.my_recipes.link",
    icon: <BookMarked className="w-4 h-4" />,
  },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function App() {
  const [activePage, setActivePage] = useState<Page>("builder");

  return (
    <div className="min-h-screen bg-background flex flex-col grain-overlay">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm shadow-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-sm">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-fraunces text-xl font-bold text-foreground tracking-tight hover:text-accent transition-colors duration-200 cursor-default">
                RecipeAI
              </span>
            </div>

            {/* Nav tabs */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={item.ocid}
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    activePage === item.id
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        {/* Gradient separator line */}
        <div className="h-px bg-gradient-to-r from-primary/30 via-accent/50 to-primary/30" />
      </header>

      {/* Main content with page transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {activePage === "builder" && <RecipeBuilder />}
            {activePage === "utensils" && <MyUtensils />}
            {activePage === "recipes" && <MyRecipes />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with{" "}
          <span className="text-destructive">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
