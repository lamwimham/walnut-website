"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { signOutFromAccount } from "@/lib/account/auth-actions";
import type { WebsiteSession } from "@/lib/account/session";
import { useI18n } from "@/lib/i18n/context";

type AccountShellProps = {
  children: ReactNode;
  session?: WebsiteSession | null;
};

function AccountLocaleToggle({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  return (
    <div className="account-locale-toggle" aria-label="Language">
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          className="account-locale-button"
          data-active={locale === item}
          onClick={() => setLocale(item)}
          aria-pressed={locale === item}
        >
          {LOCALE_LABELS[item]}
        </button>
      ))}
    </div>
  );
}

export default function AccountShell({ children, session = null }: AccountShellProps) {
  const { locale, setLocale, t } = useI18n();
  const isSignedIn = Boolean(session);

  return (
    <main className="account-shell min-h-screen overflow-hidden">
      <div className="account-paper-grid" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-4 sm:px-6 sm:py-5">
        <header className="account-shell-header">
          <Link href="/" className="account-shell-brand">
            <Image src="/logo.svg" width={30} height={30} alt={t("accountPortal.shell.logoLabel")} priority />
            <span>{t("brand.name")}</span>
          </Link>
          <nav className="account-shell-nav" aria-label="Account navigation">
            {isSignedIn ? (
              <>
                <Link className="account-nav-link" href="/account">{t("accountPortal.shell.account")}</Link>
                <form action={signOutFromAccount}>
                  <button className="account-nav-link" type="submit">{t("accountPortal.shell.signOut")}</button>
                </form>
              </>
            ) : (
              <Link className="account-nav-link" href="/login">{t("accountPortal.shell.login")}</Link>
            )}
            <AccountLocaleToggle locale={locale} setLocale={setLocale} />
          </nav>
        </header>
        <div className="flex flex-1 items-center py-14 sm:py-16">{children}</div>
      </div>
    </main>
  );
}
