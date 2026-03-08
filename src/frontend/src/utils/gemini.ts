const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as
  | string
  | undefined;
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export function hasGeminiKey(): boolean {
  return !!GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0;
}

interface GeminiTextPart {
  text: string;
}

interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

type GeminiPart = GeminiTextPart | GeminiInlineDataPart;

async function callGemini(parts: GeminiPart[]): Promise<string> {
  if (!hasGeminiKey()) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

// Convert a File to base64 string
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix, keep only base64 content
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
  const base64 = await fileToBase64(imageFile);

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

  const text = await callGemini([
    { text: prompt },
    { inlineData: { mimeType: imageFile.type || "image/jpeg", data: base64 } },
  ]);

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

  const text = await callGemini([{ text: prompt }]);

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
