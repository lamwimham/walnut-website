"use client";

import type { DeviceLoginSessionView } from "@/lib/account/billing-client";
import { useI18n } from "@/lib/i18n/context";

type DeviceLoginAction = (formData: FormData) => Promise<void> | void;

type DeviceLoginAuthorizePanelProps = {
  action: DeviceLoginAction;
  browserToken: string;
  deviceSession?: DeviceLoginSessionView | null;
  provider: string;
  returnUrl: string;
  sessionId: string;
  userLabel: string;
};

function localizedDeviceStatus(t: (key: string) => string, status: string | undefined): string {
  const fallbackStatus = status || "opened";
  const key = `accountPortal.device.statuses.${fallbackStatus}`;
  const label = t(key);
  return label === key ? t("accountPortal.device.statuses.unknown") : label;
}

export function DeviceLoginRejectedPanel({ reason }: { reason?: string }) {
  const { t } = useI18n();
  const reasonKey = `accountPortal.device.reasons.${reason || "unknown"}`;
  const reasonLabel = t(reasonKey);
  const safeReason = reasonLabel === reasonKey ? t("accountPortal.device.unknownReason") : reasonLabel;

  return (
    <section className="account-linear w-full">
      <span className="account-kicker">{t("accountPortal.device.kicker")}</span>
      <h1 className="account-title account-title-settings mt-5">{t("accountPortal.device.rejectedTitle")}</h1>
      <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
        {t("accountPortal.device.rejectedDescription")}
      </p>
      <p className="account-inline-reason mt-8">{t("accountPortal.device.reason", { reason: safeReason })}</p>
    </section>
  );
}

export function DeviceLoginAuthorizePanel({
  action,
  browserToken,
  deviceSession,
  provider,
  returnUrl,
  sessionId,
  userLabel,
}: DeviceLoginAuthorizePanelProps) {
  const { t } = useI18n();
  const sessionLabel = deviceSession?.id || sessionId || t("accountPortal.device.missingSession");
  const statusLabel = localizedDeviceStatus(t, deviceSession?.status);

  return (
    <section className="account-login w-full">
      <div className="account-login-intro">
        <span className="account-kicker">{t("accountPortal.device.kicker")}</span>
        <h1 className="account-title account-login-title mt-5">{t("accountPortal.device.authorizeTitle")}</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
          {t("accountPortal.device.authorizeDescription")}
        </p>
      </div>
      <form action={action} className="account-login-action">
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="browserToken" value={browserToken} />
        <input type="hidden" name="provider" value={provider} />
        <input type="hidden" name="returnUrl" value={returnUrl} />
        <p className="account-section-label">{t("accountPortal.device.waitingLabel")}</p>
        <h2 className="account-device-session-id">{sessionLabel}</h2>
        <p>
          {t("accountPortal.device.signedInStatus", { user: userLabel, status: statusLabel })}
        </p>
        <button className="account-google-button mt-7" type="submit" disabled={!sessionId || !browserToken}>
          {t("accountPortal.device.authorizeButton")}
        </button>
      </form>
    </section>
  );
}
