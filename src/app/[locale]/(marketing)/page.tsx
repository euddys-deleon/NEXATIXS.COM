import { Hero } from "@/components/home/Hero";
import { MetricsRow } from "@/components/home/MetricsRow";
import { StatusBar } from "@/components/home/StatusBar";
import { ValuesGrid } from "@/components/home/ValuesGrid";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { CoverageMap } from "@/components/home/CoverageMap";
import { PartnersMarquee } from "@/components/home/PartnersMarquee";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { MayfrenSection } from "@/components/home/MayfrenSection";
import { CtaFinal } from "@/components/home/CtaFinal";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <MetricsRow />
      <StatusBar />
      <ValuesGrid />
      <ServicesPreview />
      <CoverageMap />
      <PartnersMarquee />
      <ProjectsPreview />
      <MayfrenSection />
      <CtaFinal />
    </main>
  );
}
