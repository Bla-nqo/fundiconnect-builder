import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Star, Briefcase, TrendingUp, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const mockStats = {
  totalEarnings: "KES 342,500",
  completedJobs: 48,
  averageRating: 4.8,
  responseTime: "2 hours",
};

const mockActiveJobs = [
  {
    id: 1,
    title: "Electrical Wiring - 3 Bedroom House",
    client: "Jane Kamau",
    location: "Nairobi, Westlands",
    payment: "KES 45,000",
    deadline: "5 days",
    progress: 60,
  },
  {
    id: 2,
    title: "Office Electrical Repair",
    client: "Tom Odhiambo",
    location: "Nairobi, CBD",
    payment: "KES 15,000",
    deadline: "2 days",
    progress: 85,
  },
];

const mockNewOpportunities = [
  {
    id: 1,
    title: "Home Rewiring Project",
    location: "Nairobi, Kilimani",
    budget: "KES 50,000 - 65,000",
    duration: "1 week",
    clientRating: 4.9,
  },
  {
    id: 2,
    title: "Shop Electrical Installation",
    location: "Nairobi, Ngong Road",
    budget: "KES 30,000 - 40,000",
    duration: "3 days",
    clientRating: 4.7,
  },
];

const FundiDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-heading font-bold text-primary">
              FundiConnect
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">Jobs</Button>
              <Button variant="ghost" size="sm">Portfolio</Button>
              <Button variant="ghost" size="sm">Wallet</Button>
              <Button variant="ghost" size="sm">Profile</Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-heading font-bold">Welcome back, John</h1>
            <Badge className="bg-success">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Top Rated
            </Badge>
          </div>
          <p className="text-muted-foreground">Your professional dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-primary text-primary-foreground hover:shadow-glow-primary transition-all duration-300">
            <DollarSign className="w-8 h-8 mb-3 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Total Earnings</p>
            <p className="text-2xl font-heading font-bold">{mockStats.totalEarnings}</p>
          </Card>

          <Card className="p-6 glass-card hover:shadow-glow-success transition-all duration-300">
            <Briefcase className="w-8 h-8 mb-3 text-success" />
            <p className="text-sm text-muted-foreground mb-1">Completed Jobs</p>
            <p className="text-2xl font-heading font-bold">{mockStats.completedJobs}</p>
          </Card>

          <Card className="p-6 glass-card hover:shadow-lg transition-all duration-300">
            <Star className="w-8 h-8 mb-3 text-yellow-500" />
            <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
            <p className="text-2xl font-heading font-bold">{mockStats.averageRating}</p>
          </Card>

          <Card className="p-6 glass-card hover:shadow-glow-accent transition-all duration-300">
            <Clock className="w-8 h-8 mb-3 text-accent" />
            <p className="text-sm text-muted-foreground mb-1">Response Time</p>
            <p className="text-2xl font-heading font-bold">{mockStats.responseTime}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Jobs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold">Active Jobs</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="space-y-4">
              {mockActiveJobs.map((job) => (
                <Card key={job.id} className="p-6 glass-card hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{job.title}</h3>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <span>Client: {job.client}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-accent border-accent">
                      {job.deadline} left
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{job.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-trust transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-heading font-bold text-lg">{job.payment}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="rounded-full">
                        Update Progress
                      </Button>
                      <Button size="sm" className="rounded-full">
                        Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* New Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold">New Opportunities</h2>
              <Badge className="bg-accent">
                <TrendingUp className="w-3 h-3 mr-1" />
                Matched for You
              </Badge>
            </div>

            <div className="space-y-4">
              {mockNewOpportunities.map((job) => (
                <Card key={job.id} className="p-6 glass-card hover:shadow-glow-primary transition-all duration-300 border-2 hover:border-primary/50">
                  <h3 className="font-heading font-bold text-lg mb-3">{job.title}</h3>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{job.budget}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{job.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Client Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{job.clientRating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 rounded-full">Apply Now</Button>
                    <Button variant="outline" className="flex-1 rounded-full">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}

              <Card className="p-6 bg-gradient-to-br from-secondary to-muted border-2 border-dashed">
                <p className="text-center text-muted-foreground">
                  More opportunities will appear based on your skills and availability
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundiDashboard;
