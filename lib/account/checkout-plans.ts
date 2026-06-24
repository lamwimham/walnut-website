export const CHECKOUT_PLANS = {
  proByok: {
    skuCode: "pro_own_ai_monthly",
  },
  lifetime: {
    skuCode: "pro_own_ai_lifetime",
  },
} as const;

export type CheckoutPlanKey = keyof typeof CHECKOUT_PLANS;

export const MONTHLY_SUBSCRIPTION_SKU = CHECKOUT_PLANS.proByok.skuCode;
export const LIFETIME_SUBSCRIPTION_SKU = CHECKOUT_PLANS.lifetime.skuCode;

export function checkoutPlanFromParam(value: string | string[] | undefined): CheckoutPlanKey | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  return Object.prototype.hasOwnProperty.call(CHECKOUT_PLANS, raw) ? (raw as CheckoutPlanKey) : null;
}

export function checkoutStartPath(planKey: CheckoutPlanKey): string {
  return `/checkout/start?plan=${encodeURIComponent(planKey)}`;
}
