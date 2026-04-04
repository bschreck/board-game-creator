import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!_genAI) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required");
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
}
