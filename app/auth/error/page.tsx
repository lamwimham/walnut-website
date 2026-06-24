import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import { AuthErrorPanel } from "@/components/account/AuthStatusPanels";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Walnut Sign-in Error",
  robots: { index: false, follow: false },
};

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  const session = await currentWebsiteSession();

  return (
    <AccountShell session={session}>
      <AuthErrorPanel reason={reason} />
    </AccountShell>
  );
}
