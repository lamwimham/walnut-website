"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function AuthSuccessPanel({ returnTo }: { returnTo: string }) {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-2xl text-center">
      <span className="account-kicker">{t("accountPortal.auth.success.kicker")}</span>
      <h1 className="account-title mt-5">{t("accountPortal.auth.success.title")}</h1>
      <p className="mt-6 text-base leading-8 text-text-secondary">
        {t("accountPortal.auth.success.description")}
      </p>
      <Link href={returnTo} className="account-primary-link mt-8 inline-flex">
        {t("accountPortal.auth.success.returnCta")}
      </Link>
    </section>
  );
}

export function AuthErrorPanel({ reason }: { reason?: string }) {
  const { t } = useI18n();
  const reasonKey = `accountPortal.auth.error.reasons.${reason || "unknown"}`;
  const reasonLabel = t(reasonKey);
  const safeReason = reasonLabel === reasonKey ? t("accountPortal.auth.error.unknownReason") : reasonLabel;

  return (
    <section className="mx-auto max-w-2xl text-center">
      <span className="account-kicker">{t("accountPortal.auth.error.kicker")}</span>
      <h1 className="account-title mt-5">{t("accountPortal.auth.error.title")}</h1>
      <p className="mt-6 text-base leading-8 text-text-secondary">
        {t("accountPortal.auth.error.reasonPrefix")} <span className="text-soul">{safeReason}</span>. {t("accountPortal.auth.error.noToken")}
      </p>
      <Link href="/login" className="account-secondary-link mt-8 inline-flex">
        {t("accountPortal.auth.error.tryAgain")}
      </Link>
    </section>
  );
}
