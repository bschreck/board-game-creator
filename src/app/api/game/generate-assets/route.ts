import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runGenerationPipeline, type GenerationContext } from "@/lib/asset-generation";

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

  // Create or update generation job
  const job = await prisma.generationJob.upsert({
    where: { gameId },
    create: {
      gameId,
      status: "generating",
      phase: "rules",
      progress: 0,
      startedAt: new Date(),
    },
    update: {
      status: "generating",
      phase: "rules",
      progress: 0,
      error: null,
      startedAt: new Date(),
      completedAt: null,
    },
  });

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

  // Run pipeline in the background using waitUntil pattern
  // The response returns immediately with the job ID
  const pipelinePromise = runGenerationPipeline(ctx).catch((err) => {
    console.error("Pipeline error:", err);
  });

  // Use Next.js after() if available, otherwise the promise runs in the background
  try {
    const { after } = await import("next/server");
    if (typeof after === "function") {
      after(pipelinePromise);
    }
  } catch {
    // after() not available, pipeline runs in background via the promise
    void pipelinePromise;
  }

  return NextResponse.json({ jobId: job.id, status: "generating" });
}
