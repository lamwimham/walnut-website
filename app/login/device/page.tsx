import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import GoogleLoginPanel from "@/components/account/GoogleLoginPanel";
import { currentWebsiteSession } from "@/lib/account/session";
import { safeReturnUrl } from "@/lib/account/return-url-policy";
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

  if (!session) {
    return (
      <AccountShell>
        <GoogleLoginPanel returnTo={returnTo} deviceSession={sessionId} />
      </AccountShell>
    );
  }

  return (
    <AccountShell>
      <section className="grid w-full gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <span className="account-kicker">Device authorization</span>
          <h1 className="account-title mt-5">Authorize this Walnut desktop client.</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
            You are signed in on the web. Approving this request lets billing bind the waiting desktop device and issue its own signed access snapshot.
          </p>
        </div>
        <form action={authorizeDeviceLoginAction} className="account-card p-6 sm:p-8">
          <input type="hidden" name="sessionId" value={sessionId} />
          <input type="hidden" name="browserToken" value={browserToken} />
          <input type="hidden" name="provider" value={provider} />
          <input type="hidden" name="returnUrl" value={returnUrl} />
          <p className="text-xs uppercase tracking-[0.22em] text-signal">Waiting desktop session</p>
          <h2 className="mt-4 break-all font-display text-2xl">{sessionId || "Missing session"}</h2>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            Signed in as {session.email ?? session.userId}. Browser token stays on the website side; desktop receives only the final billing snapshot after consume.
          </p>
          <button className="primary-cta mt-7 w-full rounded-2xl px-5 py-4 text-sm font-semibold tracking-[0.14em]" type="submit" disabled={!sessionId || !browserToken}>
            Authorize Walnut
          </button>
        </form>
      </section>
    </AccountShell>
  );
}
