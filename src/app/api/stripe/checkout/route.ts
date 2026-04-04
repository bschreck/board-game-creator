import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getTierPrice, getDiscountedUnitPrice, type PricingTier } from "@/lib/stripe";
import { BASE_GAMES } from "@/lib/game-data";

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

  const gameData = BASE_GAMES.find((g) => g.id === game.baseGame);
  const tierInfo = getTierPrice(game.tier as PricingTier, gameData?.category);
  if (!tierInfo) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const quantity = body.quantity || 1;
  const giftCopies = (giftAddresses || []).reduce(
    (sum: number, a: { quantity?: number }) => sum + (a.quantity || 1),
    0
  );
  const totalCopies = quantity + giftCopies;
  const unitPrice = getDiscountedUnitPrice(tierInfo.price, totalCopies);
  const totalAmount = unitPrice * totalCopies;

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tierInfo.name} Game — ${game.name}`,
              description: `Custom ${game.baseGame}-style game: "${game.theme}"`,
            },
            unit_amount: unitPrice,
          },
          quantity: totalCopies,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/order/success?session_id={CHECKOUT_SESSION_ID}&gameId=${gameId}`,
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
