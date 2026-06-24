"use client";

import GoogleOneTap from "./GoogleOneTap";
import { signInWithGoogle } from "@/lib/account/auth-actions";
import { useI18n } from "@/lib/i18n/context";

const FLOW_STEPS = [
  ["01", "identity"],
  ["02", "billing"],
  ["03", "snapshot"],
] as const;

type GoogleLoginPanelViewProps = {
  deviceSession?: string;
  googleClientId: string;
  googleOneTapAllowedOrigins: string[];
  ready: boolean;
  safeReturn: string;
};

export default function GoogleLoginPanelView({
  deviceSession,
  googleClientId,
  googleOneTapAllowedOrigins,
  ready,
  safeReturn,
}: GoogleLoginPanelViewProps) {
  const { t } = useI18n();

  return (
    <section className="account-login w-full">
      <div className="account-login-intro">
        <span className="account-kicker">{t("accountPortal.login.kicker")}</span>
        <h1 className="account-title account-login-title mt-5">{t("accountPortal.login.title")}</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
          {t("accountPortal.login.description")}
        </p>
        <div className="account-login-flow" aria-label={t("accountPortal.login.flowAria")}>
          {FLOW_STEPS.map(([step, key]) => (
            <div key={step} className="account-login-step">
              <span>{step}</span>
              <strong>{t(`accountPortal.login.flow.${key}`)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="account-login-action">
        <GoogleOneTap clientId={googleClientId} returnTo={safeReturn} enabled={ready} allowedOrigins={googleOneTapAllowedOrigins} />
        <p className="account-section-label">{t("accountPortal.login.actionLabel")}</p>
        <h2>{t("accountPortal.login.actionTitle")}</h2>
        <p>{t("accountPortal.login.actionDescription")}</p>
        <form action={signInWithGoogle} className="mt-7">
          <input type="hidden" name="returnTo" value={safeReturn} />
          {deviceSession ? <input type="hidden" name="deviceSession" value={deviceSession} /> : null}
          <button className="account-google-button" type="submit" disabled={!ready}>
            {t("accountPortal.login.googleButton")}
          </button>
        </form>
        {!ready && (
          <p className="account-one-tap-note">{t("accountPortal.login.previewMode")}</p>
        )}
        <p className="account-login-footnote">{t("accountPortal.login.footnote")}</p>
      </div>
    </section>
  );
}
