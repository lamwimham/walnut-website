"use client";

import Link from "next/link";
import AccountServiceNotice, { useAccountServiceText } from "./AccountServiceNotice";
import type { AccountSummary, AccountSummaryStatus } from "@/lib/account/billing-client";
import { accountPresentation } from "@/lib/account/account-presenter";
import { checkoutStartPath } from "@/lib/account/checkout-plans";
import { cancelSubscriptionFromAccount, resumeSubscriptionFromAccount } from "@/lib/account/subscription-actions";
import { subscriptionControlsFor } from "@/lib/account/subscription-state";
import { useI18n } from "@/lib/i18n/context";

export type BillingNotice = {
  status?: string;
  reason?: string;
};

function localizedNotice(t: (key: string) => string, notice?: BillingNotice): { tone: "good" | "warning"; title: string; body: string } | null {
  const status = notice?.status;
  if (!status) return null;
  if (status === "cancel_requested") {
    return {
      tone: "warning",
      title: t("accountPortal.billing.notices.cancelRequested.title"),
      body: t("accountPortal.billing.notices.cancelRequested.body"),
    };
  }
  if (status === "resume_requested") {
    return {
      tone: "good",
      title: t("accountPortal.billing.notices.resumeRequested.title"),
      body: t("accountPortal.billing.notices.resumeRequested.body"),
    };
  }
  const reasonKey = `accountPortal.billing.errors.${notice?.reason || "unknown"}`;
  const reasonLabel = t(reasonKey);
  return {
    tone: "warning",
    title: t("accountPortal.billing.notices.error.title"),
    body: reasonLabel === reasonKey ? t("accountPortal.billing.errors.unknown") : reasonLabel,
  };
}

