"use client";

import Link from "next/link";
import AccountServiceNotice from "./AccountServiceNotice";
import type { AccountSummary, AccountSummaryStatus } from "@/lib/account/billing-client";
import { accountPresentation } from "@/lib/account/account-presenter";
import { signOutFromAccount } from "@/lib/account/auth-actions";
import { useI18n } from "@/lib/i18n/context";

export default function AccountOverview({
  summary,
  summaryReason,
  summaryStatus = "live",
}: {
  summary: AccountSummary;
  summaryReason?: string;
  summaryStatus?: AccountSummaryStatus;
}) {
  const { t, locale } = useI18n();
  const account = accountPresentation(summary, { t, locale });

  return (
    <section className="account-portal account-linear w-full">
      <div className="account-page-head">
        <div>
          <span className="account-kicker">{t("accountPortal.overview.kicker")}</span>
          <h1 className="account-title account-title-settings mt-4">{t("accountPortal.overview.title")}</h1>
        </div>
        <div className="account-head-actions">
          <Link href="/account/billing" className="account-primary-link">{t("accountPortal.overview.manageSubscription")}</Link>
          <form action={signOutFromAccount}>
            <button className="account-secondary-link" type="submit">{t("accountPortal.overview.signOut")}</button>
          </form>
        </div>
      </div>

      <AccountServiceNotice reason={summaryReason} status={summaryStatus} />

      <div className="account-profile-strip account-rule-top">
        <div className="account-avatar" aria-hidden="true">{account.initials}</div>
        <div className="min-w-0">
          <p className="account-profile-name">{account.displayName}</p>
          <p className="account-profile-email">{account.email}</p>
        </div>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">{t("accountPortal.overview.subscriptionLabel")}</p>
          <h2>{t("accountPortal.overview.planTitle")}</h2>
          <p>{t("accountPortal.overview.planDescription")}</p>
        </div>
        <div className="account-section-value">
          <strong>{account.planLabel}</strong>
          <span className="account-status-pill" data-tone={account.statusTone}>{account.statusLabel}</span>
          {account.hasSubscriptionPeriod && (
            <div className="account-period-detail">
              <p className="account-period-label">{account.subscriptionPeriodLabel}</p>
              <p className="account-period-value">{account.subscriptionPeriodValue}</p>
              <p className="account-period-hint">{account.subscriptionPeriodDescription}</p>
            </div>
          )}
          <Link href="/account/billing" className="account-text-link">{t("accountPortal.overview.openBilling")}</Link>
        </div>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">{t("accountPortal.overview.desktopLabel")}</p>
          <h2>{t("accountPortal.overview.deviceSeatsTitle")}</h2>
          <p>{account.deviceLimitLabel}. {account.devicesRemainingLabel}</p>
        </div>
        <div className="account-section-value account-device-value">
          <strong>{account.deviceUsageLabel}</strong>
          <div className="account-usage-track" aria-label={t("accountPortal.presentation.deviceUsageAria")}>
            <span style={{ width: `${account.deviceUsagePercent}%` }} />
          </div>
        </div>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">{t("accountPortal.overview.loginLabel")}</p>
          <h2>{t("accountPortal.overview.googleTitle")}</h2>
          <p>{t("accountPortal.overview.googleDescription")}</p>
        </div>
        <div className="account-section-value">
          <span className="account-connected-method"><span>G</span> {t("accountPortal.overview.connected")}</span>
        </div>
      </div>

      <div className="account-plain-note">
        <p className="account-section-label">{t("accountPortal.overview.securityLabel")}</p>
        <p>{t("accountPortal.overview.securityDescription")}</p>
      </div>
    </section>
  );
}
