import GoogleOneTap from "./GoogleOneTap";
import { accountRuntimeConfig, googleOAuthReady } from "@/lib/account/config";
import { safeReturnUrl } from "@/lib/account/return-url-policy";
import { signInWithGoogle } from "@/lib/account/auth-actions";

export default function GoogleLoginPanel({ returnTo, deviceSession }: { returnTo?: string; deviceSession?: string }) {
  const config = accountRuntimeConfig();
  const ready = googleOAuthReady(config);
  const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ?? "";
  const fallback = deviceSession ? `/login/device?session=${encodeURIComponent(deviceSession)}` : "/account";
  const safeReturn = safeReturnUrl(returnTo, fallback);

  return (
    <section className="account-login w-full">
      <div className="account-login-intro">
        <span className="account-kicker">Account Portal</span>
        <h1 className="account-title account-login-title mt-5">Sign in to sync Walnut access.</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary">
          Website verifies your browser identity. Billing decides the subscription and device authorization. Walnut desktop receives only a signed access snapshot.
        </p>
        <div className="account-login-flow" aria-label="Login flow">
          {[
            ["01", "Google identity"],
            ["02", "Billing authorization"],
            ["03", "Local snapshot"],
          ].map(([step, label]) => (
            <div key={step} className="account-login-step">
              <span>{step}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="account-login-action">
        <GoogleOneTap clientId={googleClientId} returnTo={safeReturn} enabled={ready} allowedOrigins={config.googleOneTapAllowedOrigins} />
        <p className="account-section-label">Secure web login</p>
        <h2>Continue with Google</h2>
        <p>One Tap may appear automatically. If it does not, use the button below to start the same secure server-side OAuth flow.</p>
        <form action={signInWithGoogle} className="mt-7">
          <input type="hidden" name="returnTo" value={safeReturn} />
          {deviceSession ? <input type="hidden" name="deviceSession" value={deviceSession} /> : null}
          <button className="account-google-button" type="submit" disabled={!ready}>
            Continue with Google
          </button>
        </form>
        {!ready && (
          <p className="account-one-tap-note">Preview mode: Google OAuth environment variables are not configured yet.</p>
        )}
        <p className="account-login-footnote">Google provider tokens stay on the website server path and are not stored in Walnut desktop.</p>
      </div>
    </section>
  );
}
