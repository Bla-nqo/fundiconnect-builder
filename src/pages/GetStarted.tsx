import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Welcome to FundiConnect
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose how you'd like to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group animate-slide-up">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-3">I'm a Client</h2>
              <p className="text-muted-foreground mb-6">
                Find and hire verified fundis for your construction projects
              </p>
              <ul className="text-sm text-left space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Post jobs and get matched with fundis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Track work progress with daily updates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Secure escrow payments
                </li>
              </ul>
              <Button asChild className="w-full rounded-full" size="lg">
                <Link to="/client-dashboard">
                  Continue as Client
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/50 cursor-pointer group animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-3">I'm a Fundi</h2>
              <p className="text-muted-foreground mb-6">
                Join our network and grow your construction business
              </p>
              <ul className="text-sm text-left space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Get matched with quality job opportunities
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Build your portfolio and reputation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Guaranteed payment for completed work
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" size="lg">
                <Link to="/fundi-dashboard">
                  Continue as Fundi
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
