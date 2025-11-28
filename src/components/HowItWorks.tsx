import { Card } from "@/components/ui/card";
import { Search, UserCheck, Briefcase, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Post Your Job",
    description: "Describe what you need and we'll match you with verified fundis",
    color: "text-primary",
  },
  {
    icon: UserCheck,
    title: "Choose a Fundi",
    description: "Review profiles, ratings, and portfolios to find the perfect match",
    color: "text-accent",
  },
  {
    icon: Briefcase,
    title: "Track Progress",
    description: "Monitor daily updates, photos, and communicate directly",
    color: "text-success",
  },
  {
    icon: Star,
    title: "Rate & Pay",
    description: "Approve work and payments are released securely from escrow",
    color: "text-accent",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to get your construction project done right
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                <Card className="p-6 text-center h-full hover:shadow-lg transition-shadow bg-card">
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 ${step.color}`}>
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border -translate-y-1/2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
