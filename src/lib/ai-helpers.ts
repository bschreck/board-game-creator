export async function generateText(params: {
  field: string;
  baseGame: string;
  theme?: string;
  gameName?: string;
  rules?: string[];
  photoContext?: string;
}): Promise<string | null> {
  try {
    const res = await fetch("/api/game/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      console.error("generateText failed:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    return data.text || null;
  } catch (e) {
    console.error("generateText error:", e);
    return null;
  }
}

export async function generateImagePrompt(params: {
  imageType: string;
  baseGame: string;
  theme?: string;
  gameName?: string;
  rules?: string[];
}): Promise<string | null> {
  try {
    const res = await fetch("/api/game/generate-image-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.prompt || null;
  } catch {
    return null;
  }
}
