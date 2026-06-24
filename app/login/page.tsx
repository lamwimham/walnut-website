import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountShell from "@/components/account/AccountShell";
import GoogleLoginPanel from "@/components/account/GoogleLoginPanel";
import { currentWebsiteSession } from "@/lib/account/session";
import { postAuthReturnUrl } from "@/lib/account/return-url-policy";

export const metadata: Metadata = {
  title: "Sign in to Walnut",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const returnTo = typeof params.returnTo === "string" ? params.returnTo : undefined;
  const postLoginTarget = postAuthReturnUrl(returnTo, "/account");
  const session = await currentWebsiteSession();

  if (session) {
    redirect(postLoginTarget);
  }

  return (
    <AccountShell session={null}>
      <GoogleLoginPanel returnTo={postLoginTarget} />
    </AccountShell>
  );
}
