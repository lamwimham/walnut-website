import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import BillingOverview from "@/components/account/BillingOverview";
import GoogleLoginPanel from "@/components/account/GoogleLoginPanel";
import { accountSummaryForUser } from "@/lib/account/billing-client";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Walnut Billing Portal",
  robots: { index: false, follow: false },
};

export default async function AccountBillingPage() {
  const session = await currentWebsiteSession();
  if (!session) {
    return (
      <AccountShell>
        <GoogleLoginPanel returnTo="/account/billing" />
      </AccountShell>
    );
  }

  const summary = await accountSummaryForUser(session.userId);
  return (
    <AccountShell>
      <BillingOverview summary={summary} />
    </AccountShell>
  );
}
