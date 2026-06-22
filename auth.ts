import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { externalLoginWithGoogle, type AccountSummary, type GoogleIdentityPrincipal } from "@/lib/account/billing-client";
import { verifyGoogleOneTapCredential } from "@/lib/account/google-one-tap";

type AccountSessionUser = {
  id: string;
  name?: string;
  email?: string;
  planCode?: string;
  subscriptionStatus?: string;
  deviceCount?: number;
  maxDevices?: number;
};

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

function accountUserFromSummary(summary: AccountSummary): AccountSessionUser {
  return {
    id: summary.user.id,
    name: summary.user.displayName,
    email: summary.user.email,
    planCode: summary.account.planCode,
    subscriptionStatus: summary.account.subscriptionStatus,
    deviceCount: summary.account.deviceCount,
    maxDevices: summary.account.maxDevices,
  };
}

async function accountUserFromGooglePrincipal(principal: GoogleIdentityPrincipal): Promise<AccountSessionUser> {
  return accountUserFromSummary(await externalLoginWithGoogle(principal));
}

function applyAccountUserClaims(token: JWT, user: AccountSessionUser) {
  token.billingUserId = user.id;
  token.name = user.name ?? token.name;
  token.email = user.email ?? token.email;
  token.planCode = user.planCode;
  token.subscriptionStatus = user.subscriptionStatus;
  token.deviceCount = user.deviceCount;
  token.maxDevices = user.maxDevices;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SESSION_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          scope: "openid email profile",
          response_type: "code",
        },
      },
    }),
    Credentials({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { label: "Google credential", type: "text" },
      },
      async authorize(credentials) {
        const credential = typeof credentials?.credential === "string" ? credentials.credential : "";
        const principal = await verifyGoogleOneTapCredential(credential);
        return accountUserFromGooglePrincipal(principal);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as GoogleProfile;
        if (!googleProfile.sub || !googleProfile.email) {
          throw new Error("google_identity_incomplete");
        }
        const emailVerified = googleProfile.email_verified === true || googleProfile.email_verified === "true";
        if (!emailVerified) {
          throw new Error("google_email_unverified");
        }

        applyAccountUserClaims(token, await accountUserFromGooglePrincipal({
          provider: "google",
          subject: googleProfile.sub,
          email: googleProfile.email,
          emailVerified,
          displayName: googleProfile.name,
          avatarUrl: googleProfile.picture,
        }));
      }

      if (account?.provider === "google-one-tap" && user) {
        applyAccountUserClaims(token, user as AccountSessionUser);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.billingUserId === "string" ? token.billingUserId : "";
        session.user.planCode = typeof token.planCode === "string" ? token.planCode : undefined;
        session.user.subscriptionStatus = typeof token.subscriptionStatus === "string" ? token.subscriptionStatus : undefined;
        session.user.deviceCount = typeof token.deviceCount === "number" ? token.deviceCount : undefined;
        session.user.maxDevices = typeof token.maxDevices === "number" ? token.maxDevices : undefined;
      }
      return session;
    },
  },
});
