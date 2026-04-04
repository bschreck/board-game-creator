import { NextRequest, NextResponse } from "next/server";
import { generatePreviewAssets, type GenerationContext } from "@/lib/asset-generation";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { gameId, gameName, baseGame, theme, rules, tier, photos } = body;

  if (!baseGame || !gameName) {
    return NextResponse.json({ error: "baseGame and gameName required" }, { status: 400 });
  }

  try {
    const ctx: GenerationContext = {
      gameId: gameId || "preview",
      gameName,
      baseGame,
      theme: theme || "",
      rules: rules || [],
      tier: tier || "premium",
      photos: photos || [],
    };

    const previews = await generatePreviewAssets(ctx);
    return NextResponse.json(previews);
  } catch (e) {
    console.error("Preview generation failed:", e);
    return NextResponse.json({ error: "Failed to generate previews" }, { status: 500 });
  }
}
