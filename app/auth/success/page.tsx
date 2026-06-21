import type { Metadata } from "next";
import Link from "next/link";
import AccountShell from "@/components/account/AccountShell";
import { safeReturnUrl } from "@/lib/account/return-url-policy";

export const metadata: Metadata = {
  title: "Walnut Sign-in Complete",
  robots: { index: false, follow: false },
};

export default async function AuthSuccessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const rawReturn = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const returnTo = safeReturnUrl(rawReturn, "/account");

  return (
    <AccountShell>
      <section className="mx-auto max-w-2xl text-center">
        <span className="account-kicker">Authorization complete</span>
        <h1 className="account-title mt-5">You can return to Walnut now.</h1>
        <p className="mt-6 text-base leading-8 text-text-secondary">
          The browser step is complete. If this was a desktop login, Walnut will finish by polling billing and consuming the authorized device session.
        </p>
        <Link href={returnTo} className="primary-cta mt-8 inline-flex rounded-2xl px-6 py-4 text-sm font-semibold tracking-[0.14em]">
          Return to Walnut
        </Link>
      </section>
    </AccountShell>
  );
}
