import NeuralBackground from "@/components/effects/NeuralBackground";
import StickyHeader from "@/components/StickyHeader";
import HeroSection from "@/components/sections/HeroSection";
import PhilosophyPyramid from "@/components/sections/PhilosophyPyramid";
import ProblemSection from "@/components/sections/ProblemSection";
import FeatureRadar from "@/components/sections/FeatureRadar";
import DemoSection from "@/components/sections/DemoSection";
import TasteProfile from "@/components/sections/TasteProfile";
import PricingSection from "@/components/sections/PricingSection";
import CTASection from "@/components/sections/CTASection";

function Divider() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="hairline-divider" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-bg-deep">
      {/* Global effects */}
      <NeuralBackground />
      <div className="noise-overlay" />

      {/* Global navigation */}
      <StickyHeader />

      {/* Content */}
      <div className="relative z-10">
        <HeroSection />
        <Divider />

        <PhilosophyPyramid />

        <Divider />

        <ProblemSection />

        <Divider />

        <FeatureRadar />

        <Divider />

        <DemoSection />

        <Divider />

        <TasteProfile />

        <Divider />

        <PricingSection />

        <Divider />

        <CTASection />
      </div>
    </div>
  );
}
