import type { Metadata } from "next";
import Link from "next/link";
import AccountShell from "@/components/account/AccountShell";

export const metadata: Metadata = {
  title: "Walnut Sign-in Error",
  robots: { index: false, follow: false },
};

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;

  return (
    <AccountShell>
      <section className="mx-auto max-w-2xl text-center">
        <span className="account-kicker">Authorization paused</span>
        <h1 className="account-title mt-5">Walnut could not finish sign-in.</h1>
        <p className="mt-6 text-base leading-8 text-text-secondary">
          Reason: <span className="text-soul">{reason || "unknown"}</span>. No provider token or authorization code is shown on this page.
        </p>
        <Link href="/login" className="secondary-cta mt-8 inline-flex rounded-2xl px-6 py-4 text-sm font-semibold">
          Try again
        </Link>
      </section>
    </AccountShell>
  );
}
