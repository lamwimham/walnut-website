import type { AccountSummary } from "./billing-client";

export type AccountStatusTone = "good" | "warning" | "neutral" | "muted";

type AccountTranslationParams = Record<string, string | number>;
type AccountTranslator = (key: string, params?: AccountTranslationParams) => string;

export type AccountPresentationOptions = {
  t?: AccountTranslator;
  locale?: "zh" | "en" | string;
};

export type AccountPresentation = {
  displayName: string;
  email: string;
  initials: string;
  planLabel: string;
  planCode: string;
  statusLabel: string;
  statusTone: AccountStatusTone;
  deviceUsageLabel: string;
  deviceUsagePercent: number;
  deviceLimitLabel: string;
  devicesRemainingLabel: string;
  subscriptionPeriodLabel: string;
  subscriptionPeriodValue: string;
  subscriptionPeriodDescription: string;
  hasSubscriptionPeriod: boolean;
};

const PLAN_LABELS: Record<string, string> = {
  basic_own_ai: "Basic - Own AI",
  pro: "Pro",
  lifetime: "Lifetime",
  free: "Free",
  pro_own_ai_monthly: "Pro - Own AI Monthly",
  pro_own_ai_lifetime: "Pro - Own AI Lifetime",
};

const PLAN_LABEL_KEYS: Record<string, string> = {
  basic_own_ai: "accountPortal.presentation.plans.basic_own_ai",
  pro: "accountPortal.presentation.plans.pro",
  lifetime: "accountPortal.presentation.plans.lifetime",
  free: "accountPortal.presentation.plans.free",
  pro_own_ai_monthly: "accountPortal.presentation.plans.pro_own_ai_monthly",
  pro_own_ai_lifetime: "accountPortal.presentation.plans.pro_own_ai_lifetime",
};

const STATUS_TONES: Record<string, AccountStatusTone> = {
  active: "good",
  trialing: "good",
  preview: "neutral",
  incomplete: "warning",
  past_due: "warning",
  unpaid: "warning",
  cancel_at_period_end: "warning",
  canceled: "muted",
  cancelled: "muted",
  expired: "muted",
  none: "muted",
  unknown: "muted",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  preview: "Preview",
  incomplete: "Setup needed",
  past_due: "Payment issue",
  unpaid: "Payment issue",
  cancel_at_period_end: "Cancels at period end",
  canceled: "Canceled",
  cancelled: "Cancelled",
  expired: "Expired",
  none: "No subscription",
  unknown: "Unknown",
};

const STATUS_LABEL_KEYS: Record<string, string> = {
  active: "accountPortal.presentation.statuses.active",
  trialing: "accountPortal.presentation.statuses.trialing",
  preview: "accountPortal.presentation.statuses.preview",
  incomplete: "accountPortal.presentation.statuses.incomplete",
  past_due: "accountPortal.presentation.statuses.past_due",
  unpaid: "accountPortal.presentation.statuses.unpaid",
  cancel_at_period_end: "accountPortal.presentation.statuses.cancel_at_period_end",
  canceled: "accountPortal.presentation.statuses.canceled",
  cancelled: "accountPortal.presentation.statuses.cancelled",
  expired: "accountPortal.presentation.statuses.expired",
  none: "accountPortal.presentation.statuses.none",
  unknown: "accountPortal.presentation.statuses.unknown",
};

function titleizeIdentifier(value: string): string {
  return value
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bApi\b/g, "API");
}

