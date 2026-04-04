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
  if (!gameId) {
    return NextResponse.json({ error: "gameId required" }, { status: 400 });
  }

  // Verify game ownership
  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const job = await prisma.generationJob.findUnique({
    where: { gameId },
  });

  if (!job) {
    return NextResponse.json({ status: "none", progress: 0 });
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    phase: job.phase,
    progress: job.progress,
    currentStep: job.currentStep,
    totalSteps: job.totalSteps,
    error: job.error,
    tgcGameId: job.tgcGameId,
    tgcOrderId: job.tgcOrderId,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  });
}
