import { Hero } from "@/components/Hero";
import { SkillCategories } from "@/components/SkillCategories";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustSection } from "@/components/TrustSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <SkillCategories />
      <HowItWorks />
      <TrustSection />
    </div>
  );
};

export default Index;
