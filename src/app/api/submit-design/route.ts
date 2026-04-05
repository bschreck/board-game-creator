import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderTemplate, gameToRulebookData } from "@/lib/booklet/template-engine";
import { renderPdf } from "@/lib/booklet/pdf-renderer";
import { parseJsonArray, escHtml } from "@/lib/generation-helpers";
import { Resend } from "resend";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { gameId } = body;

  if (!gameId) {
    return NextResponse.json({ error: "Game ID required" }, { status: 400 });
  }

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
    include: { assets: true },
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const creatorEmail = process.env.CREATOR_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!creatorEmail || !resendApiKey) {
    console.error("Missing CREATOR_EMAIL or RESEND_API_KEY");
    return NextResponse.json(
      { error: "Email configuration missing" },
      { status: 500 },
    );
  }

  const resend = new Resend(resendApiKey);

  // Generate the rules PDF
  const rulebookData = gameToRulebookData(game);
  let pdfBuffer: Buffer | null = null;
  try {
    const html = renderTemplate(rulebookData, "modern");
    pdfBuffer = await renderPdf(html);
  } catch (e) {
    console.error("PDF generation failed during checkout:", e);
    // Continue without PDF — still send the other assets
  }

  // Collect image attachments from GameAssets
  const attachments: { filename: string; content: Buffer }[] = [];

  for (const asset of game.assets) {
    if (asset.url.startsWith("data:")) {
      const match = asset.url.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === "jpeg" ? "jpg" : match[1];
        const buf = Buffer.from(match[2], "base64");
        const safeName = asset.name.replace(/[^a-zA-Z0-9_-]/g, "_");
        attachments.push({
          filename: `${asset.type}_${safeName}.${ext}`,
          content: buf,
        });
      }
    }
  }

  if (pdfBuffer) {
    const slugTitle = game.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    attachments.push({
      filename: `${slugTitle}-rulebook.pdf`,
      content: pdfBuffer,
    });
  }

  // Build rules summary
  const rules = parseJsonArray(game.rules, []);
  const customRules = parseJsonArray(game.customRules, []);

  const rulesHtml = rules.length > 0
    ? `<ul>${rules.map((r: string) => `<li>${escHtml(r)}</li>`).join("")}</ul>`
    : "<em>No rules defined</em>";

  const customRulesHtml = customRules.length > 0
    ? `<ul>${customRules.map((r: string) => `<li>${escHtml(r)}</li>`).join("")}</ul>`
    : "";

  // Count assets by type
  const boardArt = game.assets.filter((a) => a.type === "board");
  const cardArt = game.assets.filter((a) => a.type === "card");
  const boxArt = game.assets.filter((a) => a.type.startsWith("box-"));

  const emailHtml = `
    <div style="font-family: system-ui, sans-serif; max-width: 700px; margin: 0 auto; color: #1a1a2e;">
      <div style="background: linear-gradient(135deg, #1a1a3e, #4a2c8a); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Game Design Submission</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">A customer has submitted a game for review</p>
      </div>

      <div style="padding: 24px; border: 1px solid #e8e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #4a2c8a; margin-top: 0;">Game Details</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 12px; font-weight: 600; color: #666; width: 140px;">Game Name</td><td style="padding: 8px 12px;">${escHtml(game.name)}</td></tr>
          <tr style="background: #f8f7ff;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Base Game</td><td style="padding: 8px 12px;">${escHtml(game.baseGame)}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Theme</td><td style="padding: 8px 12px;">${escHtml(game.theme || "None")}</td></tr>
          <tr style="background: #f8f7ff;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Tier</td><td style="padding: 8px 12px;">${escHtml(game.tier)}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Player Count</td><td style="padding: 8px 12px;">2-6</td></tr>
          <tr style="background: #f8f7ff;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Submitted By</td><td style="padding: 8px 12px;">${escHtml(session.user.name || session.user.email || "Unknown")}</td></tr>
        </table>

        <h2 style="color: #4a2c8a;">Rules</h2>
        ${rulesHtml}

        ${customRulesHtml ? `<h3 style="color: #4a2c8a;">Custom Rules</h3>${customRulesHtml}` : ""}

        <h2 style="color: #4a2c8a;">Attached Assets</h2>
        <ul style="font-size: 14px;">
          ${boardArt.length > 0 ? `<li>Board art: ${boardArt.length} image(s)</li>` : ""}
          ${cardArt.length > 0 ? `<li>Card art: ${cardArt.length} image(s)</li>` : ""}
          ${boxArt.length > 0 ? `<li>Box cover art: ${boxArt.length} image(s)</li>` : ""}
          ${pdfBuffer ? "<li>Rules PDF</li>" : "<li><em>PDF generation failed — rules text included above</em></li>"}
          <li>Total attachments: ${attachments.length}</li>
        </ul>

        <div style="margin-top: 24px; padding: 16px; background: #f0f0ff; border-radius: 8px; font-size: 13px; color: #4a4a8a;">
          This email was automatically generated by Board Game Creator.
        </div>
      </div>
    </div>
  `;

  try {
    // Resend has a 40MB attachment limit. If total attachments are too large,
    // send without the largest ones and note it in the email.
    const totalSize = attachments.reduce((s, a) => s + a.content.length, 0);
    const MAX_ATTACHMENT_SIZE = 35 * 1024 * 1024; // 35MB to be safe

    let finalAttachments = attachments;
    if (totalSize > MAX_ATTACHMENT_SIZE) {
      // Keep only the PDF and the first few images that fit
      finalAttachments = [];
      let runningSize = 0;
      for (const a of attachments) {
        if (runningSize + a.content.length <= MAX_ATTACHMENT_SIZE) {
          finalAttachments.push(a);
          runningSize += a.content.length;
        }
      }
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Board Game Creator <orders@boardgamecreator.com>",
      to: creatorEmail,
      subject: `New Game Design: ${game.name}`,
      html: emailHtml,
      attachments: finalAttachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });
  } catch (e) {
    console.error("Failed to send email:", e);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }

  // Update game status
  await prisma.game.update({
    where: { id: gameId },
    data: { status: "submitted" },
  });

  return NextResponse.json({ success: true });
}

