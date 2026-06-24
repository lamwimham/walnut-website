import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountShell from "@/components/account/AccountShell";
import BillingOverview from "@/components/account/BillingOverview";
import { safeAccountSummaryForUser } from "@/lib/account/billing-client";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Walnut Subscription Portal",
  robots: { index: false, follow: false },
};

export default async function AccountBillingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const session = await currentWebsiteSession();
  if (!session) {
    redirect("/login?returnTo=%2Faccount%2Fbilling");
  }

  const { reason: summaryReason, status: summaryStatus, summary } = await safeAccountSummaryForUser({
    id: session.userId,
    email: session.email,
    displayName: session.displayName,
  });
  const subscription = Array.isArray(params.subscription) ? params.subscription[0] : params.subscription;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  return (
    <AccountShell session={session}>
      <BillingOverview summary={summary} summaryReason={summaryReason} summaryStatus={summaryStatus} notice={{ status: subscription, reason }} />
    </AccountShell>
  );
}
