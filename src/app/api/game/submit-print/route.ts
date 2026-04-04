import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitGameOrder, type GameOrderSpec } from "@/lib/game-crafter";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId } = await req.json();
  if (!gameId) {
    return NextResponse.json({ error: "gameId required" }, { status: 400 });
  }

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
    include: { order: true, assets: true },
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  if (!game.order || game.order.paymentStatus !== "paid") {
    return NextResponse.json({ error: "Payment required before printing" }, { status: 400 });
  }

  // Check TGC credentials
  if (!process.env.TGC_API_KEY || !process.env.TGC_USERNAME || !process.env.TGC_PASSWORD) {
    return NextResponse.json({ error: "Print service not configured" }, { status: 503 });
  }

  // Gather assets
  const cardAssets = game.assets.filter((a) => a.type === "card");
  const cardBackAsset = game.assets.find((a) => a.type === "card-back");
  const boxFrontAsset = game.assets.find((a) => a.type === "box-front");
  const boxBackAsset = game.assets.find((a) => a.type === "box-back");
  const manualAssets = game.assets.filter((a) => a.type === "manual").sort((a, b) => {
    const aPage = JSON.parse(a.metadata || "{}").pageNumber || 0;
    const bPage = JSON.parse(b.metadata || "{}").pageNumber || 0;
    return aPage - bPage;
  });

  if (!cardBackAsset || cardAssets.length === 0 || !boxFrontAsset || !boxBackAsset) {
    return NextResponse.json({ error: "Missing required assets. Please generate assets first." }, { status: 400 });
  }

  // Convert data URLs to Buffers
  function dataUrlToBuffer(dataUrl: string): Buffer {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(base64, "base64");
  }

  try {
    // Update generation job
    await prisma.generationJob.update({
      where: { gameId },
      data: { status: "submitting", phase: "print-submit" },
    });

    const giftAddresses = JSON.parse(game.order.giftAddresses || "[]");
    const quantity = 1 + (giftAddresses.length || 0);

    const spec: GameOrderSpec = {
      gameName: game.name,
      gameDescription: `Custom ${game.baseGame}-style board game: "${game.theme}"`,
      cardBackImage: dataUrlToBuffer(cardBackAsset.url),
      cardFaceImages: cardAssets.map((a) => {
        const meta = JSON.parse(a.metadata || "{}");
        return {
          name: a.name,
          image: dataUrlToBuffer(a.url),
          quantity: meta.quantity || 1,
        };
      }),
      boxFrontImage: dataUrlToBuffer(boxFrontAsset.url),
      boxBackImage: dataUrlToBuffer(boxBackAsset.url),
      manualPages: manualAssets.map((a) => dataUrlToBuffer(a.url)),
      shipping: {
        name: game.order.shippingName,
        address: game.order.shippingAddress,
        city: game.order.shippingCity,
        state: game.order.shippingState,
        zip: game.order.shippingZip,
        country: game.order.shippingCountry,
      },
      quantity,
    };

    const result = await submitGameOrder(spec);

    // Update records
    await prisma.generationJob.update({
      where: { gameId },
      data: {
        status: "complete",
        phase: "complete",
        tgcGameId: result.tgcGameId,
        tgcOrderId: result.receiptId,
        completedAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: game.order.id },
      data: {
        tgcReceiptId: result.receiptId,
        status: "processing",
      },
    });

    await prisma.game.update({
      where: { id: gameId },
      data: { status: "printing" },
    });

    return NextResponse.json({
      success: true,
      tgcGameId: result.tgcGameId,
      receiptId: result.receiptId,
    });
  } catch (e) {
    console.error("Print submission failed:", e);
    await prisma.generationJob.update({
      where: { gameId },
      data: {
        status: "failed",
        error: e instanceof Error ? e.message : "Print submission failed",
      },
    });
    return NextResponse.json({ error: "Failed to submit to print service" }, { status: 500 });
  }
}
