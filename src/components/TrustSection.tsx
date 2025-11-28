import { Card } from "@/components/ui/card";
import { Shield, Lock, Award, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ID Verification",
    description: "Every fundi is verified with government-issued ID before joining",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Lock,
    title: "Secure Escrow",
    description: "Payments held safely until you approve the completed work",
    gradient: "from-success/20 to-success/5",
  },
  {
    icon: Award,
    title: "Trust Scores",
    description: "Track record of quality, punctuality, and professionalism",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: MessageSquare,
    title: "Direct Chat",
    description: "Communicate seamlessly with photos, videos, and updates",
    gradient: "from-primary/20 to-primary/5",
  },
];

export const TrustSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Built on Trust</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Your Safety is Our Priority
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We've built multiple layers of protection to ensure quality work and secure transactions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className={`p-8 bg-gradient-to-br ${feature.gradient} border-2 hover:shadow-xl transition-all duration-300 animate-scale-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
