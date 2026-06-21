import { accountRuntimeConfig } from "./config";
export type GoogleIdentityPrincipal = {
  provider: "google";
  subject: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
};

export type AccountSummary = {
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
  account: {
    planCode: string;
    subscriptionStatus: string;
    deviceCount: number;
    maxDevices: number;
  };
};

export type DeviceLoginIntent = {
  sessionId: string;
  browserToken: string;
  provider: string;
  returnUrl: string;
};

const DEMO_ACCOUNT: AccountSummary = {
  user: {
    id: "usr_preview",
    email: "preview@walnut.local",
    displayName: "Walnut Preview",
  },
  account: {
    planCode: "basic_own_ai",
    subscriptionStatus: "preview",
    deviceCount: 0,
    maxDevices: 2,
  },
};

function internalHeaders(): HeadersInit {
  return {
    "content-type": "application/json",
    authorization: `Bearer ${process.env.WALNUT_BILLING_INTERNAL_TOKEN?.trim() ?? ""}`,
  };
}

export async function externalLoginWithGoogle(principal: GoogleIdentityPrincipal): Promise<AccountSummary> {
  const config = accountRuntimeConfig();
  if (!config.billingInternalBaseUrl || !config.hasBillingInternalToken) {
    return {
      ...DEMO_ACCOUNT,
      user: {
        id: `google_${principal.subject.slice(0, 10)}`,
        email: principal.email,
        displayName: principal.displayName,
      },
    };
  }

  const response = await fetch(`${config.billingInternalBaseUrl}/internal/v1/identity/external-login`, {
    method: "POST",
    headers: internalHeaders(),
    body: JSON.stringify({
      provider: principal.provider,
      subject: principal.subject,
      email: principal.email,
      email_verified: principal.emailVerified,
      display_name: principal.displayName ?? "",
      avatar_url: principal.avatarUrl ?? "",
      source: "website_google_login",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("billing_external_login_failed");

  const payload = (await response.json()) as {
    user?: { id?: string; email?: string; display_name?: string };
    account?: { plan_code?: string; subscription_status?: string; device_count?: number; max_devices?: number };
  };
  return {
    user: {
      id: payload.user?.id ?? "",
      email: payload.user?.email ?? principal.email,
      displayName: payload.user?.display_name ?? principal.displayName,
    },
    account: {
      planCode: payload.account?.plan_code ?? "basic_own_ai",
      subscriptionStatus: payload.account?.subscription_status ?? "unknown",
      deviceCount: payload.account?.device_count ?? 0,
      maxDevices: payload.account?.max_devices ?? 2,
    },
  };
}

export async function accountSummaryForUser(userId: string): Promise<AccountSummary> {
  const config = accountRuntimeConfig();
  if (!config.billingInternalBaseUrl || !config.hasBillingInternalToken) {
    return {
      ...DEMO_ACCOUNT,
      user: { ...DEMO_ACCOUNT.user, id: userId || DEMO_ACCOUNT.user.id },
    };
  }

  // Contract target: GET /internal/v1/account/users/{user_id}/summary.
  return {
    ...DEMO_ACCOUNT,
    user: { ...DEMO_ACCOUNT.user, id: userId || DEMO_ACCOUNT.user.id },
  };
}

export async function authorizeDeviceLogin(intent: DeviceLoginIntent, userId: string): Promise<{ ok: boolean; reason?: string }> {
  const config = accountRuntimeConfig();
  if (!config.billingInternalBaseUrl || !config.hasBillingInternalToken) {
    return { ok: false, reason: "billing_not_configured" };
  }

  const response = await fetch(`${config.billingInternalBaseUrl}/internal/v1/access/device-login-sessions/${encodeURIComponent(intent.sessionId)}/authorize`, {
    method: "POST",
    headers: internalHeaders(),
    body: JSON.stringify({
      browser_token: intent.browserToken,
      user_id: userId,
      source: "website_device_login",
    }),
    cache: "no-store",
  });

  if (!response.ok) return { ok: false, reason: `billing_${response.status}` };
  return { ok: true };
}
