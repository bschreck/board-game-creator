import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gameId = req.nextUrl.searchParams.get("gameId");
  const type = req.nextUrl.searchParams.get("type"); // optional filter
  if (!gameId) {
    return NextResponse.json({ error: "gameId required" }, { status: 400 });
  }

  // Verify ownership
  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const where: { gameId: string; type?: string } = { gameId };
  if (type) where.type = type;

  const assets = await prisma.gameAsset.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    assets: assets.map((a) => ({
      id: a.id,
      type: a.type,
      name: a.name,
      url: a.url,
      format: a.format,
      metadata: JSON.parse(a.metadata || "{}"),
      createdAt: a.createdAt,
    })),
  });
}
