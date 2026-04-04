import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { baseGame, theme, rules } = await req.json();

  if (!baseGame || !theme) {
    return NextResponse.json({ error: "baseGame and theme required" }, { status: 400 });
  }

  try {
    const { getCachedTextModel } = await import("@/lib/gemini");
    const model = await getCachedTextModel();

    const prompt = `Generate a detailed description of board game box cover art for a custom board game:
    
Base Game: ${baseGame}
Theme: ${theme}
Custom Rules: ${rules?.join(", ") || "Standard rules"}

Describe a vibrant, professional board game box cover illustration. Include the game title themed around "${theme}", 
describe game elements like the board, pieces, and cards in an appealing arrangement. 
Style: Modern board game box art, colorful, inviting, professional quality.
Keep it to 2-3 sentences.`;

    const response = await model.generateContent(prompt);
    const description = response.response.text()?.trim();

    return NextResponse.json({ 
      description,
      message: "Board preview concept generated. Full image generation coming soon!" 
    });
  } catch (e) {
    console.error("Preview generation failed:", e);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
