import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderTemplate, gameToRulebookData } from "@/lib/booklet/template-engine";
import { renderPdf } from "@/lib/booklet/pdf-renderer";
import type { RulebookData, TemplateStyle } from "@/lib/booklet/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { gameId, gameData, template = "modern" } = body as {
    gameId?: string;
    gameData?: RulebookData;
    template?: TemplateStyle;
  };

  if (!gameId && !gameData) {
    return NextResponse.json(
      { error: "Provide either gameId or gameData" },
      { status: 400 },
    );
  }

  let rulebookData: RulebookData;

  if (gameData) {
    rulebookData = gameData;
  } else {
    const game = await prisma.game.findFirst({
      where: { id: gameId, userId: session.user.id },
    });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    rulebookData = gameToRulebookData(game);
  }

  try {
    const html = renderTemplate(rulebookData, template);
    const pdfBuffer = await renderPdf(html);

    const filename = `${slugify(rulebookData.title)}-rulebook.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (e) {
    console.error("PDF rendering failed:", e);
    const message = e instanceof Error ? e.message : "PDF rendering failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
