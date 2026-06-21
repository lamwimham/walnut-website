"use server";

import { redirect } from "next/navigation";
import { authorizeDeviceLogin } from "@/lib/account/billing-client";
import { safeReturnUrl } from "@/lib/account/return-url-policy";
import { currentWebsiteSession } from "@/lib/account/session";

export async function authorizeDeviceLoginAction(formData: FormData) {
  const session = await currentWebsiteSession();
  if (!session) redirect("/login");

  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const browserToken = String(formData.get("browserToken") ?? "").trim();
  const provider = String(formData.get("provider") ?? "google").trim() || "google";
  const returnUrl = safeReturnUrl(String(formData.get("returnUrl") ?? ""), "walnut://access/oauth/google/success");

  if (!sessionId || !browserToken) {
    redirect("/auth/error?reason=device_login_missing_data");
  }

  const result = await authorizeDeviceLogin({ sessionId, browserToken, provider, returnUrl }, session.userId);
  if (!result.ok) {
    redirect(`/auth/error?reason=${encodeURIComponent(result.reason ?? "device_authorization_failed")}`);
  }

  redirect(`/auth/success?returnTo=${encodeURIComponent(returnUrl)}`);
}
