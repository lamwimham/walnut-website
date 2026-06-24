import type { AccountSummary } from "./billing-client";
import { LIFETIME_SUBSCRIPTION_SKU, MONTHLY_SUBSCRIPTION_SKU } from "./checkout-plans";

const MONTHLY_ACTIVE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

export type AccountSubscriptionControls = {
  planCode: string;
  status: string;
  isMonthly: boolean;
  isLifetime: boolean;
  canStartMonthly: boolean;
  canStartLifetime: boolean;
  canCancel: boolean;
  canResume: boolean;
  lifetimeRequiresMonthlyCancellation: boolean;
};

export function normalizeSubscriptionStatus(status: string | undefined): string {
  const normalized = status?.trim().toLowerCase();
  if (!normalized) return "unknown";
  if (normalized === "canceled") return "cancelled";
  return normalized;
}

export function subscriptionControlsFor(summary: AccountSummary): AccountSubscriptionControls {
  const planCode = summary.account.planCode?.trim() || "basic_own_ai";
  const status = normalizeSubscriptionStatus(summary.account.subscriptionStatus);
  const isMonthly = planCode === MONTHLY_SUBSCRIPTION_SKU;
  const isLifetime = planCode === LIFETIME_SUBSCRIPTION_SKU;
  const monthlyIsRenewing = isMonthly && MONTHLY_ACTIVE_STATUSES.has(status);
  const monthlyIsEnding = isMonthly && status === "cancel_at_period_end";

  return {
    planCode,
    status,
    isMonthly,
    isLifetime,
    canStartMonthly: !isLifetime && !monthlyIsRenewing && !monthlyIsEnding,
    canStartLifetime: !isLifetime && !monthlyIsRenewing,
    canCancel: monthlyIsRenewing,
    canResume: monthlyIsEnding,
    lifetimeRequiresMonthlyCancellation: !isLifetime && monthlyIsRenewing,
  };
}
