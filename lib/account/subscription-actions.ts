"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cancelSubscriptionForUser,
  resumeSubscriptionForUser,
  subscriptionErrorReason,
} from "./billing-client";
import { MONTHLY_SUBSCRIPTION_SKU } from "./checkout-plans";
import { currentWebsiteSession } from "./session";

function billingNoticePath(status: string, reason?: string): string {
  const params = new URLSearchParams({ subscription: status });
  if (reason) params.set("reason", reason);
  return `/account/billing?${params.toString()}`;
}

export async function cancelSubscriptionFromAccount(formData: FormData) {
  const session = await currentWebsiteSession();
  if (!session) {
    redirect("/login?returnTo=%2Faccount%2Fbilling");
  }

  const reason = String(formData.get("reason") ?? "user_requested").trim() || "user_requested";
  let nextPath = billingNoticePath("cancel_requested");
  try {
    await cancelSubscriptionForUser({
      userId: session.userId,
      skuCode: MONTHLY_SUBSCRIPTION_SKU,
      reason,
    });
    revalidatePath("/account");
    revalidatePath("/account/billing");
  } catch (error) {
    nextPath = billingNoticePath("error", subscriptionErrorReason(error));
  }
  redirect(nextPath);
}

export async function resumeSubscriptionFromAccount() {
  const session = await currentWebsiteSession();
  if (!session) {
    redirect("/login?returnTo=%2Faccount%2Fbilling");
  }

  let nextPath = billingNoticePath("resume_requested");
  try {
    await resumeSubscriptionForUser({
      userId: session.userId,
      skuCode: MONTHLY_SUBSCRIPTION_SKU,
    });
    revalidatePath("/account");
    revalidatePath("/account/billing");
  } catch (error) {
    nextPath = billingNoticePath("error", subscriptionErrorReason(error));
  }
  redirect(nextPath);
}
