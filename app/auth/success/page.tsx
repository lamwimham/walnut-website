import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import { AuthSuccessPanel } from "@/components/account/AuthStatusPanels";
import { currentWebsiteSession } from "@/lib/account/session";
import { safeReturnUrl } from "@/lib/account/return-url-policy";

export const metadata: Metadata = {
  title: "Walnut Sign-in Complete",
  robots: { index: false, follow: false },
};

export default async function AuthSuccessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const rawReturn = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const returnTo = safeReturnUrl(rawReturn, "/account");
  const session = await currentWebsiteSession();

  return (
    <AccountShell session={session}>
      <AuthSuccessPanel returnTo={returnTo} />
    </AccountShell>
  );
}
