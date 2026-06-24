import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountShell from "@/components/account/AccountShell";
import AccountOverview from "@/components/account/AccountOverview";
import { safeAccountSummaryForUser } from "@/lib/account/billing-client";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Walnut Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await currentWebsiteSession();
  if (!session) {
    redirect("/login?returnTo=%2Faccount");
  }

  const { reason, status, summary } = await safeAccountSummaryForUser({
    id: session.userId,
    email: session.email,
    displayName: session.displayName,
  });
  return (
    <AccountShell session={session}>
      <AccountOverview summary={summary} summaryReason={reason} summaryStatus={status} />
    </AccountShell>
  );
}
