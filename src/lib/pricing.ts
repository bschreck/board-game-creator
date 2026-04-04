export const PRICING = {
  basic: {
    name: "Basic",
    price: 2900,
    display: "$29",
    description: "Standard board, cards & rules booklet",
    features: [
      "Custom themed game board",
      "Personalized rule booklet",
      "Standard card deck",
      "Up to 5 photos",
      "Free shipping",
    ],
  },
  premium: {
    name: "Premium",
    price: 4900,
    display: "$49",
    description: "Enhanced components & premium materials",
    features: [
      "Everything in Basic",
      "Premium cardstock & board",
      "Custom game pieces",
      "Up to 15 photos",
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

export type PricingTier = keyof typeof PRICING;
