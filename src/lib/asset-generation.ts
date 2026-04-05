/**
 * Asset Generation Pipeline
 * Generates print-ready game assets using Gemini AI
 */

import { getCachedTextModel, getGemini, extractImageFromResponse } from "./gemini";
import { prisma } from "./prisma";
import { sendGenerationComplete } from "./email";

// ---- Print Specs ----
// TGC requires: PNG, 300 DPI, RGB, 1/8" bleed

export const PRINT_SPECS = {
  card: {
    // Poker size: 2.5" x 3.5" + 1/8" bleed on each side = 2.75" x 3.75"
    width: 825, // 2.75 * 300
    height: 1125, // 3.75 * 300
    bleed: 38, // 0.125 * 300 = 37.5 rounded up
    safeZone: 75, // 0.25 * 300
    dpi: 300,
  },
  boxFront: {
    // Standard tuck box front: ~4" x 5.5" + bleed
    width: 1275, // 4.25 * 300
    height: 1725, // 5.75 * 300
    bleed: 38,
    safeZone: 75,
    dpi: 300,
  },
  boxBack: {
    width: 1275,
    height: 1725,
    bleed: 38,
    safeZone: 75,
    dpi: 300,
  },
  board: {
    // Standard game board: ~19" x 19" + bleed (bi-fold)
    width: 5850, // 19.5 * 300
    height: 5850,
    bleed: 38,
    safeZone: 75,
    dpi: 300,
  },
  manual: {
    // Letter size: 8.5" x 11" + bleed
    width: 2625, // 8.75 * 300
    height: 3375, // 11.25 * 300
    bleed: 38,
    safeZone: 75,
    dpi: 300,
  },
} as const;

// ---- Types ----

export interface GenerationContext {
  gameId: string;
  gameName: string;
  baseGame: string;
  theme: string;
  rules: string[];
  tier: string;
  photos: string[];
}

type Phase = "rules" | "cards" | "box-art" | "board" | "manual" | "print-submit";

// ---- Progress Tracking ----

async function updateProgress(
  gameId: string,
  phase: Phase,
  currentStep: number,
  totalSteps: number,
  status = "generating"
) {
  const progress = Math.round((currentStep / totalSteps) * 100);
  await prisma.generationJob.update({
    where: { gameId },
    data: { phase, currentStep, totalSteps, progress, status },
  });
}

async function saveAsset(
  gameId: string,
  type: string,
  name: string,
  url: string,
  format = "png",
  metadata: Record<string, unknown> = {}
) {
  return prisma.gameAsset.create({
    data: {
      gameId,
      type,
      name,
      url,
      format,
      metadata: JSON.stringify(metadata),
    },
  });
}

// ---- Gemini Image Helper ----

async function generateGeminiImage(prompt: string): Promise<Buffer | null> {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"] as unknown as undefined,
    } as Record<string, unknown>,
  } as Parameters<typeof model.generateContent>[0]);

  return extractImageFromResponse(response);
}

// ---- Text Generation ----

export async function generateRulesDocument(ctx: GenerationContext): Promise<string> {
  const model = await getCachedTextModel();
  const prompt = `You are a professional board game technical writer. Write a COMPLETE, detailed rules document for a custom board game:

Game Name: "${ctx.gameName}"
Based On: ${ctx.baseGame}
Theme: "${ctx.theme}"
Custom Rule Modifications:
${ctx.rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Write a professional rules document that includes:
1. **Game Overview** — What the game is about, number of players, age range, play time
2. **Components List** — All pieces, cards, boards, tokens needed
3. **Setup** — Step-by-step setup instructions
4. **How to Play** — Detailed turn structure, phases, actions
5. **Custom Rules** — Explain each custom rule modification and how it changes gameplay
6. **Winning Conditions** — How to win the game
7. **Card Reference** — Quick reference for card types/effects
8. **FAQ / Edge Cases** — Common questions and clarifications

Use clear, concise language. Format with markdown headers and bullet points.
This is for a real printed manual — be thorough and precise.`;

  const response = await model.generateContent(prompt);
  return response.response.text()?.trim() || "";
}

