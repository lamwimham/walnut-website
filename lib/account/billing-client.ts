import { accountRuntimeConfig, billingBridgeReady } from "./config";
import { CHECKOUT_PLANS, type CheckoutPlanKey } from "./checkout-plans";
export type GoogleIdentityPrincipal = {
  provider: "google";
  subject: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
};

export type AccountSummaryStatus = "live" | "preview" | "unavailable";

export type AccountSummaryLoadResult = {
  summary: AccountSummary;
  status: AccountSummaryStatus;
  reason?: string;
};

export type AccountSummaryUserFallback = Partial<AccountSummary["user"]> & {
  id: string;
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
    cancelAtPeriodEnd?: boolean;
    currentPeriodStartAt?: string;
    currentPeriodEndsAt?: string;
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

export type DeviceLoginSessionView = {
  id: string;
  status: string;
  provider: string;
  returnUrl?: string;
  expiresAt?: string;
  authorizedAt?: string;
  failureCode?: string;
  failureMessage?: string;
};

export type CheckoutSessionSummary = {
  checkoutUrl: string;
  provider: string;
  order: {
    outTradeNo: string;
    userId: string;
    skuCode: string;
    amount: number;
    currency: string;
    status: string;
    orderType: string;
  };
};

export type SubscriptionControlSummary = {
  userId: string;
  skuCode: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEndsAt: string;
};

export class BillingCheckoutError extends Error {
  code: string;
  reason?: string;
  action?: string;
  status?: number;

  constructor(code: string, options: { reason?: string; action?: string; status?: number; message?: string } = {}) {
    super(options.message ?? code);
    this.name = "BillingCheckoutError";
    this.code = code;
    this.reason = options.reason;
    this.action = options.action;
    this.status = options.status;
  }
}

export class BillingSubscriptionError extends Error {
  code: string;
  status?: number;

  constructor(code: string, options: { status?: number; message?: string } = {}) {
    super(options.message ?? code);
    this.name = "BillingSubscriptionError";
    this.code = code;
    this.status = options.status;
  }
}

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

function accountSummaryWithUserFallback(
  summary: AccountSummary,
  user: AccountSummaryUserFallback
): AccountSummary {
  return {
    ...summary,
    user: {
      id: user.id || summary.user.id,
      email: user.email ?? summary.user.email,
      displayName: user.displayName ?? summary.user.displayName,
    },
  };
}

function fallbackAccountSummaryForUser(
  user: AccountSummaryUserFallback,
  subscriptionStatus: string
): AccountSummary {
  return accountSummaryWithUserFallback(
    {
      ...DEMO_ACCOUNT,
      account: {
        ...DEMO_ACCOUNT.account,
        subscriptionStatus,
      },
    },
    user
  );
}

function accountSummaryFailureReason(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "billing_account_summary_failed";
}

function websiteUrl(path: string, config = accountRuntimeConfig()): string {
  if (!config.websitePublicUrl) return "";
  return `${config.websitePublicUrl}${path}`;
}

function checkoutIdempotencyKey(userId: string, skuCode: string): string {
  const bucket = Math.floor(Date.now() / (15 * 60 * 1000));
  return `website_checkout:${userId}:${skuCode}:${bucket}`;
}

function subscriptionIdempotencyKey(action: "cancel" | "resume", userId: string, skuCode: string): string {
  const bucket = Math.floor(Date.now() / (15 * 60 * 1000));
  return `website_subscription_${action}:${userId}:${skuCode}:${bucket}`;
}

function checkoutSessionFromPayload(payload: {
  checkout_url?: string;
  provider?: string;
  order?: {
    out_trade_no?: string;
    user_id?: string;
    sku_code?: string;
    amount?: number;
    currency?: string;
    status?: string;
    order_type?: string;
  };
}): CheckoutSessionSummary {
  const checkoutUrl = payload.checkout_url?.trim() ?? "";
  if (!checkoutUrl) throw new BillingCheckoutError("checkout_invalid_response");

  return {
    checkoutUrl,
    provider: payload.provider ?? "",
    order: {
      outTradeNo: payload.order?.out_trade_no ?? "",
      userId: payload.order?.user_id ?? "",
      skuCode: payload.order?.sku_code ?? "",
      amount: payload.order?.amount ?? 0,
      currency: payload.order?.currency ?? "",
      status: payload.order?.status ?? "",
      orderType: payload.order?.order_type ?? "",
    },
  };
}

function subscriptionControlFromPayload(payload: {
  user_id?: string;
  sku_code?: string;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_ends_at?: string;
}): SubscriptionControlSummary {
  return {
    userId: payload.user_id ?? "",
    skuCode: payload.sku_code ?? "",
    status: payload.status ?? "unknown",
    cancelAtPeriodEnd: Boolean(payload.cancel_at_period_end),
    currentPeriodEndsAt: payload.current_period_ends_at ?? "",
  };
}

async function checkoutErrorFromResponse(response: Response): Promise<BillingCheckoutError> {
  let payload: { code?: string; reason?: string; action?: string; error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  return new BillingCheckoutError(payload.reason || payload.code || `billing_${response.status}`, {
    reason: payload.reason,
    action: payload.action,
    status: response.status,
    message: payload.error,
  });
}

async function subscriptionErrorFromResponse(response: Response): Promise<BillingSubscriptionError> {
  let payload: { code?: string; error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  return new BillingSubscriptionError(payload.code || `billing_${response.status}`, {
    status: response.status,
    message: payload.error,
  });
}

function internalHeaders(): HeadersInit {
  return {
    "content-type": "application/json",
    authorization: `Bearer ${process.env.WALNUT_BILLING_INTERNAL_TOKEN?.trim() ?? ""}`,
  };
}

function accountSummaryFromPayload(payload: {
  user?: { id?: string; email?: string; display_name?: string };
  account?: {
    plan_code?: string;
    subscription_status?: string;
    cancel_at_period_end?: boolean;
    current_period_start_at?: string;
    current_period_ends_at?: string;
    device_count?: number;
    max_devices?: number;
  };
}, fallback: Partial<AccountSummary["user"]> = {}): AccountSummary {
  return {
    user: {
      id: payload.user?.id ?? fallback.id ?? "",
      email: payload.user?.email ?? fallback.email ?? "",
      displayName: payload.user?.display_name ?? fallback.displayName,
    },
    account: {
      planCode: payload.account?.plan_code ?? "basic_own_ai",
      subscriptionStatus: payload.account?.subscription_status ?? "unknown",
      cancelAtPeriodEnd: Boolean(payload.account?.cancel_at_period_end),
      currentPeriodStartAt: payload.account?.current_period_start_at ?? "",
      currentPeriodEndsAt: payload.account?.current_period_ends_at ?? "",
      deviceCount: payload.account?.device_count ?? 0,
      maxDevices: payload.account?.max_devices ?? 2,
    },
  };
}

function deviceSessionFromPayload(payload: {
  login_session?: {
    id?: string;
    status?: string;
    provider?: string;
    return_url?: string;
    expires_at?: string;
    authorized_at?: string;
    failure_code?: string;
    failure_message?: string;
  };
}): DeviceLoginSessionView | null {
  const session = payload.login_session;
  if (!session?.id || !session.status || !session.provider) return null;
  return {
    id: session.id,
    status: session.status,
    provider: session.provider,
    returnUrl: session.return_url,
    expiresAt: session.expires_at,
    authorizedAt: session.authorized_at,
    failureCode: session.failure_code,
    failureMessage: session.failure_message,
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

  const payload = (await response.json()) as Parameters<typeof accountSummaryFromPayload>[0];
  return accountSummaryFromPayload(payload, { email: principal.email, displayName: principal.displayName });
}

export async function accountSummaryForUser(userId: string): Promise<AccountSummary> {
  const config = accountRuntimeConfig();
  if (!config.billingInternalBaseUrl || !config.hasBillingInternalToken) {
    return {
      ...DEMO_ACCOUNT,
      user: { ...DEMO_ACCOUNT.user, id: userId || DEMO_ACCOUNT.user.id },
    };
  }

  const response = await fetch(`${config.billingInternalBaseUrl}/internal/v1/account/users/${encodeURIComponent(userId)}/summary`, {
    method: "GET",
    headers: internalHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("billing_account_summary_failed");

  const payload = (await response.json()) as Parameters<typeof accountSummaryFromPayload>[0];
  return accountSummaryFromPayload(payload, { id: userId });
}

export async function safeAccountSummaryForUser(
  user: AccountSummaryUserFallback
): Promise<AccountSummaryLoadResult> {
  const config = accountRuntimeConfig();

  if (!billingBridgeReady(config)) {
    return {
      summary: fallbackAccountSummaryForUser(user, "preview"),
      status: "preview",
    };
  }

  try {
    const summary = await accountSummaryForUser(user.id);
    return {
      summary: accountSummaryWithUserFallback(summary, user),
      status: "live",
    };
  } catch (error) {
    const reason = accountSummaryFailureReason(error);
    console.error("Walnut billing account summary failed", { reason, userId: user.id });
    return {
      summary: fallbackAccountSummaryForUser(user, "unknown"),
      status: "unavailable",
      reason,
    };
  }
}

export async function openDeviceLoginSession(intent: Pick<DeviceLoginIntent, "sessionId" | "browserToken">): Promise<{ ok: boolean; session?: DeviceLoginSessionView; reason?: string }> {
  const config = accountRuntimeConfig();
  if (!config.billingInternalBaseUrl || !config.hasBillingInternalToken) {
    return { ok: false, reason: "billing_not_configured" };
  }

  const response = await fetch(`${config.billingInternalBaseUrl}/internal/v1/access/device-login-sessions/${encodeURIComponent(intent.sessionId)}/open`, {
    method: "POST",
    headers: internalHeaders(),
    body: JSON.stringify({ browser_token: intent.browserToken }),
    cache: "no-store",
  });

  if (!response.ok) return { ok: false, reason: `billing_${response.status}` };
  const session = deviceSessionFromPayload(await response.json());
  if (!session) return { ok: false, reason: "billing_invalid_device_session" };
  return { ok: true, session };
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

export async function createCheckoutSessionForUser(input: {
  userId: string;
  planKey: CheckoutPlanKey;
}): Promise<CheckoutSessionSummary> {
  const config = accountRuntimeConfig();
  if (!billingBridgeReady(config)) {
    throw new BillingCheckoutError("billing_not_configured");
  }

  const plan = CHECKOUT_PLANS[input.planKey];
  const successURL = websiteUrl(`/checkout/success?plan=${encodeURIComponent(input.planKey)}`, config);
  const cancelURL = websiteUrl(`/checkout/cancel?plan=${encodeURIComponent(input.planKey)}`, config);
  const response = await fetch(`${config.billingInternalBaseUrl}/api/v1/commerce/checkout-sessions`, {
    method: "POST",
    headers: internalHeaders(),
    body: JSON.stringify({
      user_id: input.userId,
      sku_code: plan.skuCode,
      provider: config.checkoutProvider,
      success_url: successURL,
      cancel_url: cancelURL,
      idempotency_key: checkoutIdempotencyKey(input.userId, plan.skuCode),
      metadata: {
        source: "walnut_website_landing_pricing",
        pricing_plan_key: input.planKey,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await checkoutErrorFromResponse(response);
  }

  return checkoutSessionFromPayload(await response.json());
}

export async function cancelSubscriptionForUser(input: {
  userId: string;
  skuCode: string;
  reason?: string;
}): Promise<SubscriptionControlSummary> {
  const config = accountRuntimeConfig();
  if (!billingBridgeReady(config)) {
    throw new BillingSubscriptionError("billing_not_configured");
  }

  const response = await fetch(`${config.billingInternalBaseUrl}/api/v1/commerce/subscriptions/cancel`, {
    method: "POST",
    headers: internalHeaders(),
    body: JSON.stringify({
      user_id: input.userId,
      sku_code: input.skuCode,
      reason: input.reason || "user_requested",
      source: "walnut_website_account",
      idempotency_key: subscriptionIdempotencyKey("cancel", input.userId, input.skuCode),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await subscriptionErrorFromResponse(response);
  }

  return subscriptionControlFromPayload(await response.json());
}

export async function resumeSubscriptionForUser(input: {
  userId: string;
  skuCode: string;
}): Promise<SubscriptionControlSummary> {
  const config = accountRuntimeConfig();
  if (!billingBridgeReady(config)) {
    throw new BillingSubscriptionError("billing_not_configured");
  }

  const response = await fetch(`${config.billingInternalBaseUrl}/api/v1/commerce/subscriptions/resume`, {
    method: "POST",
    headers: internalHeaders(),
    body: JSON.stringify({
      user_id: input.userId,
      sku_code: input.skuCode,
      source: "walnut_website_account",
      idempotency_key: subscriptionIdempotencyKey("resume", input.userId, input.skuCode),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await subscriptionErrorFromResponse(response);
  }

  return subscriptionControlFromPayload(await response.json());
}

export function checkoutErrorReason(error: unknown): string {
  if (error instanceof BillingCheckoutError) return error.reason || error.code;
  return "checkout_failed";
}

export function subscriptionErrorReason(error: unknown): string {
  if (error instanceof BillingSubscriptionError) return error.code;
  return "subscription_control_failed";
}
