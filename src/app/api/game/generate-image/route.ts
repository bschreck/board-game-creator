import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

type ImageType = "board" | "card" | "box-cover";

function buildPrompt(
  imageType: ImageType,
  gameName: string,
  baseGame: string,
  theme: string,
  rules: string[],
  referenceStyle?: string
): string {
  const styleDirective = referenceStyle
    ? `\nIMPORTANT STYLE DIRECTIVE: Match this exact visual style: ${referenceStyle}\nUse the same color palette, art style, line work, and overall aesthetic.`
    : "";

  const prompts: Record<ImageType, string> = {
    board: `Generate a game board illustration for a custom board game:
Game: "${gameName}" based on ${baseGame}
Theme: "${theme}"
${rules.length ? `Special gameplay elements: ${rules.slice(0, 3).join("; ")}` : ""}
${styleDirective}

Design a complete game board with themed spaces/track/grid, clear play areas, decorative borders, and space for tokens. Professional board game quality, vibrant colors, top-down view.`,

    card: `Generate a sample game card design for a custom board game:
Game: "${gameName}" based on ${baseGame}
Theme: "${theme}"
${styleDirective}

Design a professional card with a title area at top, thematic illustration in center, text area at bottom. Include a decorative border frame. Card game quality artwork, print-ready design.`,

    "box-cover": `Generate professional board game box cover art:
Game: "${gameName}" based on ${baseGame}
Theme: "${theme}"
${rules.length ? `Key features: ${rules.slice(0, 3).join("; ")}` : ""}
${styleDirective}

Design a vibrant, eye-catching box cover with the game title "${gameName}" prominently displayed, thematic illustration, player count (2-6), age rating (12+). Retail board game box art quality.`,
  };

  return prompts[imageType];
}

async function tryGeminiImageGen(prompt: string): Promise<string | null> {
  const { getGemini } = await import("@/lib/gemini");
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"] as unknown as undefined,
    } as Record<string, unknown>,
  } as Parameters<typeof model.generateContent>[0]);

  const parts = response.response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inlineData = (part as { inlineData?: { data: string; mimeType: string } }).inlineData;
    if (inlineData) {
      return `data:${inlineData.mimeType};base64,${inlineData.data}`;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { imageType, baseGame, theme, gameName, rules, referenceStyle } = body as {
    imageType: ImageType;
    baseGame: string;
    theme?: string;
    gameName?: string;
    rules?: string[];
    referenceStyle?: string;
  };

  if (!imageType || !baseGame) {
    return NextResponse.json({ error: "imageType and baseGame required" }, { status: 400 });
  }

  const name = gameName || "Custom Game";
  const themeStr = theme || "colorful and fun";
  const rulesList = rules || [];

  // Step 1: Try direct Gemini image generation with built-in prompt
  try {
    const directPrompt = buildPrompt(imageType, name, baseGame, themeStr, rulesList, referenceStyle);
    const image = await tryGeminiImageGen(directPrompt);
    if (image) {
      return NextResponse.json({ image });
    }
  } catch (e) {
    console.warn("Direct Gemini image gen failed, trying two-step approach:", e);
  }

  // Step 2: Two-step approach - generate a detailed prompt via Cerebras, then use it with Gemini
  try {
    const { cerebrasGenerate } = await import("@/lib/cerebras");
    const detailedPrompt = await cerebrasGenerate(
      `Write a detailed, vivid image generation prompt for an AI image generator. The image should be ${imageType} art for a board game called "${name}" based on ${baseGame} with a "${themeStr}" theme.${referenceStyle ? ` Style: ${referenceStyle}` : ""} Respond with ONLY the prompt, no explanation. Make it detailed and specific about composition, colors, and style.`
    );

    if (detailedPrompt) {
      const image = await tryGeminiImageGen(detailedPrompt);
      if (image) {
        return NextResponse.json({ image });
      }
    }
  } catch (e) {
    console.warn("Two-step image gen failed:", e);
  }

  // Step 3: Final fallback - return error instead of text description
  return NextResponse.json(
    { error: "Image generation is temporarily unavailable. Please try again." },
    { status: 503 }
  );
}