export async function generateCardList(ctx: GenerationContext): Promise<{
  cards: { name: string; type: string; description: string; effect: string; quantity: number }[];
}> {
  const model = await getCachedTextModel();
  const prompt = `You are a board game designer. Design a complete card deck for:

Game: "${ctx.gameName}" based on ${ctx.baseGame}
Theme: "${ctx.theme}"
Custom Rules: ${ctx.rules.join("; ")}

Generate a complete deck of cards as a JSON array. Each card should have:
- name: card name (thematic to "${ctx.theme}")
- type: card category (e.g., "Action", "Property", "Event", "Character", "Special")
- description: flavor text for the card
- effect: game mechanic text
- quantity: how many copies in the deck (1-4)

Generate between 30-54 unique cards (a standard deck).
The cards should work together to create interesting gameplay.

Respond with ONLY valid JSON: { "cards": [...] }`;

  const response = await model.generateContent(prompt);
  const text = response.response.text()?.trim() || "{}";
  // Extract JSON from possible markdown code block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { cards: [] };
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { cards: [] };
  }
}

// ---- Image Generation ----

export async function generateCardImage(params: {
  cardName: string;
  cardType: string;
  description: string;
  effect: string;
  gameName: string;
  theme: string;
  isBack?: boolean;
}): Promise<Buffer | null> {
  try {
    const prompt = params.isBack
      ? `Generate a game card back design for "${params.gameName}" themed "${params.theme}". The design should be a decorative pattern with the game logo/name centered. Professional board game card back, high quality, print-ready. Size: 2.5x3.5 inches at 300 DPI. Include 1/8 inch bleed area around edges.`
      : `Generate a professional game card design for a board game card:
Card Name: "${params.cardName}"
Card Type: ${params.cardType}
Description: ${params.description}
Effect: ${params.effect}
Game: "${params.gameName}", Theme: "${params.theme}"

Design requirements:
- Card layout with clear title at top, illustration in center, text at bottom
- Thematic art matching "${params.theme}"
- Professional board game card quality
- Clear readable text areas
- Size: 2.5x3.5 inches at 300 DPI with 1/8 inch bleed`;

    return await generateGeminiImage(prompt);
  } catch (e) {
    console.error("Image generation failed:", e);
    return null;
  }
}

export async function generateBoxArt(params: {
  gameName: string;
  theme: string;
  baseGame: string;
  rules: string[];
  side: "front" | "back";
}): Promise<Buffer | null> {
  try {
    const prompt = params.side === "front"
      ? `Generate professional board game box cover art:
Game: "${params.gameName}"
Theme: "${params.theme}" (based on ${params.baseGame})

Design a vibrant, eye-catching front cover with:
- Large game title "${params.gameName}" prominently displayed
- Thematic illustration matching "${params.theme}"
- Player count indicator (2-6 players)
- Age rating (12+)
- Professional board game box art quality
- Size: 4x5.5 inches at 300 DPI with 1/8 inch bleed`
      : `Generate the BACK of a board game box:
Game: "${params.gameName}"
Theme: "${params.theme}" (based on ${params.baseGame})
Key Features: ${params.rules.slice(0, 3).join(", ")}

Design the back cover with:
- 2-3 gameplay highlight boxes
- Brief description of the game
- "Contents" list
- Bar code area placeholder at bottom
- Professional layout matching retail board games
- Size: 4x5.5 inches at 300 DPI with 1/8 inch bleed`;

    return await generateGeminiImage(prompt);
  } catch (e) {
    console.error("Box art generation failed:", e);
    return null;
  }
}

export async function generateBoardImage(params: {
  gameName: string;
  theme: string;
  baseGame: string;
  rules: string[];
}): Promise<Buffer | null> {
  try {
    const prompt = `Generate a complete game board illustration:
Game: "${params.gameName}"
Theme: "${params.theme}" (based on ${params.baseGame})

Design a full game board with:
- Themed spaces/track/grid matching "${params.theme}"
- Clear path or play area
- Decorative themed borders
- Space for tokens/pieces
- High quality board game artwork
- Size: 19x19 inches at 300 DPI with 1/8 inch bleed`;

    return await generateGeminiImage(prompt);
  } catch (e) {
    console.error("Board generation failed:", e);
    return null;
  }
}

