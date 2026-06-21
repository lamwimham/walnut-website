import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import GoogleLoginPanel from "@/components/account/GoogleLoginPanel";

export const metadata: Metadata = {
  title: "Sign in to Walnut",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const returnTo = typeof params.returnTo === "string" ? params.returnTo : undefined;
  return (
    <AccountShell>
      <GoogleLoginPanel returnTo={returnTo} />
    </AccountShell>
  );
}
