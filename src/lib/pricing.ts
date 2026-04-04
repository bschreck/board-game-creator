/**
 * Pricing & Margin Analysis
 *
 * Production costs via The Game Crafter (per unit, qty 1):
 * -------------------------------------------------------
 * Card-only game (54-card poker deck + tuck box + booklet):
 *   - Poker deck (54 cards, 3 sheets @ $3.09/sheet): ~$9.27
 *   - Tuck box: ~$5.85
 *   - Small booklet (8 pages): ~$3.50
 *   - Handling fee: $0.89
 *   - Subtotal: ~$19.51
 *   - Shipping (domestic avg): ~$5.00
 *   - Total production: ~$24.51
 *
 * Board game (54-card deck + board + tuck box + booklet):
 *   - Poker deck: ~$9.27
 *   - Game board (bi-fold 19"): ~$8.00
 *   - Tuck box: ~$5.85
 *   - Booklet: ~$3.50
 *   - Handling fee: $0.89
 *   - Subtotal: ~$27.51
 *   - Shipping: ~$7.00
 *   - Total production: ~$34.51
 *
 * AI generation costs (Gemini API, one-time per game):
 *   - Image generation (~60 images): ~$2.00
 *   - Text generation (rules, cards): ~$0.50
 *   - Total AI: ~$2.50
 *
 * Margin targets (retail - production - AI costs):
 *   Card Basic  $29 - $24.51 - $2.50 = $1.99 margin (7%)   -- tight but viable at scale
 *   Card Premium $49 - $26.00 - $2.50 = $20.50 margin (42%) -- premium materials ~$1.50 extra
 *   Board Basic  $35 - $34.51 - $2.50 = -$2.01 margin       -- LOSS, need $35 minimum
 *   Board Premium $55 - $37.00 - $2.50 = $15.50 margin (28%)
 *   Board Deluxe  $79 - $45.00 - $2.50 = $31.50 margin (40%)
 *
 * Card-only games have no board and cheaper packaging, so $29/$49 works.
 * Board games cost more to produce, so prices are higher: $35/$55/$79.
 * Bulk discounts cut into margins but TGC volume pricing also drops.
 */

export interface TierInfo {
  name: string;
  price: number; // cents
  display: string;
  description: string;
  features: string[];
}

// Card-only game tiers (no board, no game pieces to upgrade)
export const CARD_PRICING: Record<string, TierInfo> = {
  basic: {
    name: "Basic",
    price: 2900,
    display: "$29",
    description: "Standard cards & rules booklet",
    features: [
      "Custom themed card deck",
      "Personalized rule booklet",
      "Standard tuck box",
      "Up to 5 photos integrated",
      "Free shipping",
    ],
  },
  premium: {
    name: "Premium",
    price: 4900,
    display: "$49",
    description: "Premium cardstock & custom box art",
    features: [
      "Everything in Basic",
      "Premium linen-texture cardstock",
      "UV-coated finish",
      "Up to 15 photos integrated",
      "Custom box art",
      "Priority shipping",
    ],
  },
} as const;

// Board game tiers (includes board, supports piece upgrades)
export const BOARD_PRICING: Record<string, TierInfo> = {
  basic: {
    name: "Basic",
    price: 3500,
    display: "$35",
    description: "Standard board, cards & rules booklet",
    features: [
      "Custom themed game board",
      "Personalized rule booklet",
      "Standard card deck",
      "Up to 5 photos integrated",
      "Free shipping",
    ],
  },
  premium: {
    name: "Premium",
    price: 5500,
    display: "$55",
    description: "Enhanced components & premium materials",
    features: [
      "Everything in Basic",
      "Premium cardstock & board",
      "Custom game pieces (select games)",
      "Up to 15 photos integrated",
      "Custom box art",
      "Priority shipping",
    ],
  },
  deluxe: {
    name: "Deluxe",
    price: 7900,
    display: "$79",
    description: "The ultimate custom board game experience",
    features: [
      "Everything in Premium",
      "Wooden game pieces",
      "Metal coins & tokens",
      "Unlimited photos",
      "Embossed box",
      "Gift wrapping available",
      "Express shipping",
    ],
  },
} as const;

// Default PRICING export for backwards compatibility (board games)
export const PRICING = BOARD_PRICING;

export type PricingTier = "basic" | "premium" | "deluxe";

/**
 * Returns the applicable pricing tiers based on the game category.
 * Card-only games get 2 tiers; board games get 3.
 */
export function getAvailableTiers(
  category?: string
): [string, TierInfo][] {
  if (category === "Cards") {
    return Object.entries(CARD_PRICING);
  }
  return Object.entries(BOARD_PRICING);
}

/**
 * Get the price info for a specific tier and game category.
 */
export function getTierPrice(tier: PricingTier, category?: string): TierInfo {
  const pricing = category === "Cards" ? CARD_PRICING : BOARD_PRICING;
  return pricing[tier] ?? pricing.basic ?? BOARD_PRICING.basic;
}

// ---- Bulk Discounts ----

export interface BulkTier {
  minQty: number;
  label: string;
  discountPct: number;
}

export const BULK_TIERS: BulkTier[] = [
  { minQty: 1, label: "1 copy", discountPct: 0 },
  { minQty: 5, label: "5+ copies", discountPct: 10 },
  { minQty: 10, label: "10+ copies", discountPct: 15 },
  { minQty: 25, label: "25+ copies", discountPct: 20 },
  { minQty: 50, label: "50+ copies", discountPct: 25 },
];

/**
 * Get the applicable bulk discount for a given quantity.
 */
export function getBulkDiscount(quantity: number): BulkTier {
  for (let i = BULK_TIERS.length - 1; i >= 0; i--) {
    if (quantity >= BULK_TIERS[i].minQty) {
      return BULK_TIERS[i];
    }
  }
  return BULK_TIERS[0];
}

/**
 * Calculate the per-unit price in cents after bulk discount.
 */
export function getDiscountedUnitPrice(basePriceCents: number, quantity: number): number {
  const discount = getBulkDiscount(quantity);
  return Math.round(basePriceCents * (1 - discount.discountPct / 100));
}

/**
 * Calculate total price in cents for a given quantity with bulk discount.
 */
export function calculateTotal(basePriceCents: number, quantity: number): number {
  return getDiscountedUnitPrice(basePriceCents, quantity) * quantity;
}
