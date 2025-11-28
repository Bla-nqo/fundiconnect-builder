import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle, Users, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-fundi.jpg";
import { ThemeToggle } from "./ThemeToggle";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Professional Kenyan Fundi at Work"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-earth/95 via-earth/85 to-earth/60 dark:from-background/98 dark:via-background/95 dark:to-background/85" />
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-heading font-bold text-earth-foreground">FundiConnect</h2>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-earth-foreground hover:bg-earth-foreground/10">
              <Link to="/auth">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Trusted by 10,000+ Clients</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold text-earth-foreground mb-6 leading-tight">
            Digitize Dignity in Construction
          </h1>

          <p className="text-xl md:text-2xl text-earth-foreground/90 mb-8 leading-relaxed">
            Connect with verified fundis across Kenya. From electricians to masons,
            find trusted professionals for every construction need.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 rounded-full px-8 text-lg group"
            >
              <Link to="/get-started">
                Find a Fundi
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-earth-foreground/10 backdrop-blur-sm border-earth-foreground/30 text-earth-foreground hover:bg-earth-foreground/20 rounded-full px-8 text-lg"
            >
              <Link to="/fundi-signup">Join as Fundi</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl">
            <div className="text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <p className="text-2xl font-bold text-earth-foreground">98%</p>
              <p className="text-sm text-earth-foreground/70">Job Completion</p>
            </div>

            <div className="text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-earth-foreground">5,000+</p>
              <p className="text-sm text-earth-foreground/70">Verified Fundis</p>
            </div>

            <div className="text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl font-bold text-earth-foreground">100%</p>
              <p className="text-sm text-earth-foreground/70">Secure Payments</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
