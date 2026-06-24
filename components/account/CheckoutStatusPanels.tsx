"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

type CheckoutRetryProps = {
  retryHref?: string;
};

const SUBSCRIPTION_SYNC_DEEP_LINK = "walnut://access/sync/subscription?result=success";

function localizedReason(t: (key: string) => string, reason: string | undefined): string {
  if (!reason) return t("accountPortal.checkout.error.reasons.unknown");
  const key = `accountPortal.checkout.error.reasons.${reason}`;
  const label = t(key);
  return label === key ? t("accountPortal.checkout.error.reasons.unknown") : label;
}

export function CheckoutSuccessPanel() {
  const { t } = useI18n();
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState(8);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      router.replace("/account/billing");
      return;
    }
    const timer = window.setTimeout(() => setSecondsRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [router, secondsRemaining]);

  return (
    <section className="mx-auto max-w-2xl text-center">
      <span className="account-kicker">{t("accountPortal.checkout.success.kicker")}</span>
      <h1 className="account-title mt-5">{t("accountPortal.checkout.success.title")}</h1>
      <p className="mt-6 text-base leading-8 text-text-secondary">
        {t("accountPortal.checkout.success.description")}
      </p>
      <p className="account-checkout-redirect mx-auto mt-6">
        {t("accountPortal.checkout.success.redirecting", { seconds: secondsRemaining })}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={SUBSCRIPTION_SYNC_DEEP_LINK} className="account-primary-link inline-flex">
          {t("accountPortal.checkout.success.desktopSyncCta")}
        </a>
        <Link href="/account/billing" className="account-secondary-link inline-flex">
          {t("accountPortal.checkout.success.billingCta")}
        </Link>
        <Link href="/account" className="account-secondary-link inline-flex">
          {t("accountPortal.checkout.success.accountCta")}
        </Link>
      </div>
    </section>
  );
}

export function CheckoutCancelPanel({ retryHref = "/#pricing" }: CheckoutRetryProps) {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-2xl text-center">
      <span className="account-kicker">{t("accountPortal.checkout.cancel.kicker")}</span>
      <h1 className="account-title mt-5">{t("accountPortal.checkout.cancel.title")}</h1>
      <p className="mt-6 text-base leading-8 text-text-secondary">
        {t("accountPortal.checkout.cancel.description")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={retryHref} className="account-primary-link inline-flex">
          {t("accountPortal.checkout.cancel.retryCta")}
        </Link>
        <Link href="/account" className="account-secondary-link inline-flex">
          {t("accountPortal.checkout.cancel.accountCta")}
        </Link>
      </div>
    </section>
  );
}

export function CheckoutErrorPanel({ reason, retryHref = "/#pricing" }: { reason?: string } & CheckoutRetryProps) {
  const { t } = useI18n();
  const reasonLabel = localizedReason(t, reason);

  return (
    <section className="mx-auto max-w-2xl text-center">
      <span className="account-kicker">{t("accountPortal.checkout.error.kicker")}</span>
      <h1 className="account-title mt-5">{t("accountPortal.checkout.error.title")}</h1>
      <p className="mt-6 text-base leading-8 text-text-secondary">
        {t("accountPortal.checkout.error.description")}
      </p>
      <p className="account-inline-reason mx-auto mt-6 inline-flex">
        {t("accountPortal.checkout.error.reasonPrefix")} {reasonLabel}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={retryHref} className="account-primary-link inline-flex">
          {t("accountPortal.checkout.error.retryCta")}
        </Link>
        <Link href="/account/billing" className="account-secondary-link inline-flex">
          {t("accountPortal.checkout.error.accountCta")}
        </Link>
      </div>
    </section>
  );
}
