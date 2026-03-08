const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

export const STORAGE_KEY = "recipeai_openai_key";

function getApiKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim().length > 0) return stored.trim();
  const env = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  return env?.trim() ?? "";
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

// Convert a File to base64 data URL string
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callOpenAI(
  messages: Array<{
    role: string;
    content:
      | string
      | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }>,
  maxTokens = 4096,
): Promise<string> {
  if (!hasApiKey()) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  return text;
}

// ─── Utensil Photo Analysis ───────────────────────────────────────────────────

export interface UtensilAnalysisResult {
  name: string;
  type: string;
  size: string;
  description: string;
  confidence: "high" | "medium" | "low";
}

export async function analyzeUtensilPhoto(
  imageFile: File,
): Promise<UtensilAnalysisResult> {
  const dataUrl = await fileToDataUrl(imageFile);

  const prompt = `Analyze this image of a kitchen utensil or cookware. Please identify:
1. The name of the utensil
2. Its type/category (e.g., spoon, pan, pot, bowl, measuring cup)
3. An estimate of its size/capacity (in ml, liters, cups, or appropriate unit)
4. A brief description including material and notable features

Respond ONLY in this exact JSON format (no markdown):
{
  "name": "utensil name",
  "type": "utensil type/category",
  "size": "estimated size with unit",
  "description": "brief description",
  "confidence": "high|medium|low"
}`;

  const text = await callOpenAI(
    [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    1024,
  );

  // Parse JSON from response
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  try {
    const result = JSON.parse(cleaned) as UtensilAnalysisResult;
    return result;
  } catch {
    // Fallback parsing
    return {
      name: "Unknown Utensil",
      type: "unknown",
      size: "unknown",
      description: text,
      confidence: "low",
    };
  }
}

// ─── Recipe Generation ────────────────────────────────────────────────────────

export interface RecipeIngredient {
  item: string;
  amount: string;
}

export interface AIRecipe {
  name: string;
  cookingTime: string;
  difficulty: string;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export interface RecipeGenerationResult {
  recipes: AIRecipe[];
  rawText?: string;
}

export async function generateRecipes(
  ingredients: string[],
  utensils: Array<{ name: string; size: string; type: string }>,
): Promise<RecipeGenerationResult> {
  const ingredientList = ingredients.join(", ");
  const utensilList =
    utensils.length > 0
      ? utensils.map((u) => `${u.name} (${u.type}, ${u.size})`).join(", ")
      : "standard kitchen utensils";

  const prompt = `You are an expert chef. The user has these ingredients: ${ingredientList}

Their available utensils/cookware: ${utensilList}

Please suggest 2-3 recipes they can make. For quantities, use the specific utensils they have (e.g., "2 tablespoons", "1 cup", "half a small pan", etc.). Adapt measurements to their utensils.

Respond ONLY with valid JSON in this exact format (no markdown code blocks, no extra text):
{
  "recipes": [
    {
      "name": "Recipe Name",
      "cookingTime": "25 minutes",
      "difficulty": "Easy|Medium|Hard",
      "ingredients": [
        {"item": "ingredient name", "amount": "quantity using their utensils"}
      ],
      "steps": [
        "Step 1: Clear description...",
        "Step 2: ..."
      ]
    }
  ]
}`;

  const text = await callOpenAI([{ role: "user", content: prompt }]);

  // Try to parse JSON, handle markdown code blocks
  const cleaned = text
    .replace(/```json\n?|\n?```/g, "")
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "}")
    .trim();

  try {
    const result = JSON.parse(cleaned) as RecipeGenerationResult;
    if (result.recipes && Array.isArray(result.recipes)) {
      return result;
    }
    throw new Error("Invalid structure");
  } catch {
    // Return raw text fallback
    return {
      recipes: [],
      rawText: text,
    };
  }
}
