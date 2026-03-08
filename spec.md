# RecipeAI

## Current State
- AI integration uses Google Gemini (`utils/gemini.ts`) with `VITE_GEMINI_API_KEY` for both utensil photo analysis and recipe generation
- UI is functional but uses basic card/panel layout with moderate visual richness
- Navigation is a compact top bar with icon + text tabs
- RecipeBuilder has a two-column layout with ingredients and utensils on the left, recipes on the right
- API key notice is a plain amber banner when Gemini key is missing
- RecipeCard shows recipe details in a modal overlay
- MyRecipes and MyUtensils pages are functional but visually minimal

## Requested Changes (Diff)

### Add
- New `utils/openai.ts` replacing `utils/gemini.ts` — uses OpenAI Chat Completions API (`gpt-4o`) for recipe generation and `gpt-4o` vision for utensil photo analysis
- `VITE_OPENAI_API_KEY` environment variable support
- Richer visual design: gradient hero, improved card shadows, better typography hierarchy, step indicators, animated progress states
- API key notice updated to reference OpenAI

### Modify
- `utils/gemini.ts` → replaced entirely by `utils/openai.ts` with same exported interface: `hasApiKey()`, `analyzeUtensilPhoto()`, `generateRecipes()`
- All import references updated from `utils/gemini` to `utils/openai`
- `RecipeBuilder.tsx`: Update API key check from `hasGeminiKey` to `hasApiKey`, update env var reference in banner
- `UtensilCamera.tsx`: Update API key check and env var reference
- UI enhancements across all pages:
  - Hero section: richer gradient with subtle food-themed pattern
  - Cards: increased padding, richer border accents, hover states
  - RecipeCard: ingredient chips styled with food-colored backgrounds
  - Steps: numbered step indicators with gradient background
  - Navigation: slightly taller, logo area with subtle gradient
  - MyRecipes/MyUtensils: improved grid layout, richer empty states

### Remove
- `utils/gemini.ts` — replaced by `utils/openai.ts`
- All references to `VITE_GEMINI_API_KEY`
- All references to `hasGeminiKey`

## Implementation Plan
1. Create `src/frontend/src/utils/openai.ts` with same interface as gemini.ts, calling OpenAI Chat Completions and Vision APIs
2. Update `RecipeBuilder.tsx` — import from openai, update env var label, update API check function name
3. Update `UtensilCamera.tsx` — import from openai, update env var label, update API check function name
4. Update `RecipeCard.tsx` — update import from openai
5. Enhance UI across all components for richer look and feel
6. Validate (typecheck, lint, build)
