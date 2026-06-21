import type { Metadata } from "next";
import Link from "next/link";
import AccountShell from "@/components/account/AccountShell";
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
      <section className="w-full">
        <span className="account-kicker">Billing portal</span>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <h1 className="account-title">Subscription actions stay behind billing.</h1>
            <p className="mt-6 text-base leading-8 text-text-secondary">
              This portal is the UI shell. Checkout, cancellation, restore, device rules, and entitlement snapshots are delegated to walnut-billing.
            </p>
            <Link href="/account" className="secondary-cta mt-8 inline-flex rounded-2xl px-5 py-3 text-sm font-semibold">Back to account</Link>
          </div>
          <div className="account-card p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-signal">Current access</p>
            <h2 className="mt-4 font-display text-4xl">{summary.account.planCode}</h2>
            <p className="mt-3 text-sm leading-7 text-text-muted">Status: {summary.account.subscriptionStatus}</p>
            <div className="mt-6 rounded-3xl border border-border-subtle bg-white/[0.025] p-5 text-sm leading-7 text-text-secondary">
              Checkout and subscription controls will call billing commerce APIs once the device login bridge API lands.
            </div>
          </div>
        </div>
      </section>
    </AccountShell>
  );
}
