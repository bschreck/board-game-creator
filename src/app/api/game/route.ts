import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { baseGame, name, theme, rules, photos, tier, boardPreview } = body;

  if (!baseGame || !name) {
    return NextResponse.json(
      { error: "Base game and name are required" },
      { status: 400 }
    );
  }

  const game = await prisma.game.create({
    data: {
      userId: session.user.id,
      baseGame,
      name,
      theme: theme || "",
      rules: JSON.stringify(rules || []),
      customRules: JSON.stringify(rules || []),
      photos: JSON.stringify(photos || []),
      tier: tier || "premium",
      boardPreview: boardPreview || null,
      status: "draft",
    },
  });

  return NextResponse.json({ gameId: game.id });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const games = await prisma.game.findMany({
    where: { userId: session.user.id },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ games });
}
