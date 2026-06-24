import RegionAvailabilityNotice from "@/components/RegionAvailabilityNotice";
import WalnutLandingPage from "@/components/landing/WalnutLandingPage";

// Marketing pages stay static; account/session checks belong to /login and /account.
export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <RegionAvailabilityNotice />
      <WalnutLandingPage />
    </>
  );
}
