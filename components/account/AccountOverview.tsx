import Link from "next/link";
import type { AccountSummary } from "@/lib/account/billing-client";
import { accountPresentation } from "@/lib/account/account-presenter";
import { signOutFromAccount } from "@/lib/account/auth-actions";

export default function AccountOverview({ summary }: { summary: AccountSummary }) {
  const account = accountPresentation(summary);

  return (
    <section className="account-portal account-linear w-full">
      <div className="account-page-head">
        <div>
          <span className="account-kicker">Account</span>
          <h1 className="account-title account-title-settings mt-4">Manage Walnut access.</h1>
        </div>
        <div className="account-head-actions">
          <Link href="/account/billing" className="account-primary-link">Manage subscription</Link>
          <form action={signOutFromAccount}>
            <button className="account-secondary-link" type="submit">Sign out</button>
          </form>
        </div>
      </div>

      <div className="account-profile-strip account-rule-top">
        <div className="account-avatar" aria-hidden="true">{account.initials}</div>
        <div className="min-w-0">
          <p className="account-profile-name">{account.displayName}</p>
          <p className="account-profile-email">{account.email}</p>
        </div>
        <span className="account-status-pill" data-tone={account.statusTone}>{account.statusLabel}</span>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">Subscription</p>
          <h2>Plan and billing</h2>
          <p>Billing is the source of truth for your Walnut plan, renewal state, and device allowance.</p>
        </div>
        <div className="account-section-value">
          <strong>{account.planLabel}</strong>
          <span>{account.planCode}</span>
          <Link href="/account/billing" className="account-text-link">Open billing</Link>
        </div>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">Desktop access</p>
          <h2>Device seats</h2>
          <p>{account.deviceLimitLabel}. {account.devicesRemainingLabel}</p>
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
          <p className="account-section-label">Login</p>
          <h2>Google account</h2>
          <p>Google verifies your browser identity. Walnut desktop receives only a billing-approved signed access snapshot.</p>
        </div>
        <div className="account-section-value">
          <span className="account-connected-method"><span>G</span> Connected</span>
        </div>
      </div>

      <div className="account-plain-note">
        <p className="account-section-label">Security model</p>
        <p>Web login, billing authorization, and desktop access are separate steps. No Google provider token is stored in the Walnut desktop client.</p>
      </div>
    </section>
  );
}
