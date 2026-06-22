import type { AccountSummary } from "./billing-client";

export type AccountStatusTone = "good" | "warning" | "neutral" | "muted";

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
};

const PLAN_LABELS: Record<string, string> = {
  basic_own_ai: "Basic - Own AI",
  pro: "Pro",
  lifetime: "Lifetime",
  free: "Free",
};

const STATUS_PRESENTATION: Record<string, { label: string; tone: AccountStatusTone }> = {
  active: { label: "Active", tone: "good" },
  trialing: { label: "Trial", tone: "good" },
  preview: { label: "Preview", tone: "neutral" },
  incomplete: { label: "Setup needed", tone: "warning" },
  past_due: { label: "Payment issue", tone: "warning" },
  unpaid: { label: "Payment issue", tone: "warning" },
  canceled: { label: "Canceled", tone: "muted" },
  unknown: { label: "Unknown", tone: "muted" },
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

export function accountPresentation(summary: AccountSummary): AccountPresentation {
  const email = summary.user.email?.trim() || "Email unavailable";
  const displayName = summary.user.displayName?.trim() || email;
  const planCode = summary.account.planCode?.trim() || "unknown";
  const normalizedStatus = summary.account.subscriptionStatus?.trim().toLowerCase() || "unknown";
  const status = STATUS_PRESENTATION[normalizedStatus] ?? {
    label: titleizeIdentifier(normalizedStatus),
    tone: "neutral" as const,
  };
  const deviceCount = Math.max(0, summary.account.deviceCount);
  const maxDevices = Math.max(0, summary.account.maxDevices);
  const deviceUsagePercent = maxDevices > 0 ? Math.min(100, Math.round((deviceCount / maxDevices) * 100)) : 0;
  const remainingDevices = Math.max(0, maxDevices - deviceCount);

  return {
    displayName,
    email,
    initials: initialsFor(displayName, email),
    planLabel: PLAN_LABELS[planCode] ?? titleizeIdentifier(planCode),
    planCode,
    statusLabel: status.label,
    statusTone: status.tone,
    deviceUsageLabel: maxDevices > 0 ? `${deviceCount}/${maxDevices}` : `${deviceCount}`,
    deviceUsagePercent,
    deviceLimitLabel: maxDevices > 0 ? `${maxDevices} desktop seats included` : "Device limit pending",
    devicesRemainingLabel:
      maxDevices <= 0
        ? "Billing has not returned a device limit yet."
        : remainingDevices === 0
          ? "All included device seats are currently in use."
          : `${remainingDevices} device ${remainingDevices === 1 ? "seat" : "seats"} still available.`,
  };
}
