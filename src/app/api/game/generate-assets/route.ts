import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runGenerationPipeline, type GenerationContext } from "@/lib/asset-generation";
import { createOrResetGenerationJob, startBackgroundPipeline } from "@/lib/generation-helpers";

export const maxDuration = 300; // 5 minutes max for serverless

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
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Check if there's already an active generation job
  const existingJob = await prisma.generationJob.findUnique({
    where: { gameId },
  });
  if (existingJob && ["generating", "uploading", "submitting"].includes(existingJob.status)) {
    return NextResponse.json({ error: "Generation already in progress", jobId: existingJob.id }, { status: 409 });
  }

  const job = await createOrResetGenerationJob(gameId);

  // Clear old assets if regenerating
  await prisma.gameAsset.deleteMany({ where: { gameId } });

  const ctx: GenerationContext = {
    gameId,
    gameName: game.name,
    baseGame: game.baseGame,
    theme: game.theme || "",
    rules: JSON.parse(game.rules || "[]"),
    tier: game.tier,
    photos: JSON.parse(game.photos || "[]"),
  };

  const pipelinePromise = runGenerationPipeline(ctx).catch((err) => {
    console.error("Pipeline error:", err);
  });
  await startBackgroundPipeline(pipelinePromise);

  return NextResponse.json({ jobId: job.id, status: "generating" });
}
