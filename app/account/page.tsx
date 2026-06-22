import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import AccountOverview from "@/components/account/AccountOverview";
import GoogleLoginPanel from "@/components/account/GoogleLoginPanel";
import { accountSummaryForUser } from "@/lib/account/billing-client";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Walnut Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await currentWebsiteSession();
  if (!session) {
    return (
      <AccountShell>
        <GoogleLoginPanel returnTo="/account" />
      </AccountShell>
    );
  }

  const summary = await accountSummaryForUser(session.userId);
  return (
    <AccountShell>
      <AccountOverview summary={summary} />
    </AccountShell>
  );
}
