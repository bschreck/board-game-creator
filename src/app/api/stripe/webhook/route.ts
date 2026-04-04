import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { runGenerationPipeline, type GenerationContext } from "@/lib/asset-generation";
import { sendOrderConfirmation } from "@/lib/email";
import Stripe from "stripe";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

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

      // Send order confirmation email
      const order = await prisma.order.findFirst({ where: { stripeSessionId: session.id } });
      const orderUser = await prisma.user.findUnique({ where: { id: session.metadata?.userId || "" } });
      if (orderUser?.email && order) {
        sendOrderConfirmation({
          email: orderUser.email,
          gameName: session.metadata?.gameId || "Your Game",
          orderId: order.id,
          tier: order.tier,
          amount: order.amount,
        }).catch(() => {}); // Fire and forget
      }

      // Trigger asset generation pipeline
      const game = await prisma.game.findUnique({ where: { id: gameId } });
      if (game) {
        // Create generation job
        await prisma.generationJob.upsert({
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

        const ctx: GenerationContext = {
          gameId,
          gameName: game.name,
          baseGame: game.baseGame,
          theme: game.theme || "",
          rules: JSON.parse(game.rules || "[]"),
          tier: game.tier,
          photos: JSON.parse(game.photos || "[]"),
        };

        // Run generation in background
        const pipelinePromise = runGenerationPipeline(ctx).catch((err) => {
          console.error("Pipeline error from webhook:", err);
        });

        try {
          const { after } = await import("next/server");
          if (typeof after === "function") {
            after(pipelinePromise);
          }
        } catch {
          void pipelinePromise;
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
