import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Phone, Mail, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

interface FundiApplication {
  id: string;
  user_id: string;
  mobile_number: string;
  location: string;
  skills: string[];
  bio: string;
  experience_years: number;
  hourly_rate: number;
  admin_approved: boolean;
  mobile_verified: boolean;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<FundiApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchApplications();

    const channel = supabase
      .channel("fundi-applications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fundi_profiles",
        },
        () => fetchApplications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: hasAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fundi_profiles")
      .select(`
        *,
        profiles:user_id (full_name, avatar_url)
      `)
      .eq("admin_approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } else {
      setApplications(data as any || []);
    }
    setLoading(false);
  };

  const handleApproval = async (applicationId: string, approved: boolean) => {
    const { error } = await supabase
      .from("fundi_profiles")
      .update({ admin_approved: approved })
      .eq("id", applicationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    } else {
      toast({
        title: approved ? "Approved" : "Rejected",
        description: `Application ${approved ? "approved" : "rejected"} successfully`,
      });
      fetchApplications();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-heading font-bold text-primary">
              FundiConnect Admin
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-primary/10">Admin</Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Fundi Applications</h1>
          <p className="text-muted-foreground">Review and approve fundi registrations</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No pending applications</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <Card key={app.id} className="p-6 glass-card hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                      {app.profiles.full_name[0]}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl">{app.profiles.full_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{app.skills.join(", ")}</Badge>
                        {app.mobile_verified ? (
                          <Badge className="bg-success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mobile Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Mobile Not Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{app.mobile_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{app.location || "Not specified"}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Experience:</span> {app.experience_years} years</p>
                    <p><span className="text-muted-foreground">Hourly Rate:</span> KES {app.hourly_rate}/hr</p>
                  </div>
                </div>

                {app.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Bio:</p>
                    <p className="text-sm">{app.bio}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproval(app.id, true)}
                    className="flex-1 bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleApproval(app.id, false)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;