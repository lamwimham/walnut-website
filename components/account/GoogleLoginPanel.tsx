import { googleOAuthReady } from "@/lib/account/config";
import { safeReturnUrl } from "@/lib/account/return-url-policy";
import { signInWithGoogle } from "@/lib/account/auth-actions";

export default function GoogleLoginPanel({ returnTo, deviceSession }: { returnTo?: string; deviceSession?: string }) {
  const ready = googleOAuthReady();
  const fallback = deviceSession ? `/login/device?session=${encodeURIComponent(deviceSession)}` : "/account";
  const safeReturn = safeReturnUrl(returnTo, fallback);
  return (
    <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div className="max-w-2xl">
        <span className="account-kicker">Account Portal</span>
        <h1 className="account-title mt-5">Sign in to sync Walnut access across devices.</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
          Your browser account proves who you are. Billing decides what this device can use, then Walnut stores a signed access snapshot locally.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["01", "Google identity"],
            ["02", "Billing authorization"],
            ["03", "Local snapshot"],
          ].map(([step, label]) => (
            <div key={step} className="account-step-card">
              <span>{step}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="account-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-signal">Secure web login</p>
            <h2 className="mt-3 font-display text-3xl text-text-primary">Continue with Google</h2>
          </div>
          <div className="account-orb">G</div>
        </div>
        <p className="mt-5 text-sm leading-7 text-text-muted">
          Google tokens stay in the website server flow. The desktop app only receives Walnut&apos;s signed authorization after billing approves the device session.
        </p>
        <form action={signInWithGoogle} className="mt-7">
          <input type="hidden" name="returnTo" value={safeReturn} />
          {deviceSession ? <input type="hidden" name="deviceSession" value={deviceSession} /> : null}
          <button
            className="primary-cta flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-semibold tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-55"
            type="submit"
            disabled={!ready}
          >
            Continue with Google
          </button>
        </form>
        {!ready && (
          <p className="mt-4 rounded-2xl border border-soul/20 bg-soul/5 px-4 py-3 text-xs leading-6 text-soul">
            Preview mode: Google OAuth environment variables are not configured yet.
          </p>
        )}
        <div className="mt-6 border-t border-border-subtle pt-5 text-xs leading-6 text-text-muted">
          No provider token is stored in the desktop client. No billing state is decided in the browser UI.
        </div>
      </div>
    </section>
  );
}