export default function BillingOverview({
  summary,
  summaryReason,
  summaryStatus = "live",
  notice,
}: {
  summary: AccountSummary;
  summaryReason?: string;
  summaryStatus?: AccountSummaryStatus;
  notice?: BillingNotice;
}) {
  const { t, locale } = useI18n();
  const serviceCopy = useAccountServiceText();
  const account = accountPresentation(summary, { t, locale });
  const controls = subscriptionControlsFor(summary);
  const noticeView = localizedNotice(t, notice);
  const serviceUnavailable = summaryStatus === "unavailable";

  return (
    <section className="account-portal account-linear w-full">
      <div className="account-page-head">
        <div>
          <span className="account-kicker">{t("accountPortal.billing.kicker")}</span>
          <h1 className="account-title account-title-settings mt-4">{t("accountPortal.billing.title")}</h1>
        </div>
        <div className="account-head-actions">
          <Link href="/account" className="account-secondary-link">{t("accountPortal.billing.backToAccount")}</Link>
        </div>
      </div>

      <AccountServiceNotice reason={summaryReason} status={summaryStatus} />

      {noticeView && (
        <div className="account-billing-notice" data-tone={noticeView.tone}>
          <strong>{noticeView.title}</strong>
          <span>{noticeView.body}</span>
        </div>
      )}

      <div className="account-profile-strip account-rule-top">
        <div className="min-w-0">
          <p className="account-profile-name">{account.displayName}</p>
          <p className="account-profile-email">{account.email}</p>
        </div>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">{t("accountPortal.billing.currentAccessLabel")}</p>
          <h2>{account.statusLabel}</h2>
          <p>{t("accountPortal.billing.currentAccessDescription")}</p>
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
        </div>
      </div>

      <div className="account-settings-section">
        <div className="account-section-copy">
          <p className="account-section-label">{t("accountPortal.billing.desktopSeatsLabel")}</p>
          <h2>{t("accountPortal.billing.includedDevicesTitle")}</h2>
          <p>{account.devicesRemainingLabel}</p>
        </div>
        <div className="account-section-value account-device-value">
          <strong>{account.deviceUsageLabel}</strong>
          <div className="account-usage-track" aria-label={t("accountPortal.presentation.deviceUsageAria")}>
            <span style={{ width: `${account.deviceUsagePercent}%` }} />
          </div>
        </div>
      </div>

      <div className="account-billing-module">
        <div className="account-section-copy">
          <p className="account-section-label">{t("accountPortal.billing.serviceLabel")}</p>
          <h2>{t("accountPortal.billing.serviceTitle")}</h2>
          <p>{t("accountPortal.billing.serviceDescription")}</p>
        </div>

        <div className="account-plan-grid">
          <article className="account-plan-card" data-current={!controls.isMonthly && !controls.isLifetime}>
            <span>{t("accountPortal.billing.plans.basic.eyebrow")}</span>
            <h3>{t("accountPortal.billing.plans.basic.title")}</h3>
            <p>{t("accountPortal.billing.plans.basic.description")}</p>
            <div className="account-plan-action">
              <span className="account-muted-pill">{t("accountPortal.billing.plans.basic.current")}</span>
            </div>
          </article>

          <article className="account-plan-card account-plan-card-featured" data-current={controls.isMonthly}>
            <span>{t("accountPortal.billing.plans.monthly.eyebrow")}</span>
            <h3>{t("accountPortal.billing.plans.monthly.title")}</h3>
            <p>{t("accountPortal.billing.plans.monthly.description")}</p>
            <div className="account-plan-action">
              {serviceUnavailable ? (
                <span className="account-muted-pill">{serviceCopy.actionUnavailable}</span>
              ) : controls.canStartMonthly ? (
                <Link href={checkoutStartPath("proByok")} className="account-primary-link">
                  {t("accountPortal.billing.plans.monthly.cta")}
                </Link>
              ) : controls.canResume ? (
                <form action={resumeSubscriptionFromAccount}>
                  <button className="account-primary-link" type="submit">{t("accountPortal.billing.resumeButton")}</button>
                </form>
              ) : (
                <span className="account-muted-pill">{t("accountPortal.billing.plans.monthly.current")}</span>
              )}
            </div>
          </article>

          <article className="account-plan-card account-plan-card-lifetime" data-current={controls.isLifetime}>
            <span>{t("accountPortal.billing.plans.lifetime.eyebrow")}</span>
            <h3>{t("accountPortal.billing.plans.lifetime.title")}</h3>
            <p>{t("accountPortal.billing.plans.lifetime.description")}</p>
            <div className="account-plan-action">
              {serviceUnavailable ? (
                <span className="account-muted-pill">{serviceCopy.actionUnavailable}</span>
              ) : controls.canStartLifetime ? (
                <Link href={checkoutStartPath("lifetime")} className="account-primary-link">
                  {t("accountPortal.billing.plans.lifetime.cta")}
                </Link>
              ) : controls.lifetimeRequiresMonthlyCancellation ? (
                <span className="account-muted-pill">{t("accountPortal.billing.plans.lifetime.cancelFirst")}</span>
              ) : (
                <span className="account-muted-pill">{t("accountPortal.billing.plans.lifetime.current")}</span>
              )}
            </div>
          </article>
        </div>
      </div>

      <div className="account-billing-module account-billing-control">
        <div className="account-section-copy">
          <p className="account-section-label">{t("accountPortal.billing.managementLabel")}</p>
          <h2>{controls.canResume ? t("accountPortal.billing.resumeTitle") : t("accountPortal.billing.cancelTitle")}</h2>
          <p>
            {controls.canCancel
              ? t("accountPortal.billing.cancelDescription")
              : controls.canResume
                ? t("accountPortal.billing.resumeDescription")
                : controls.isLifetime
                  ? t("accountPortal.billing.lifetimeDescription")
                  : t("accountPortal.billing.noSubscriptionDescription")}
          </p>
        </div>

        <div className="account-billing-control-actions">
          {serviceUnavailable && (
            <span className="account-muted-pill">{serviceCopy.actionUnavailable}</span>
          )}
          {!serviceUnavailable && controls.canCancel && (
            <form action={cancelSubscriptionFromAccount}>
              <input type="hidden" name="reason" value="user_requested" />
              <button className="account-danger-link" type="submit">{t("accountPortal.billing.cancelButton")}</button>
            </form>
          )}
          {!serviceUnavailable && controls.canResume && (
            <form action={resumeSubscriptionFromAccount}>
              <button className="account-primary-link" type="submit">{t("accountPortal.billing.resumeButton")}</button>
            </form>
          )}
          {!serviceUnavailable && !controls.canCancel && !controls.canResume && !controls.isLifetime && (
            <Link href={checkoutStartPath("proByok")} className="account-primary-link">
              {t("accountPortal.billing.startSubscriptionButton")}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
