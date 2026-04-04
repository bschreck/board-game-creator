import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!_genAI) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required");
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
}

// Model preferences: try pro first for quality, fall back to flash for speed
const TEXT_MODELS = ["gemini-2.5-pro", "gemini-2.5-flash"] as const;
const IMAGE_MODEL = "gemini-2.0-flash-exp"; // Supports image generation via responseModalities

export async function getTextModel(): Promise<GenerativeModel> {
  const genAI = getGemini();
  for (const modelName of TEXT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Quick test to verify model availability
      await model.generateContent("test");
      return model;
    } catch {
      console.warn(`Model ${modelName} unavailable, trying next...`);
    }
  }
  // Final fallback
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

// Cache the working text model name to avoid repeated probing
let _cachedTextModel: string | null = null;

export async function getCachedTextModel(): Promise<GenerativeModel> {
  const genAI = getGemini();
  if (_cachedTextModel) {
    return genAI.getGenerativeModel({ model: _cachedTextModel });
  }
  for (const modelName of TEXT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent("hi");
      _cachedTextModel = modelName;
      return model;
    } catch {
      console.warn(`Model ${modelName} unavailable, trying next...`);
    }
  }
  _cachedTextModel = "gemini-2.5-flash";
  return genAI.getGenerativeModel({ model: _cachedTextModel });
}

export function getImageModel(): GenerativeModel {
  const genAI = getGemini();
  return genAI.getGenerativeModel({ model: IMAGE_MODEL });
}

export { IMAGE_MODEL, TEXT_MODELS };
