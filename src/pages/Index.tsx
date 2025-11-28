import { Hero } from "@/components/Hero";
import { SkillCategories } from "@/components/SkillCategories";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustSection } from "@/components/TrustSection";
import StatsCounter from "@/components/StatsCounter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <StatsCounter />
      <SkillCategories />
      <HowItWorks />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default Index;
