import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import GoogleLoginPanel from "@/components/account/GoogleLoginPanel";
import { DeviceLoginAuthorizePanel, DeviceLoginRejectedPanel } from "@/components/account/DeviceLoginPanels";
import { currentWebsiteSession } from "@/lib/account/session";
import { safeReturnUrl } from "@/lib/account/return-url-policy";
import { openDeviceLoginSession } from "@/lib/account/billing-client";
import { authorizeDeviceLoginAction } from "./actions";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = {
  title: "Authorize Walnut Device",
  robots: { index: false, follow: false },
};

export default async function DeviceLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sessionId = first(params.session)?.trim() ?? "";
  const browserToken = first(params.token)?.trim() ?? "";
  const provider = first(params.provider)?.trim() || "google";
  const returnUrl = safeReturnUrl(first(params.returnUrl), "walnut://access/oauth/google/success");
  const session = await currentWebsiteSession();
  const returnTo = `/login/device?session=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(browserToken)}&provider=${encodeURIComponent(provider)}&returnUrl=${encodeURIComponent(returnUrl)}`;
  const deviceSession = sessionId && browserToken ? await openDeviceLoginSession({ sessionId, browserToken }) : null;

  if (deviceSession && !deviceSession.ok) {
    return (
      <AccountShell session={session}>
        <DeviceLoginRejectedPanel reason={deviceSession.reason} />
      </AccountShell>
    );
  }

  if (!session) {
    return (
      <AccountShell session={null}>
        <GoogleLoginPanel returnTo={returnTo} deviceSession={sessionId} />
      </AccountShell>
    );
  }

  return (
    <AccountShell session={session}>
      <DeviceLoginAuthorizePanel
        action={authorizeDeviceLoginAction}
        browserToken={browserToken}
        deviceSession={deviceSession?.session ?? null}
        provider={provider}
        returnUrl={returnUrl}
        sessionId={sessionId}
        userLabel={session.email ?? session.userId}
      />
    </AccountShell>
  );
}
