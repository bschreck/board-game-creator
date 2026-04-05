import { prisma } from "./prisma";

/**
 * Creates or resets a generation job for the given game.
 */
export async function createOrResetGenerationJob(gameId: string) {
  return prisma.generationJob.upsert({
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
}

/**
 * Runs a promise in the background using Next.js after() if available,
 * otherwise lets the promise run detached.
 */
export async function startBackgroundPipeline(pipelinePromise: Promise<void>) {
  try {
    const { after } = await import("next/server");
    if (typeof after === "function") {
      after(pipelinePromise);
      return;
    }
  } catch {
    // after() not available
  }
  void pipelinePromise;
}

/**
 * Safely parse a JSON string as an array of strings, returning fallback on failure.
 */
export function parseJsonArray(val: string | null | undefined, fallback: string[] = []): string[] {
  if (!val) return fallback;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Escape HTML special characters for safe interpolation.
 */
export function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
