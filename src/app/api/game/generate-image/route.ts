import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

type ImageType = "board" | "card" | "box-cover";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { imageType, baseGame, theme, gameName, rules, referenceStyle } = body as {
    imageType: ImageType;
    baseGame: string;
    theme?: string;
    gameName?: string;
    rules?: string[];
    referenceStyle?: string; // description of style to copy from another generated image
  };

  if (!imageType || !baseGame) {
    return NextResponse.json({ error: "imageType and baseGame required" }, { status: 400 });
  }

  try {
    const { getGemini } = await import("@/lib/gemini");
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const styleDirective = referenceStyle
      ? `\nIMPORTANT STYLE DIRECTIVE: Match this exact visual style: ${referenceStyle}\nUse the same color palette, art style, line work, and overall aesthetic.`
      : "";

    const prompts: Record<ImageType, string> = {
      board: `Generate a game board illustration for a custom board game:
Game: "${gameName || "Custom Game"}" based on ${baseGame}
Theme: "${theme || "colorful and fun"}"
${rules?.length ? `Special gameplay elements: ${rules.slice(0, 3).join("; ")}` : ""}
${styleDirective}

Design a complete game board with themed spaces/track/grid, clear play areas, decorative borders, and space for tokens. Professional board game quality, vibrant colors, top-down view.`,

      card: `Generate a sample game card design for a custom board game:
Game: "${gameName || "Custom Game"}" based on ${baseGame}
Theme: "${theme || "colorful and fun"}"
${styleDirective}

Design a professional card with a title area at top, thematic illustration in center, text area at bottom. Include a decorative border frame. Card game quality artwork, print-ready design.`,

      "box-cover": `Generate professional board game box cover art:
Game: "${gameName || "Custom Game"}" based on ${baseGame}
Theme: "${theme || "colorful and fun"}"
${rules?.length ? `Key features: ${rules.slice(0, 3).join("; ")}` : ""}
${styleDirective}

Design a vibrant, eye-catching box cover with the game title "${gameName || "Custom Game"}" prominently displayed, thematic illustration, player count (2-6), age rating (12+). Retail board game box art quality.`,
    };

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompts[imageType] }] }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"] as unknown as undefined,
      } as Record<string, unknown>,
    } as Parameters<typeof model.generateContent>[0]);

    const parts = response.response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      const inlineData = (part as { inlineData?: { data: string; mimeType: string } }).inlineData;
      if (inlineData) {
        const dataUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;
        return NextResponse.json({ image: dataUrl });
      }
    }

    // Fallback: generate a text description via Cerebras if Gemini image gen fails
    const { cerebrasGenerate } = await import("@/lib/cerebras");
    const description = await cerebrasGenerate(
      `Describe in vivid detail what the ${imageType} art for a "${gameName}" game (based on ${baseGame}, themed "${theme}") would look like. Include colors, composition, key visual elements. 2-3 sentences.`
    );
    return NextResponse.json({ image: null, description });
  } catch (e) {
    console.error("Image generation failed:", e);
    // Try Cerebras text fallback
    try {
      const { cerebrasGenerate } = await import("@/lib/cerebras");
      const description = await cerebrasGenerate(
        `Describe in vivid detail what the ${imageType} art for a "${gameName}" game (based on ${baseGame}, themed "${theme}") would look like. Include colors, composition, key visual elements. 2-3 sentences.`
      );
      return NextResponse.json({ image: null, description });
    } catch {
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }
  }
}
