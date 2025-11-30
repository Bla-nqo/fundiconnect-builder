import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Star, Briefcase, Clock, MapPin, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MessagingPanel } from "@/components/MessagingPanel";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  client_id: string;
  profiles: {
    full_name: string;
  };
}

const FundiDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    averageRating: 0,
  });
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [newOpportunities, setNewOpportunities] = useState<Job[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    checkAuth();
    fetchStats();
    fetchJobs();

    const jobsChannel = supabase
      .channel("fundi-jobs")
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, () => fetchJobs())
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: completedJobs } = await supabase
      .from("jobs")
      .select("budget")
      .eq("fundi_id", user.id)
      .eq("status", "completed");

    const { data: ratings } = await supabase
      .from("ratings")
      .select("rating")
      .eq("fundi_id", user.id);

    const totalEarnings = completedJobs?.reduce((sum, job) => sum + (job.budget || 0), 0) || 0;
    const averageRating = ratings?.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    setStats({
      totalEarnings,
      completedJobs: completedJobs?.length || 0,
      averageRating,
    });
  };

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: active } = await supabase
      .from("jobs")
      .select("*")
      .eq("fundi_id", user.id)
      .in("status", ["in-progress", "accepted"])
      .order("created_at", { ascending: false });

    const { data: opportunities } = await supabase
      .from("jobs")
      .select("*")
      .is("fundi_id", null)
      .eq("status", "open")
      .limit(10);

    // Fetch client profiles for active jobs
    const activeWithProfiles = await Promise.all(
      (active || []).map(async (job) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", job.client_id)
          .single();
        return { ...job, profiles: profile || { full_name: "Unknown" } };
      })
    );

    // Fetch client profiles for opportunities
    const opportunitiesWithProfiles = await Promise.all(
      (opportunities || []).map(async (job) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", job.client_id)
          .single();
        return { ...job, profiles: profile || { full_name: "Unknown" } };
      })
    );

    setActiveJobs(activeWithProfiles);
    setNewOpportunities(opportunitiesWithProfiles);
  };

  const calculateProgress = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const applyToJob = async (jobId: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ fundi_id: user.id, status: "accepted" })
      .eq("id", jobId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Application submitted successfully" });
      fetchJobs();
    }
  };

  if (selectedChat) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <MessagingPanel
          currentUserId={user?.id}
          recipientId={selectedChat.id}
          recipientName={selectedChat.name}
          onClose={() => setSelectedChat(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-heading font-bold text-primary">
              FundiConnect
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-heading font-bold">Welcome back!</h1>
            {stats.averageRating >= 4.5 && (
              <Badge className="bg-success">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Top Rated
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Your professional dashboard</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-primary text-primary-foreground hover:shadow-glow-primary transition-all duration-300">
            <DollarSign className="w-8 h-8 mb-3 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Total Earnings</p>
            <p className="text-2xl font-heading font-bold">KES {stats.totalEarnings.toLocaleString()}</p>
          </Card>

          <Card className="p-6 glass-card hover:shadow-glow-success transition-all duration-300">
            <Briefcase className="w-8 h-8 mb-3 text-success" />
            <p className="text-sm text-muted-foreground mb-1">Completed Jobs</p>
            <p className="text-2xl font-heading font-bold">{stats.completedJobs}</p>
          </Card>

          <Card className="p-6 glass-card hover:shadow-lg transition-all duration-300">
            <Star className="w-8 h-8 mb-3 text-yellow-500" />
            <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
            <p className="text-2xl font-heading font-bold">{stats.averageRating.toFixed(1)}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-4">Active Jobs</h2>
            {activeJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No active jobs</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="p-6 glass-card hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-lg mb-2">{job.title}</h3>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <span>Client: {job.profiles.full_name}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {job.start_date && job.end_date && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{calculateProgress(job.start_date, job.end_date)}%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-trust transition-all duration-300"
                            style={{ width: `${calculateProgress(job.start_date, job.end_date)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="font-heading font-bold text-lg">KES {job.budget?.toLocaleString()}</p>
                      <Button
                        size="sm"
                        onClick={() => setSelectedChat({ id: job.client_id, name: job.profiles.full_name })}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold mb-4">New Opportunities</h2>
            {newOpportunities.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No new opportunities available</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {newOpportunities.map((job) => (
                  <Card key={job.id} className="p-6 glass-card hover:shadow-glow-primary transition-all duration-300 border-2 hover:border-primary/50">
                    <h3 className="font-heading font-bold text-lg mb-3">{job.title}</h3>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">KES {job.budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Client:</span>
                        <span className="font-medium">{job.profiles.full_name}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 rounded-full" onClick={() => applyToJob(job.id)}>
                        Apply Now
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundiDashboard;