/**
 * Email notifications for order status updates.
 * Uses a simple fetch-based approach — swap in SendGrid, Resend, or Postmark as needed.
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
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
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
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
