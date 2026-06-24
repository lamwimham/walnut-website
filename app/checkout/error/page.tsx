import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import { CheckoutErrorPanel } from "@/components/account/CheckoutStatusPanels";
import { checkoutPlanFromParam, checkoutStartPath } from "@/lib/account/checkout-plans";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Walnut Payment Error",
  robots: { index: false, follow: false },
};

export default async function CheckoutErrorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const session = await currentWebsiteSession();
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  const planKey = checkoutPlanFromParam(params.plan);
  const retryHref = planKey ? checkoutStartPath(planKey) : "/#pricing";

  return (
    <AccountShell session={session}>
      <CheckoutErrorPanel reason={reason} retryHref={retryHref} />
    </AccountShell>
  );
}
