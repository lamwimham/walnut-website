import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import { CheckoutSuccessPanel } from "@/components/account/CheckoutStatusPanels";
import { currentWebsiteSession } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Walnut Payment Complete",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage() {
  const session = await currentWebsiteSession();

  return (
    <AccountShell session={session}>
      <CheckoutSuccessPanel />
    </AccountShell>
  );
}
