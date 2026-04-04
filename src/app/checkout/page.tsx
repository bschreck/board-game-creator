"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getTierPrice,
  getBulkDiscount,
  getDiscountedUnitPrice,
  BULK_TIERS,
  type PricingTier,
} from "@/lib/pricing";
import { BASE_GAMES } from "@/lib/game-data";
import {
  CreditCard,
  MapPin,
  Gift,
  Plus,
  Trash2,
  Lock,
  Loader2,
  Package,
  Minus,
  Users,
} from "lucide-react";

interface GiftAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  quantity: number;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const gameId = searchParams.get("gameId");

  const [game, setGame] = useState<{
    id: string;
    name: string;
    baseGame: string;
    theme: string;
    tier: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const [giftMode, setGiftMode] = useState(false);
  const [giftAddresses, setGiftAddresses] = useState<GiftAddress[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: `/checkout?gameId=${gameId}` });
    }
  }, [status, gameId]);

  useEffect(() => {
    if (!gameId || !session) return;
    fetch("/api/game")
      .then((r) => r.json())
      .then((data) => {
        const g = data.games?.find(
          (g: { id: string }) => g.id === gameId
        );
        if (g) setGame(g);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [gameId, session]);

  const gameData = game ? BASE_GAMES.find((g) => g.id === game.baseGame) : null;
  const tierInfo = game
    ? getTierPrice(game.tier as PricingTier, gameData?.category)
    : getTierPrice("premium");

  const giftCopies = giftAddresses.reduce((sum, a) => sum + a.quantity, 0);
  const totalCopies = quantity + giftCopies;
  const bulkDiscount = getBulkDiscount(totalCopies);
  const unitPrice = getDiscountedUnitPrice(tierInfo.price, totalCopies);
  const total = unitPrice * totalCopies;
  const savings = totalCopies > 1 ? (tierInfo.price * totalCopies - total) : 0;

  const addGiftAddress = () => {
    setGiftAddresses([
      ...giftAddresses,
      { name: "", address: "", city: "", state: "", zip: "", quantity: 1 },
    ]);
  };

  const removeGiftAddress = (i: number) => {
    setGiftAddresses(giftAddresses.filter((_, idx) => idx !== i));
  };

  const updateGiftAddress = (i: number, field: keyof GiftAddress, value: string) => {
    const updated = [...giftAddresses];
    updated[i] = { ...updated[i], [field]: value };
    setGiftAddresses(updated);
  };

  const handleCheckout = async () => {
    if (!shipping.name || !shipping.address || !shipping.city || !shipping.zip) {
      alert("Please fill in all shipping fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          shipping,
          quantity,
          giftAddresses: giftMode ? giftAddresses : [],
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout");
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Package className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Game not found</p>
        <Button onClick={() => router.push("/create")}>Create a Game</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <Button variant="ghost" onClick={() => router.push("/create")} className="text-violet-600 hover:text-violet-700">
            ← Edit Game
          </Button>
        </div>
        <p className="text-gray-500 mb-8">
          Almost there! Add your shipping info and complete your order.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Shipping form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quantity selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-violet-500" />
                  Quantity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 hover:bg-gray-100 rounded-l-lg transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="px-5 py-2 text-lg font-semibold min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2.5 hover:bg-gray-100 rounded-r-lg transition-colors"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {unitPrice < tierInfo.price ? (
                      <span>
                        <span className="line-through text-gray-400">{tierInfo.display}</span>{" "}
                        <span className="font-semibold text-emerald-600">
                          ${(unitPrice / 100).toFixed(2)}
                        </span>{" "}
                        per copy
                      </span>
                    ) : (
                      <span>{tierInfo.display} per copy</span>
                    )}
                  </div>
                </div>

                {/* Bulk discount tiers - always visible and clickable */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Users className="h-4 w-4" />
                    {bulkDiscount.discountPct > 0
                      ? `Volume Discount: ${bulkDiscount.discountPct}% off`
                      : "Volume Discounts Available"}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {BULK_TIERS.map((bt) => (
                      <button
                        key={bt.minQty}
                        type="button"
                        onClick={() => setQuantity(bt.minQty)}
                        className={`text-center py-2 px-1 rounded text-xs cursor-pointer transition-all ${
                          bt.minQty === bulkDiscount.minQty
                            ? "bg-emerald-200 text-emerald-900 font-semibold ring-2 ring-emerald-400"
                            : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
                        }`}
                      >
                        <div className="font-medium">{bt.label}</div>
                        {bt.discountPct > 0 ? (
                          <div className="text-emerald-600 font-semibold">{bt.discountPct}% off</div>
                        ) : (
                          <div className="text-gray-400">Full price</div>
                        )}
                      </button>
                    ))}
                  </div>
                  {bulkDiscount.discountPct > 0 && (
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-gray-500">Per copy: <span className="line-through">{tierInfo.display}</span> <span className="text-emerald-600 font-semibold">${(unitPrice / 100).toFixed(2)}</span></span>
                      <span className="text-gray-700 font-medium">Total: ${(total / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Click a tier to set quantity. Perfect for events, parties, corporate gifts.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-violet-500" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Full Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={shipping.name}
                    onChange={(e) =>
                      setShipping({ ...shipping, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Street Address
                  </label>
                  <Input
                    placeholder="123 Main St, Apt 4"
                    value={shipping.address}
                    onChange={(e) =>
                      setShipping({ ...shipping, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      City
                    </label>
                    <Input
                      placeholder="San Francisco"
                      value={shipping.city}
                      onChange={(e) =>
                        setShipping({ ...shipping, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      State
                    </label>
                    <Input
                      placeholder="CA"
                      value={shipping.state}
                      onChange={(e) =>
                        setShipping({ ...shipping, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      ZIP Code
                    </label>
                    <Input
                      placeholder="94102"
                      value={shipping.zip}
                      onChange={(e) =>
                        setShipping({ ...shipping, zip: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gift Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-lg">
                    <Gift className="h-5 w-5 text-violet-500" />
                    Gift Mode
                  </span>
                  <Button
                    variant={giftMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGiftMode(!giftMode)}
                  >
                    {giftMode ? "Enabled" : "Add Gift Copies"}
                  </Button>
                </CardTitle>
              </CardHeader>
              {giftMode && (
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Ship copies to friends and family. Gift copies
                    benefit from bulk pricing too!
                  </p>
                  {giftAddresses.map((addr, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Gift #{i + 1}</Badge>
                        <button
                          onClick={() => removeGiftAddress(i)}
                          className="p-1 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Input
                        placeholder="Recipient name"
                        value={addr.name}
                        onChange={(e) =>
                          updateGiftAddress(i, "name", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Street address"
                        value={addr.address}
                        onChange={(e) =>
                          updateGiftAddress(i, "address", e.target.value)
                        }
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="City"
                          value={addr.city}
                          onChange={(e) =>
                            updateGiftAddress(i, "city", e.target.value)
                          }
                        />
                        <Input
                          placeholder="State"
                          value={addr.state}
                          onChange={(e) =>
                            updateGiftAddress(i, "state", e.target.value)
                          }
                        />
                        <Input
                          placeholder="ZIP"
                          value={addr.zip}
                          onChange={(e) =>
                            updateGiftAddress(i, "zip", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                          Copies to this address
                        </label>
                        <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                          <button
                            onClick={() => {
                              const updated = [...giftAddresses];
                              updated[i] = { ...updated[i], quantity: Math.max(1, addr.quantity - 1) };
                              setGiftAddresses(updated);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                            disabled={addr.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5 text-gray-600" />
                          </button>
                          <span className="px-4 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center">
                            {addr.quantity}
                          </span>
                          <button
                            onClick={() => {
                              const updated = [...giftAddresses];
                              updated[i] = { ...updated[i], quantity: addr.quantity + 1 };
                              setGiftAddresses(updated);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addGiftAddress}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Gift Address
                  </Button>

                  {/* Shipping summary */}
                  {giftAddresses.length > 0 && (
                    <div className="bg-violet-50 rounded-lg p-4 space-y-1.5">
                      <p className="text-sm font-medium text-violet-900">Shipping Summary</p>
                      <p className="text-xs text-violet-700">
                        {quantity} {quantity === 1 ? "copy" : "copies"} to your address
                      </p>
                      {giftAddresses.map((addr, i) => (
                        <p key={i} className="text-xs text-violet-700">
                          {addr.quantity} {addr.quantity === 1 ? "copy" : "copies"} to {addr.name || `Gift #${i + 1}`}
                          {addr.city ? `, ${addr.city}` : ""}
                        </p>
                      ))}
                      <p className="text-xs font-semibold text-violet-900 pt-1 border-t border-violet-200">
                        Total: {totalCopies} {totalCopies === 1 ? "copy" : "copies"}
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right: Order summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Game</span>
                    <span className="font-medium">{game.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Package</span>
                    <Badge>{tierInfo.name}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Copies</span>
                    <span>{totalCopies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per copy</span>
                    <span>
                      {unitPrice < tierInfo.price ? (
                        <>
                          <span className="line-through text-gray-400 mr-1">
                            {tierInfo.display}
                          </span>
                          <span className="text-emerald-600">
                            ${(unitPrice / 100).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        tierInfo.display
                      )}
                    </span>
                  </div>
                  {giftCopies > 0 && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>({quantity} to you + {giftCopies} gift)</span>
                    </div>
                  )}
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Bulk savings</span>
                      <span>-${(savings / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ${(total / 100).toFixed(2)}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Lock className="h-3 w-3" />
                  Secured by Stripe
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
