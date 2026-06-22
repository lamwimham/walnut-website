import Link from "next/link";
import type { AccountSummary } from "@/lib/account/billing-client";
import { accountPresentation } from "@/lib/account/account-presenter";

export default function BillingOverview({ summary }: { summary: AccountSummary }) {
  const account = accountPresentation(summary);

  return (
    <section className="account-portal account-linear w-full">
      <div className="account-page-head">
        <div>
          <span className="account-kicker">Billing</span>
          <h1 className="account-title account-title-settings mt-4">Subscription details.</h1>
        </div>
        <div className="account-head-actions">
          <Link href="/account" className="account-secondary-link">Back to account</Link>
        </div>
      </div>

      <div className="account-profile-strip account-rule-top">
        <div className="min-w-0">
          <p className="account-profile-name">{account.planLabel}</p>
          <p className="account-profile-email">{account.email}</p>
        </div>
        <span className="account-status-pill" data-tone={account.statusTone}>{account.statusLabel}</span>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">Current access</p>
          <h2>{account.statusLabel}</h2>
          <p>Subscription state is synchronized from walnut-billing and projected into this web portal.</p>
        </div>
        <div className="account-section-value">
          <strong>{account.planLabel}</strong>
          <span>{account.planCode}</span>
        </div>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">Desktop seats</p>
          <h2>Included devices</h2>
          <p>{account.devicesRemainingLabel}</p>
        </div>
        <div className="account-section-value account-device-value">
          <strong>{account.deviceUsageLabel}</strong>
          <div className="account-usage-track" aria-label="Device usage">
            <span style={{ width: `${account.deviceUsagePercent}%` }} />
          </div>
        </div>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">Commerce</p>
          <h2>Checkout and plan changes</h2>
          <p>This page is ready for billing checkout, cancel, and resume endpoints once those commerce APIs are exposed.</p>
        </div>
        <div className="account-section-value">
          <span className="account-muted-pill">Coming next</span>
        </div>
      </div>
    </section>
  );
}