function initialsFor(displayName: string, email: string): string {
  const nameParts = displayName
    .replace(email, "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }

  const source = nameParts[0] || email.split("@")[0] || "W";
  return source.slice(0, 2).toUpperCase();
}

function translated(options: AccountPresentationOptions, key: string, fallback: string, params?: AccountTranslationParams): string {
  const value = options.t?.(key, params);
  return value && value !== key ? value : fallback;
}

function localizedPlanLabel(planCode: string, options: AccountPresentationOptions): string {
  const fallback = PLAN_LABELS[planCode] ?? titleizeIdentifier(planCode);
  const key = PLAN_LABEL_KEYS[planCode];
  return key ? translated(options, key, fallback) : fallback;
}

function localizedStatusLabel(status: string, options: AccountPresentationOptions): string {
  const fallback = STATUS_LABELS[status] ?? titleizeIdentifier(status);
  const key = STATUS_LABEL_KEYS[status];
  return key ? translated(options, key, fallback) : fallback;
}

function localizedBillingDate(value: string | undefined, options: AccountPresentationOptions): string {
  const normalized = value?.trim();
  if (!normalized) return "";
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  const locale = options.locale === "zh" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function subscriptionPeriodPresentation(
  summary: AccountSummary,
  planCode: string,
  status: string,
  options: AccountPresentationOptions
): Pick<AccountPresentation, "subscriptionPeriodLabel" | "subscriptionPeriodValue" | "subscriptionPeriodDescription" | "hasSubscriptionPeriod"> {
  const periodEndLabel = localizedBillingDate(summary.account.currentPeriodEndsAt, options);
  const cancelAtPeriodEnd = Boolean(summary.account.cancelAtPeriodEnd) || status === "cancel_at_period_end";
  const isMonthly = planCode === "pro_own_ai_monthly";
  const isLifetime = planCode === "pro_own_ai_lifetime" || planCode === "lifetime";

  if (isLifetime) {
    return {
      subscriptionPeriodLabel: translated(options, "accountPortal.presentation.periodLabels.lifetime", "Access term"),
      subscriptionPeriodValue: translated(options, "accountPortal.presentation.periodValues.lifetime", "Lifetime"),
      subscriptionPeriodDescription: translated(options, "accountPortal.presentation.periodHints.lifetime", "Lifetime access does not expire."),
      hasSubscriptionPeriod: true,
    };
  }

  if (periodEndLabel && cancelAtPeriodEnd) {
    return {
      subscriptionPeriodLabel: translated(options, "accountPortal.presentation.periodLabels.accessUntil", "Access until"),
      subscriptionPeriodValue: periodEndLabel,
      subscriptionPeriodDescription: translated(
        options,
        "accountPortal.presentation.periodHints.cancelAtPeriodEnd",
        "Pro access remains available until this date."
      ),
      hasSubscriptionPeriod: true,
    };
  }

  if (periodEndLabel && isMonthly) {
    return {
      subscriptionPeriodLabel: translated(options, "accountPortal.presentation.periodLabels.nextRenewal", "Next renewal"),
      subscriptionPeriodValue: periodEndLabel,
      subscriptionPeriodDescription: translated(
        options,
        "accountPortal.presentation.periodHints.monthlyRenewal",
        "The current monthly period ends on this date and renews automatically."
      ),
      hasSubscriptionPeriod: true,
    };
  }

  if (periodEndLabel) {
    return {
      subscriptionPeriodLabel: translated(options, "accountPortal.presentation.periodLabels.currentPeriodEnds", "Current period ends"),
      subscriptionPeriodValue: periodEndLabel,
      subscriptionPeriodDescription: translated(
        options,
        "accountPortal.presentation.periodHints.currentPeriodEnds",
        "Current subscription period end."
      ),
      hasSubscriptionPeriod: true,
    };
  }

  return {
    subscriptionPeriodLabel: translated(options, "accountPortal.presentation.periodLabels.noPaidPeriod", "Paid period"),
    subscriptionPeriodValue: "",
    subscriptionPeriodDescription: translated(options, "accountPortal.presentation.periodHints.noPaidPeriod", "No paid period is available yet."),
    hasSubscriptionPeriod: false,
  };
}

export function accountPresentation(summary: AccountSummary, options: AccountPresentationOptions = {}): AccountPresentation {
  const email = summary.user.email?.trim() || translated(options, "accountPortal.presentation.emailUnavailable", "Email unavailable");
  const displayName = summary.user.displayName?.trim() || email;
  const planCode = summary.account.planCode?.trim() || "unknown";
  const normalizedStatus = summary.account.subscriptionStatus?.trim().toLowerCase() || "unknown";
  const deviceCount = Math.max(0, summary.account.deviceCount);
  const maxDevices = Math.max(0, summary.account.maxDevices);
  const deviceUsagePercent = maxDevices > 0 ? Math.min(100, Math.round((deviceCount / maxDevices) * 100)) : 0;
  const remainingDevices = Math.max(0, maxDevices - deviceCount);
  const subscriptionPeriod = subscriptionPeriodPresentation(summary, planCode, normalizedStatus, options);

  return {
    displayName,
    email,
    initials: initialsFor(displayName, email),
    planLabel: localizedPlanLabel(planCode, options),
    planCode,
    statusLabel: localizedStatusLabel(normalizedStatus, options),
    statusTone: STATUS_TONES[normalizedStatus] ?? "neutral",
    deviceUsageLabel: maxDevices > 0 ? `${deviceCount}/${maxDevices}` : `${deviceCount}`,
    deviceUsagePercent,
    deviceLimitLabel:
      maxDevices > 0
        ? translated(options, "accountPortal.presentation.deviceLimitLabel", `${maxDevices} desktop seats included`, { count: maxDevices })
        : translated(options, "accountPortal.presentation.deviceLimitPending", "Device limit pending"),
    devicesRemainingLabel:
      maxDevices <= 0
        ? translated(options, "accountPortal.presentation.deviceLimitUnavailable", "Device allowance is still syncing.")
        : remainingDevices === 0
          ? translated(options, "accountPortal.presentation.noDevicesRemaining", "All included device seats are currently in use.")
          : remainingDevices === 1
            ? translated(options, "accountPortal.presentation.oneDeviceRemaining", "1 device seat still available.", { count: remainingDevices })
            : translated(options, "accountPortal.presentation.manyDevicesRemaining", `${remainingDevices} device seats still available.`, { count: remainingDevices }),
    ...subscriptionPeriod,
  };
}
