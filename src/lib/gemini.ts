import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

export function getGemini(): GoogleGenerativeAI {
  if (!_genAI) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required");
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
}

const TEXT_MODELS = ["gemini-2.5-pro", "gemini-2.5-flash"] as const;
const IMAGE_MODEL = "gemini-2.0-flash-exp";

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

/**
 * Extract the first inline image from a Gemini response as a Buffer.
 * Returns null if no image was found.
 */
export function extractImageFromResponse(response: GenerateContentResult): Buffer | null {
  const parts = response.response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inlineData = part.inlineData as { data: string; mimeType: string } | undefined;
    if (inlineData) {
      return Buffer.from(inlineData.data, "base64");
    }
  }
  return null;
}

/**
 * Extract the first inline image from a Gemini response as a data URL.
 * Returns null if no image was found.
 */
export function extractImageDataUrl(response: GenerateContentResult): string | null {
  const parts = response.response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inlineData = part.inlineData as { data: string; mimeType: string } | undefined;
    if (inlineData) {
      return `data:${inlineData.mimeType};base64,${inlineData.data}`;
    }
  }
  return null;
}

export { IMAGE_MODEL };
