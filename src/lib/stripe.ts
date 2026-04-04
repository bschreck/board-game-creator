import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-03-31.basil",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep for backward compat in server-only files
export const stripe = typeof window === "undefined" 
  ? new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-03-31.basil", typescript: true })
  : (null as unknown as Stripe);

// Re-export pricing from safe client-importable module
export { PRICING, type PricingTier } from "./pricing";
