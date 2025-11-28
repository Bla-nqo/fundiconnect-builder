import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Clock, CheckCircle, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const mockJobs = [
  {
    id: 1,
    title: "Electrical Wiring - 3 Bedroom House",
    status: "in-progress",
    fundi: "John Mwangi",
    fundiRating: 4.8,
    location: "Nairobi, Westlands",
    budget: "KES 45,000",
    progress: 60,
  },
  {
    id: 2,
    title: "Kitchen Plumbing Installation",
    status: "pending",
    fundi: null,
    location: "Nairobi, Kilimani",
    budget: "KES 25,000",
    progress: 0,
  },
];

const mockFundis = [
  {
    id: 1,
    name: "John Mwangi",
    skill: "Electrician",
    rating: 4.8,
    completedJobs: 127,
    hourlyRate: "KES 800/hr",
    verified: true,
  },
  {
    id: 2,
    name: "Sarah Wanjiku",
    skill: "Plumber",
    rating: 4.9,
    completedJobs: 93,
    hourlyRate: "KES 750/hr",
    verified: true,
  },
  {
    id: 3,
    name: "David Omondi",
    skill: "Mason",
    rating: 4.7,
    completedJobs: 156,
    hourlyRate: "KES 900/hr",
    verified: true,
  },
];

const ClientDashboard = () => {
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
              <Button variant="ghost" size="sm">My Jobs</Button>
              <Button variant="ghost" size="sm">Messages</Button>
              <Button variant="ghost" size="sm">Profile</Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, Client</h1>
          <p className="text-muted-foreground">Manage your projects and find trusted fundis</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-primary text-primary-foreground cursor-pointer hover:shadow-glow-primary transition-all duration-300 hover:-translate-y-1">
            <Plus className="w-8 h-8 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-1">Post New Job</h3>
            <p className="text-sm opacity-90">Find the perfect fundi for your project</p>
          </Card>

          <Card className="p-6 glass-card hover:shadow-glow-primary transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <Search className="w-8 h-8 mb-3 text-primary" />
            <h3 className="font-heading font-bold text-lg mb-1">Browse Fundis</h3>
            <p className="text-sm text-muted-foreground">Explore verified professionals</p>
          </Card>

          <Card className="p-6 glass-card hover:shadow-glow-accent transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <Clock className="w-8 h-8 mb-3 text-accent" />
            <h3 className="font-heading font-bold text-lg mb-1">Track Jobs</h3>
            <p className="text-sm text-muted-foreground">Monitor active projects</p>
          </Card>
        </div>

        {/* Active Jobs */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold mb-4">Your Jobs</h2>
            <div className="space-y-4">
            {mockJobs.map((job) => (
              <Card key={job.id} className="p-6 glass-card hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="font-medium text-foreground">{job.budget}</span>
                    </div>
                  </div>
                  <Badge
                    variant={job.status === "in-progress" ? "default" : "secondary"}
                    className={job.status === "in-progress" ? "bg-success" : ""}
                  >
                    {job.status === "in-progress" ? "In Progress" : "Pending"}
                  </Badge>
                </div>

                {job.fundi && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{job.fundi[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{job.fundi}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{job.fundiRating}</span>
                      </div>
                    </div>
                  </div>
                )}

                {job.status === "in-progress" && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{job.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="rounded-full">View Details</Button>
                  <Button size="sm" variant="outline" className="rounded-full">Message Fundi</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommended Fundis */}
        <div>
          <h2 className="text-2xl font-heading font-bold mb-4">Recommended Fundis</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {mockFundis.map((fundi) => (
              <Card key={fundi.id} className="p-6 glass-card hover:shadow-glow-success transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {fundi.name[0]}
                  </div>
                  {fundi.verified && (
                    <Badge className="bg-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <h3 className="font-heading font-bold text-lg mb-1">{fundi.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{fundi.skill}</p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{fundi.rating}</span>
                    <span className="text-muted-foreground">({fundi.completedJobs} jobs)</span>
                  </div>
                  <p className="font-medium">{fundi.hourlyRate}</p>
                </div>

                <Button className="w-full rounded-full" size="sm">
                  View Profile
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
