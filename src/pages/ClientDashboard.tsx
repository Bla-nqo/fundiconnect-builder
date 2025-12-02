import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Clock, Star, MapPin, MessageSquare, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { MessagingPanel } from "@/components/MessagingPanel";
import { RatingDialog } from "@/components/RatingDialog";
import { NotificationBell } from "@/components/NotificationBell";
import { AppealForm } from "@/components/AppealForm";
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
  fundi_id: string | null;
  fundi_profiles?: {
    profiles: { full_name: string };
  };
}

interface Fundi {
  id: string;
  user_id: string;
  skills: string[];
  hourly_rate: number;
  experience_years: number;
  profiles: {
    full_name: string;
  };
  avg_rating?: number;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [fundis, setFundis] = useState<Fundi[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string } | null>(null);
  const [selectedRating, setSelectedRating] = useState<{ jobId: string; fundiId: string; fundiName: string } | null>(null);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restriction, setRestriction] = useState<any>(null);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    location: "",
    budget: "",
    skills: "",
  });

  useEffect(() => {
    checkAuth();
    fetchJobs();
    fetchFundis();
    checkRestrictions();

    const jobsChannel = supabase
      .channel("client-jobs")
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

  const checkRestrictions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_restrictions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      setIsRestricted(true);
      setRestriction(data);
      
      const { data: appealsData } = await supabase
        .from("restriction_appeals")
        .select("*")
        .eq("restriction_id", data.id)
        .order("created_at", { ascending: false });
      
      setAppeals(appealsData || []);
    }
  };

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    if (jobsData) {
      const jobsWithDetails = await Promise.all(
        jobsData.map(async (job) => {
          if (job.fundi_id) {
            const { data: fundiProfile } = await supabase
              .from("fundi_profiles")
              .select("*")
              .eq("user_id", job.fundi_id)
              .single();

            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", job.fundi_id)
              .single();

            return {
              ...job,
              fundi_profiles: fundiProfile ? {
                ...fundiProfile,
                profiles: profile || { full_name: "Unknown" }
              } : null
            };
          }
          return { ...job, fundi_profiles: null };
        })
      );
      setJobs(jobsWithDetails);
    }
  };

  const fetchFundis = async () => {
    const { data: fundisData } = await supabase
      .from("fundi_profiles")
      .select("*")
      .eq("admin_approved", true)
      .eq("mobile_verified", true)
      .limit(6);

    if (fundisData) {
      const fundisWithDetails = await Promise.all(
        fundisData.map(async (fundi) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", fundi.user_id)
            .single();

          const { data: ratings } = await supabase
            .from("ratings")
            .select("rating")
            .eq("fundi_id", fundi.user_id);

          const avg_rating = ratings?.length
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

          return { 
            ...fundi, 
            profiles: profile || { full_name: "Unknown" },
            avg_rating 
          };
        })
      );
      setFundis(fundisWithDetails);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("jobs").insert({
      title: jobForm.title,
      description: jobForm.description,
      location: jobForm.location,
      budget: parseFloat(jobForm.budget),
      client_id: user.id,
      required_skills: jobForm.skills.split(",").map(s => s.trim()),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Job posted successfully" });
      setShowJobDialog(false);
      setJobForm({ title: "", description: "", location: "", budget: "", skills: "" });
      fetchJobs();
    }
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

  if (isRestricted && restriction) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-heading font-bold text-primary">
                FundiConnect
              </Link>
              <div className="flex items-center gap-4">
                <NotificationBell />
                <ThemeToggle />
                <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Logout</Button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <h1 className="text-3xl font-heading font-bold">Account Status</h1>
          </div>
          
          <AppealForm
            restrictionId={restriction.id}
            restrictionReason={restriction.reason}
            existingAppeals={appeals}
            onAppealSubmitted={checkRestrictions}
          />
        </div>
      </div>
    );
  }

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
              <NotificationBell />
              <ThemeToggle />
              <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Manage your projects and find trusted fundis</p>
        </div>

        <div className="mb-8">
          <RoleSwitcher userId={user?.id} currentRole="client" onRoleChange={() => {}} />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
            <DialogTrigger asChild>
              <Card className="p-6 bg-gradient-primary text-primary-foreground cursor-pointer hover:shadow-glow-primary transition-all duration-300 hover:-translate-y-1">
                <Plus className="w-8 h-8 mb-3" />
                <h3 className="font-heading font-bold text-lg mb-1">Post New Job</h3>
                <p className="text-sm opacity-90">Find the perfect fundi for your project</p>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Budget (KES)</Label>
                  <Input type="number" value={jobForm.budget} onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <Select
                    value={jobForm.skills.split(",")[0] || ""}
                    onValueChange={(value) => {
                      const currentSkills = jobForm.skills ? jobForm.skills.split(",").map(s => s.trim()) : [];
                      if (!currentSkills.includes(value)) {
                        setJobForm({ ...jobForm, skills: [...currentSkills, value].join(", ") });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select required skills" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Plumbing",
                        "Electrical",
                        "Carpentry",
                        "Painting",
                        "Masonry",
                        "Roofing",
                        "Welding",
                        "Tiling",
                        "HVAC",
                        "Landscaping",
                      ].map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {jobForm.skills && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobForm.skills.split(",").map((skill) => (
                        <Badge
                          key={skill.trim()}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            const skills = jobForm.skills.split(",").map(s => s.trim()).filter(s => s !== skill.trim());
                            setJobForm({ ...jobForm, skills: skills.join(", ") });
                          }}
                        >
                          {skill.trim()} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full">Post Job</Button>
              </form>
            </DialogContent>
          </Dialog>

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

        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold mb-4">Your Jobs</h2>
          {jobs.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No jobs posted yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="p-6 glass-card hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="font-medium text-foreground">KES {job.budget?.toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge variant={job.status === "in-progress" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>

                  {job.fundi_profiles && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{job.fundi_profiles.profiles.full_name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{job.fundi_profiles.profiles.full_name}</p>
                      </div>
                    </div>
                  )}

                  {job.status === "in-progress" && job.start_date && job.end_date && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{calculateProgress(job.start_date, job.end_date)}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary transition-all duration-300"
                          style={{ width: `${calculateProgress(job.start_date, job.end_date)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {job.status === "completed" && job.fundi_id && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedRating({
                          jobId: job.id,
                          fundiId: job.fundi_id!,
                          fundiName: job.fundi_profiles?.profiles.full_name || "Fundi",
                        })}
                      >
                        Rate Fundi
                      </Button>
                    )}
                    {job.fundi_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedChat({
                          id: job.fundi_id!,
                          name: job.fundi_profiles?.profiles.full_name || "Fundi",
                        })}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-heading font-bold mb-4">Recommended Fundis</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {fundis.map((fundi) => (
              <Card key={fundi.id} className="p-6 glass-card hover:shadow-glow-success transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                  {fundi.profiles.full_name[0]}
                </div>

                <h3 className="font-heading font-bold text-lg mb-1">{fundi.profiles.full_name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{fundi.skills.join(", ")}</p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{fundi.avg_rating?.toFixed(1) || "New"}</span>
                  </div>
                  <p className="font-medium">KES {fundi.hourly_rate}/hr</p>
                  <p className="text-muted-foreground">{fundi.experience_years} years exp</p>
                </div>

                <Button
                  className="w-full rounded-full"
                  size="sm"
                  onClick={() => setSelectedChat({ id: fundi.user_id, name: fundi.profiles.full_name })}
                >
                  Contact
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {selectedRating && (
        <RatingDialog
          open={!!selectedRating}
          onClose={() => setSelectedRating(null)}
          jobId={selectedRating.jobId}
          fundiId={selectedRating.fundiId}
          clientId={user?.id}
          fundiName={selectedRating.fundiName}
        />
      )}
    </div>
  );
};

export default ClientDashboard;