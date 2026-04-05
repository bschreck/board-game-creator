import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { runGenerationPipeline, type GenerationContext } from "@/lib/asset-generation";
import { sendOrderConfirmation } from "@/lib/email";
import { startBackgroundPipeline, createOrResetGenerationJob } from "@/lib/generation-helpers";
import Stripe from "stripe";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const gameId = session.metadata?.gameId;

    if (gameId) {
      // Update payment status
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          paymentStatus: "paid",
          status: "processing",
        },
      });

      await prisma.game.update({
        where: { id: gameId },
        data: { status: "ordered" },
      });

      // Trigger asset generation pipeline
      const game = await prisma.game.findUnique({ where: { id: gameId } });

      // Send order confirmation email
      const order = await prisma.order.findFirst({ where: { stripeSessionId: session.id } });
      const orderUser = await prisma.user.findUnique({ where: { id: session.metadata?.userId || "" } });
      if (orderUser?.email && order) {
        sendOrderConfirmation({
          email: orderUser.email,
          gameName: game?.name || "Your Game",
          orderId: order.id,
          tier: order.tier,
          amount: order.amount,
        }).catch(() => {}); // Fire and forget
      }

      if (game) {
        await createOrResetGenerationJob(gameId);

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
          console.error("Pipeline error from webhook:", err);
        });
        await startBackgroundPipeline(pipelinePromise);
      }
    }
  }

  return NextResponse.json({ received: true });
}
