/**
 * Email notifications for order status updates.
 * Uses a simple fetch-based approach — swap in SendGrid, Resend, or Postmark as needed.
 */

interface EmailAttachment {
  filename: string;
  content: string; // base64-encoded
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.EMAIL_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "orders@boardgamecreator.com";

  if (!apiKey) {
    console.warn("EMAIL_API_KEY not configured — skipping email:", params.subject);
    return false;
  }

  // Resend API (recommended for Vercel)
  try {
    const payload: Record<string, unknown> = {
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
    };
    if (params.attachments && params.attachments.length > 0) {
      payload.attachments = params.attachments;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Email API error:", res.status, text);
    }
    return res.ok;
  } catch (e) {
    console.error("Failed to send email:", e);
    return false;
  }
}

export async function sendOrderConfirmation(params: {
  email: string;
  gameName: string;
  orderId: string;
  tier: string;
  amount: number;
}) {
  return sendEmail({
    to: params.email,
    subject: `Order Confirmed: ${params.gameName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Your Game is Being Created!</h1>
        <p>Thanks for your order! We're now generating all the custom artwork and components for <strong>${params.gameName}</strong>.</p>
        <div style="background: #f5f3ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order ID:</strong> ${params.orderId}</p>
          <p style="margin: 8px 0 0;"><strong>Package:</strong> ${params.tier.charAt(0).toUpperCase() + params.tier.slice(1)}</p>
          <p style="margin: 8px 0 0;"><strong>Total:</strong> $${(params.amount / 100).toFixed(2)}</p>
        </div>
        <h2 style="color: #7c3aed;">What happens next?</h2>
        <ol>
          <li><strong>AI Generation</strong> — We're creating custom card art, box cover, game board, and rules manual</li>
          <li><strong>Print Production</strong> — Assets are sent to our print partner for professional printing</li>
          <li><strong>Shipping</strong> — Your game will be shipped directly to you (5-7 business days)</li>
        </ol>
        <p>We'll email you updates as your game progresses through each stage.</p>
        <p style="color: #6b7280; font-size: 14px;">— The Board Game Creator Team</p>
      </div>
    `,
  });
}

export async function sendGenerationComplete(params: {
  email: string;
  gameName: string;
  orderId: string;
  dashboardUrl: string;
}) {
  return sendEmail({
    to: params.email,
    subject: `Assets Ready: ${params.gameName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Your Game Assets Are Ready!</h1>
        <p>All the custom artwork for <strong>${params.gameName}</strong> has been generated:</p>
        <ul>
          <li>Custom card designs for every card in your deck</li>
          <li>Box cover art (front and back)</li>
          <li>Game board illustration</li>
          <li>Printed instruction manual</li>
        </ul>
        <p>Your game is now being sent to our print partner for professional production.</p>
        <a href="${params.dashboardUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">View Your Game Assets</a>
        <p style="color: #6b7280; font-size: 14px;">— The Board Game Creator Team</p>
      </div>
    `,
  });
}

export async function sendShippingNotification(params: {
  email: string;
  gameName: string;
  trackingNumber: string;
}) {
  return sendEmail({
    to: params.email,
    subject: `Shipped: ${params.gameName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Your Game Has Shipped!</h1>
        <p><strong>${params.gameName}</strong> is on its way to you!</p>
        <div style="background: #f5f3ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Tracking Number:</strong> ${params.trackingNumber}</p>
        </div>
        <p>Expected delivery: 5-7 business days</p>
        <p style="color: #6b7280; font-size: 14px;">— The Board Game Creator Team</p>
      </div>
    `,
  });
}

/**
 * Send all game design assets to CREATOR_EMAIL for review/production.
 * Attaches images and PDF as base64 attachments via Resend API.
 */
export async function sendDesignSubmission(params: {
  gameName: string;
  baseGame: string;
  theme: string;
  playerCount: string;
  rulesText: string;
  description: string;
  attachments: EmailAttachment[];
}) {
  const creatorEmail = process.env.CREATOR_EMAIL;
  if (!creatorEmail) {
    console.error("CREATOR_EMAIL not configured — cannot send design submission");
    return false;
  }

  return sendEmail({
    to: creatorEmail,
    subject: `New Game Design Submission: ${params.gameName}`,
    attachments: params.attachments,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 700px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">New Game Design Submitted</h1>
        <p>A new custom game design has been submitted for review.</p>

        <div style="background: #f5f3ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h2 style="margin: 0 0 12px; font-size: 18px; color: #4c1d95;">${esc(params.gameName)}</h2>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; width: 120px;">Base Game</td>
              <td style="padding: 6px 0; font-weight: 600;">${esc(params.baseGame)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Theme</td>
              <td style="padding: 6px 0; font-weight: 600;">${esc(params.theme)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Players</td>
              <td style="padding: 6px 0; font-weight: 600;">${esc(params.playerCount)}</td>
            </tr>
          </table>
        </div>

        ${params.description ? `
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px; font-size: 14px; color: #374151;">Description</h3>
          <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">${esc(params.description)}</p>
        </div>
        ` : ""}

        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px; font-size: 14px; color: #374151;">Rules</h3>
          <pre style="margin: 0; font-size: 13px; color: #4b5563; white-space: pre-wrap; font-family: system-ui, sans-serif; line-height: 1.6;">${esc(params.rulesText)}</pre>
        </div>

        <h3 style="font-size: 14px; color: #374151; margin-top: 24px;">Attachments</h3>
        <ul style="font-size: 14px; color: #4b5563;">
          ${params.attachments.map((a) => `<li>${esc(a.filename)}</li>`).join("")}
        </ul>

        <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">— Board Game Creator</p>
      </div>
    `,
  });
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
