import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createCheckoutSessionForUser, checkoutErrorReason } from "@/lib/account/billing-client";
import { checkoutPlanFromParam, checkoutStartPath } from "@/lib/account/checkout-plans";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Start Walnut Payment",
  robots: { index: false, follow: false },
};

export default async function CheckoutStartPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const planKey = checkoutPlanFromParam(params.plan);
  if (!planKey) {
    redirect("/checkout/error?reason=invalid_plan");
  }

  const session = await currentWebsiteSession();
  const returnTo = checkoutStartPath(planKey);
  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  let checkoutUrl: string;
  try {
    const checkout = await createCheckoutSessionForUser({
      planKey,
      userId: session.userId,
    });
    checkoutUrl = checkout.checkoutUrl;
  } catch (error) {
    const reason = checkoutErrorReason(error);
    redirect(`/checkout/error?reason=${encodeURIComponent(reason)}&plan=${encodeURIComponent(planKey)}`);
  }

  redirect(checkoutUrl);
}
