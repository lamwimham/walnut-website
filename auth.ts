import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { externalLoginWithGoogle } from "@/lib/account/billing-client";

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

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
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as GoogleProfile;
        if (!googleProfile.sub || !googleProfile.email) {
          throw new Error("google_identity_incomplete");
        }
        const emailVerified = googleProfile.email_verified === true || googleProfile.email_verified === "true";
        if (!emailVerified) {
          throw new Error("google_email_unverified");
        }

        const summary = await externalLoginWithGoogle({
          provider: "google",
          subject: googleProfile.sub,
          email: googleProfile.email,
          emailVerified,
          displayName: googleProfile.name,
          avatarUrl: googleProfile.picture,
        });

        token.billingUserId = summary.user.id;
        token.name = summary.user.displayName ?? token.name;
        token.email = summary.user.email ?? token.email;
        token.planCode = summary.account.planCode;
        token.subscriptionStatus = summary.account.subscriptionStatus;
        token.deviceCount = summary.account.deviceCount;
        token.maxDevices = summary.account.maxDevices;
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
