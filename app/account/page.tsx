import type { Metadata } from "next";
import Link from "next/link";
import AccountShell from "@/components/account/AccountShell";
import GoogleLoginPanel from "@/components/account/GoogleLoginPanel";
import { accountSummaryForUser } from "@/lib/account/billing-client";
import { currentWebsiteSession } from "@/lib/account/session";
import { signOutFromAccount } from "@/lib/account/auth-actions";

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
      <section className="w-full">
        <span className="account-kicker">Account overview</span>
        <div className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="account-title">Your Walnut control room.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
              Website owns the browser session. Billing remains the source of truth for subscription, devices, and signed access snapshots.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/account/billing" className="primary-cta rounded-2xl px-5 py-3 text-sm font-semibold">Manage billing</Link>
              <form action={signOutFromAccount}>
                <button className="secondary-cta rounded-2xl px-5 py-3 text-sm font-semibold" type="submit">Sign out</button>
              </form>
            </div>
          </div>
          <div className="account-card grid gap-4 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-border-subtle pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-text-muted">Signed in as</p>
                <h2 className="mt-2 font-display text-3xl">{summary.user.displayName || summary.user.email}</h2>
                <p className="mt-1 text-sm text-text-muted">{summary.user.email}</p>
              </div>
              <div className="account-orb">W</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="account-metric"><span>Plan</span><strong>{summary.account.planCode}</strong></div>
              <div className="account-metric"><span>Status</span><strong>{summary.account.subscriptionStatus}</strong></div>
              <div className="account-metric"><span>Devices</span><strong>{summary.account.deviceCount}/{summary.account.maxDevices}</strong></div>
            </div>
          </div>
        </div>
      </section>
    </AccountShell>
  );
}