// ---- Manual PDF Generation (as images) ----

export async function generateManualPage(params: {
  gameName: string;
  theme: string;
  pageContent: string;
  pageNumber: number;
  totalPages: number;
}): Promise<Buffer | null> {
  try {
    const prompt = `Generate a beautifully designed instruction manual page for a board game:
Game: "${params.gameName}", Theme: "${params.theme}"
Page ${params.pageNumber} of ${params.totalPages}

Content for this page:
${params.pageContent}

Design requirements:
- Professional manual layout with themed borders
- Clear readable typography
- Thematic decorations matching "${params.theme}"
- Page number at bottom
- Size: 8.5x11 inches at 300 DPI with 1/8 inch bleed
- Clean, print-ready design`;

    return await generateGeminiImage(prompt);
  } catch (e) {
    console.error("Manual page generation failed:", e);
    return null;
  }
}

// ---- Full Pipeline ----

export async function runGenerationPipeline(ctx: GenerationContext): Promise<void> {
  const { gameId } = ctx;

  // Calculate total steps: rules + cards (varies) + box (2) + board (1) + manual pages (~4)
  const estimatedSteps = 1 + 54 + 2 + 1 + 4; // ~62 steps
  let currentStep = 0;

  try {
    // Phase 1: Generate rules document
    await updateProgress(gameId, "rules", currentStep, estimatedSteps);
    const rulesDoc = await generateRulesDocument(ctx);
    await saveAsset(gameId, "rules-doc", "Game Rules", rulesDoc, "md", { content: rulesDoc });
    currentStep++;
    await updateProgress(gameId, "rules", currentStep, estimatedSteps);

    // Phase 2: Generate card list and images
    await updateProgress(gameId, "cards", currentStep, estimatedSteps);
    const { cards } = await generateCardList(ctx);
    const actualSteps = 1 + (cards.length + 1) + 2 + 1 + 4;

    // Generate card back (shared across all cards)
    const cardBackBuffer = await generateCardImage({
      cardName: "",
      cardType: "",
      description: "",
      effect: "",
      gameName: ctx.gameName,
      theme: ctx.theme,
      isBack: true,
    });
    if (cardBackBuffer) {
      await saveAsset(gameId, "card-back", "Card Back", `data:image/png;base64,${cardBackBuffer.toString("base64")}`, "png", {
        width: PRINT_SPECS.card.width,
        height: PRINT_SPECS.card.height,
      });
    }
    currentStep++;

    // Generate each card face
    for (const card of cards) {
      await updateProgress(gameId, "cards", currentStep, actualSteps);
      const cardBuffer = await generateCardImage({
        cardName: card.name,
        cardType: card.type,
        description: card.description,
        effect: card.effect,
        gameName: ctx.gameName,
        theme: ctx.theme,
      });
      if (cardBuffer) {
        await saveAsset(gameId, "card", card.name, `data:image/png;base64,${cardBuffer.toString("base64")}`, "png", {
          cardType: card.type,
          effect: card.effect,
          quantity: card.quantity,
          width: PRINT_SPECS.card.width,
          height: PRINT_SPECS.card.height,
        });
      }
      currentStep++;
    }

    // Phase 3: Box art
    await updateProgress(gameId, "box-art", currentStep, actualSteps);
    const boxFront = await generateBoxArt({
      gameName: ctx.gameName,
      theme: ctx.theme,
      baseGame: ctx.baseGame,
      rules: ctx.rules,
      side: "front",
    });
    if (boxFront) {
      await saveAsset(gameId, "box-front", "Box Front", `data:image/png;base64,${boxFront.toString("base64")}`, "png", {
        width: PRINT_SPECS.boxFront.width,
        height: PRINT_SPECS.boxFront.height,
      });
    }
    currentStep++;

    const boxBack = await generateBoxArt({
      gameName: ctx.gameName,
      theme: ctx.theme,
      baseGame: ctx.baseGame,
      rules: ctx.rules,
      side: "back",
    });
    if (boxBack) {
      await saveAsset(gameId, "box-back", "Box Back", `data:image/png;base64,${boxBack.toString("base64")}`, "png", {
        width: PRINT_SPECS.boxBack.width,
        height: PRINT_SPECS.boxBack.height,
      });
    }
    currentStep++;

    // Phase 4: Board art (if applicable based on game type)
    await updateProgress(gameId, "board", currentStep, actualSteps);
    const boardImage = await generateBoardImage({
      gameName: ctx.gameName,
      theme: ctx.theme,
      baseGame: ctx.baseGame,
      rules: ctx.rules,
    });
    if (boardImage) {
      await saveAsset(gameId, "board", "Game Board", `data:image/png;base64,${boardImage.toString("base64")}`, "png", {
        width: PRINT_SPECS.board.width,
        height: PRINT_SPECS.board.height,
      });
    }
    currentStep++;

    // Phase 5: Manual pages
    await updateProgress(gameId, "manual", currentStep, actualSteps);
    const sections = rulesDoc.split(/(?=^## )/m).filter(Boolean);
    const pagesContent = [];
    // Group sections into pages (~2 sections per page)
    for (let i = 0; i < sections.length; i += 2) {
      pagesContent.push(sections.slice(i, i + 2).join("\n\n"));
    }
    const totalPages = Math.max(pagesContent.length, 1);

    for (let i = 0; i < totalPages; i++) {
      await updateProgress(gameId, "manual", currentStep, actualSteps);
      const pageBuffer = await generateManualPage({
        gameName: ctx.gameName,
        theme: ctx.theme,
        pageContent: pagesContent[i] || "Notes",
        pageNumber: i + 1,
        totalPages,
      });
      if (pageBuffer) {
        await saveAsset(gameId, "manual", `Manual Page ${i + 1}`, `data:image/png;base64,${pageBuffer.toString("base64")}`, "png", {
          pageNumber: i + 1,
          width: PRINT_SPECS.manual.width,
          height: PRINT_SPECS.manual.height,
        });
      }
      currentStep++;
    }

    // Mark complete
    await prisma.generationJob.update({
      where: { gameId },
      data: {
        status: "complete",
        phase: "complete",
        progress: 100,
        completedAt: new Date(),
      },
    });

    // Send completion email
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { user: true },
    });
    if (game?.user?.email) {
      sendGenerationComplete({
        email: game.user.email,
        gameName: ctx.gameName,
        orderId: gameId,
        dashboardUrl: `${process.env.NEXTAUTH_URL || ""}/dashboard`,
      }).catch(() => {});
    }
  } catch (error) {
    console.error("Generation pipeline failed:", error);
    await prisma.generationJob.update({
      where: { gameId },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

// ---- Preview Generation (lighter-weight for pre-checkout) ----

export async function generatePreviewAssets(ctx: GenerationContext): Promise<{
  cardPreview: string | null;
  boxPreview: string | null;
  rulesPreview: string;
}> {
  // Generate a sample card, box preview, and rules summary concurrently
  const [cardBuffer, boxBuffer, rulesDoc] = await Promise.all([
    generateCardImage({
      cardName: "Sample Card",
      cardType: "Preview",
      description: `A preview card from ${ctx.gameName}`,
      effect: "This is a preview of your custom card design",
      gameName: ctx.gameName,
      theme: ctx.theme,
    }),
    generateBoxArt({
      gameName: ctx.gameName,
      theme: ctx.theme,
      baseGame: ctx.baseGame,
      rules: ctx.rules,
      side: "front",
    }),
    generateRulesDocument(ctx),
  ]);

  return {
    cardPreview: cardBuffer ? `data:image/png;base64,${cardBuffer.toString("base64")}` : null,
    boxPreview: boxBuffer ? `data:image/png;base64,${boxBuffer.toString("base64")}` : null,
    rulesPreview: rulesDoc.slice(0, 2000), // First 2000 chars as preview
  };
}
