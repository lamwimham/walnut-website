import { OAuth2Client } from "google-auth-library";
import type { GoogleIdentityPrincipal } from "./billing-client";

const oauthClient = new OAuth2Client();

export class GoogleOneTapVerificationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "GoogleOneTapVerificationError";
  }
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asVerifiedBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

export async function verifyGoogleOneTapCredential(
  credential: string,
  clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ?? "",
): Promise<GoogleIdentityPrincipal> {
  const idToken = credential.trim();
  if (!idToken) throw new GoogleOneTapVerificationError("google_one_tap_credential_missing");
  if (!clientId) throw new GoogleOneTapVerificationError("google_oauth_client_id_missing");

  const ticket = await oauthClient.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new GoogleOneTapVerificationError("google_one_tap_payload_missing");

  const subject = asTrimmedString(payload.sub);
  const email = asTrimmedString(payload.email);
  const emailVerified = asVerifiedBoolean(payload.email_verified);

  if (!subject || !email) throw new GoogleOneTapVerificationError("google_identity_incomplete");
  if (!emailVerified) throw new GoogleOneTapVerificationError("google_email_unverified");

  return {
    provider: "google",
    subject,
    email,
    emailVerified,
    displayName: asTrimmedString(payload.name) || undefined,
    avatarUrl: asTrimmedString(payload.picture) || undefined,
  };
}
