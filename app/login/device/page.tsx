import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import GoogleLoginPanel from "@/components/account/GoogleLoginPanel";
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
      <AccountShell>
        <section className="account-linear w-full">
          <span className="account-kicker">Device authorization</span>
          <h1 className="account-title account-title-settings mt-5">This device login request cannot be opened.</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
            Billing rejected this browser token or the session has expired. Please start Google sign-in again from the Walnut desktop app.
          </p>
          <p className="account-inline-reason mt-8">Reason: {deviceSession.reason ?? "unknown"}</p>
        </section>
      </AccountShell>
    );
  }

  if (!session) {
    return (
      <AccountShell>
        <GoogleLoginPanel returnTo={returnTo} deviceSession={sessionId} />
      </AccountShell>
    );
  }

  return (
    <AccountShell>
      <section className="account-login w-full">
        <div className="account-login-intro">
          <span className="account-kicker">Device authorization</span>
          <h1 className="account-title account-login-title mt-5">Authorize this Walnut desktop client.</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
            You are signed in on the web. Approving this request lets billing bind the waiting desktop device and issue its own signed access snapshot.
          </p>
        </div>
        <form action={authorizeDeviceLoginAction} className="account-login-action">
          <input type="hidden" name="sessionId" value={sessionId} />
          <input type="hidden" name="browserToken" value={browserToken} />
          <input type="hidden" name="provider" value={provider} />
          <input type="hidden" name="returnUrl" value={returnUrl} />
          <p className="account-section-label">Waiting desktop session</p>
          <h2 className="account-device-session-id">{deviceSession?.session?.id || sessionId || "Missing session"}</h2>
          <p>
            Signed in as {session.email ?? session.userId}. Status: {deviceSession?.session?.status ?? "opened"}. Browser token stays on the website side; desktop receives only the final billing snapshot after consume.
          </p>
          <button className="account-google-button mt-7" type="submit" disabled={!sessionId || !browserToken}>
            Authorize Walnut
          </button>
        </form>
      </section>
    </AccountShell>
  );
}
