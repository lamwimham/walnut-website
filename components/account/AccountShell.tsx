import Link from "next/link";
import BrainLogo from "@/components/effects/BrainLogo";

export default function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="account-shell min-h-screen overflow-hidden bg-bg-deep text-text-primary">
      <div className="noise-overlay" />
      <div className="account-aurora" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <BrainLogo className="h-7 w-7 opacity-80 transition-opacity group-hover:opacity-100" />
            <span className="text-sm font-medium uppercase tracking-[0.24em] text-neural-soft">Walnut</span>
          </Link>
          <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-muted">
            <Link className="account-nav-link" href="/login">Login</Link>
            <Link className="account-nav-link" href="/account">Account</Link>
          </nav>
        </header>
        <div className="flex flex-1 items-center py-16">{children}</div>
      </div>
    </main>
  );
}
