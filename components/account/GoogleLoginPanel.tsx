import GoogleLoginPanelView from "./GoogleLoginPanelView";
import { accountRuntimeConfig, googleOAuthReady } from "@/lib/account/config";
import { safeReturnUrl } from "@/lib/account/return-url-policy";

export default function GoogleLoginPanel({ returnTo, deviceSession }: { returnTo?: string; deviceSession?: string }) {
  const config = accountRuntimeConfig();
  const ready = googleOAuthReady(config);
  const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ?? "";
  const fallback = deviceSession ? `/login/device?session=${encodeURIComponent(deviceSession)}` : "/account";
  const safeReturn = safeReturnUrl(returnTo, fallback);

  return (
    <GoogleLoginPanelView
      deviceSession={deviceSession}
      googleClientId={googleClientId}
      googleOneTapAllowedOrigins={config.googleOneTapAllowedOrigins}
      ready={ready}
      safeReturn={safeReturn}
    />
  );
}
