import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateCardImage,
  generateBoxArt,
  generateBoardImage,
  generateManualPage,
} from "@/lib/asset-generation";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId, gameId } = await req.json();
  if (!assetId || !gameId) {
    return NextResponse.json({ error: "assetId and gameId required" }, { status: 400 });
  }

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const asset = await prisma.gameAsset.findFirst({
    where: { id: assetId, gameId },
  });
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const rules = JSON.parse(game.rules || "[]");

  try {
    let newBuffer: Buffer | null = null;

    switch (asset.type) {
      case "card":
      case "card-back": {
        const meta = JSON.parse(asset.metadata || "{}");
        newBuffer = await generateCardImage({
          cardName: asset.name,
          cardType: meta.cardType || "Card",
          description: meta.description || "",
          effect: meta.effect || "",
          gameName: game.name,
          theme: game.theme || "",
          isBack: asset.type === "card-back",
        });
        break;
      }
      case "box-front":
      case "box-back": {
        newBuffer = await generateBoxArt({
          gameName: game.name,
          theme: game.theme || "",
          baseGame: game.baseGame,
          rules,
          side: asset.type === "box-front" ? "front" : "back",
        });
        break;
      }
      case "board": {
        newBuffer = await generateBoardImage({
          gameName: game.name,
          theme: game.theme || "",
          baseGame: game.baseGame,
          rules,
        });
        break;
      }
      case "manual": {
        const meta = JSON.parse(asset.metadata || "{}");
        newBuffer = await generateManualPage({
          gameName: game.name,
          theme: game.theme || "",
          pageContent: meta.content || asset.name,
          pageNumber: meta.pageNumber || 1,
          totalPages: meta.totalPages || 1,
        });
        break;
      }
      default:
        return NextResponse.json({ error: "Cannot regenerate this asset type" }, { status: 400 });
    }

    if (!newBuffer) {
      return NextResponse.json({ error: "Regeneration failed — no image produced" }, { status: 500 });
    }

    const newUrl = `data:image/png;base64,${newBuffer.toString("base64")}`;
    await prisma.gameAsset.update({
      where: { id: assetId },
      data: { url: newUrl, updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      asset: { id: assetId, url: newUrl },
    });
  } catch (e) {
    console.error("Asset regeneration failed:", e);
    return NextResponse.json({ error: "Regeneration failed" }, { status: 500 });
  }
}
