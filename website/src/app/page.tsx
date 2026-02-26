import { Hero } from "@/components/Hero";
import { Integrations } from "@/components/Integrations";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingPreview } from "@/components/PricingPreview";
import { DownloadCTA } from "@/components/DownloadCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Integrations />
      <Features />
      <HowItWorks />
      <PricingPreview />
      <DownloadCTA />
    </>
  );
}
