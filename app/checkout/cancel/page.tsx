import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import { CheckoutCancelPanel } from "@/components/account/CheckoutStatusPanels";
import { checkoutPlanFromParam, checkoutStartPath } from "@/lib/account/checkout-plans";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Walnut Payment Canceled",
  robots: { index: false, follow: false },
};

export default async function CheckoutCancelPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const session = await currentWebsiteSession();
  const planKey = checkoutPlanFromParam(params.plan);
  const retryHref = planKey ? checkoutStartPath(planKey) : "/#pricing";

  return (
    <AccountShell session={session}>
      <CheckoutCancelPanel retryHref={retryHref} />
    </AccountShell>
  );
}
