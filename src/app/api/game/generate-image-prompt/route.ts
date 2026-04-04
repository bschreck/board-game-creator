import { NextRequest, NextResponse } from "next/server";

type ImageType = "board" | "card" | "box-cover";

const PROMPTS: Record<ImageType, (ctx: { baseGame: string; theme: string; gameName: string; rules: string[] }) => string> = {
  board: ({ baseGame, theme, gameName }) =>
    `Generate a detailed image generation prompt for a custom board game board illustration.
Game: "${gameName || "Custom Game"}" based on ${baseGame}
Theme: "${theme || "colorful and fun"}"
The prompt should describe: the board layout, art style, color palette, decorative elements, and thematic details.
Write it as a single paragraph image prompt suitable for an AI image generator. Respond with ONLY the prompt.`,
  card: ({ baseGame, theme, gameName }) =>
    `Generate a detailed image generation prompt for a game card illustration.
Game: "${gameName || "Custom Game"}" based on ${baseGame}
Theme: "${theme || "colorful and fun"}"
The prompt should describe: the card design, illustration style, border/frame design, and thematic artwork.
Write it as a single paragraph image prompt suitable for an AI image generator. Respond with ONLY the prompt.`,
  "box-cover": ({ baseGame, theme, gameName, rules }) =>
    `Generate a detailed image generation prompt for a board game box cover.
Game: "${gameName || "Custom Game"}" based on ${baseGame}
Theme: "${theme || "colorful and fun"}"
${rules?.length ? `Special rules that hint at gameplay: ${rules.slice(0, 3).join("; ")}` : ""}
The prompt should describe: the main illustration, title treatment, character/element placement, color scheme, and overall mood.
Style: Professional board game box art, vibrant, eye-catching, retail quality.
Write it as a single paragraph image prompt suitable for an AI image generator. Respond with ONLY the prompt.`,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { imageType, baseGame, theme, gameName, rules } = body as {
    imageType: ImageType;
    baseGame: string;
    theme?: string;
    gameName?: string;
    rules?: string[];
  };

  if (!imageType || !baseGame) {
    return NextResponse.json({ error: "imageType and baseGame are required" }, { status: 400 });
  }

  const promptFn = PROMPTS[imageType];
  if (!promptFn) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }

  try {
    const { getCachedTextModel } = await import("@/lib/gemini");
    const model = await getCachedTextModel();
    const prompt = promptFn({ baseGame, theme: theme || "", gameName: gameName || "", rules: rules || [] });
    const response = await model.generateContent(prompt);
    const text = response.response.text()?.trim();
    return NextResponse.json({ prompt: text });
  } catch (e) {
    console.error("Image prompt generation failed:", e);
    const message = e instanceof Error && e.message.includes("API_KEY")
      ? "AI generation is not configured"
      : "Failed to generate image prompt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
