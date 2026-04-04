import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PRICING, PricingTier } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { gameId, shipping, giftAddresses } = body;

  if (!gameId) {
    return NextResponse.json({ error: "Game ID required" }, { status: 400 });
  }

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: session.user.id },
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const tierInfo = PRICING[game.tier as PricingTier];
  if (!tierInfo) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  // Calculate total (base + extra copies for gift addresses)
  const extraCopies = giftAddresses?.length || 0;
  const totalAmount = tierInfo.price * (1 + extraCopies);

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tierInfo.name} Board Game — ${game.name}`,
              description: `Custom ${game.baseGame}-style board game: "${game.theme}"`,
            },
            unit_amount: tierInfo.price,
          },
          quantity: 1 + extraCopies,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout?gameId=${gameId}`,
      metadata: {
        gameId,
        userId: session.user.id,
        tier: game.tier,
      },
    });

    // Create order record
    await prisma.order.create({
      data: {
        userId: session.user.id,
        gameId,
        stripeSessionId: stripeSession.id,
        amount: totalAmount,
        tier: game.tier,
        shippingName: shipping?.name || "",
        shippingAddress: shipping?.address || "",
        shippingCity: shipping?.city || "",
        shippingState: shipping?.state || "",
        shippingZip: shipping?.zip || "",
        shippingCountry: shipping?.country || "US",
        giftAddresses: JSON.stringify(giftAddresses || []),
        paymentStatus: "pending",
        status: "pending",
      },
    });

    // Update game status
    await prisma.game.update({
      where: { id: gameId },
      data: { status: "checkout" },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
