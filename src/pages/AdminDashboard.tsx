import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Phone, MapPin, Plus, Edit2, Trash2, Ban } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

interface JobCategory {
  id: string;
  name: string;
  description: string | null;
}

interface UserRestriction {
  id: string;
  user_id: string;
  reason: string;
  is_active: boolean;
  profiles: {
    full_name: string;
  };
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<FundiApplication[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [restrictions, setRestrictions] = useState<UserRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showRestrictionDialog, setShowRestrictionDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<JobCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [restrictionForm, setRestrictionForm] = useState({ userId: "", reason: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchApplications();
    fetchJobCategories();
    fetchRestrictions();

    const channel = supabase
      .channel("admin-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "fundi_profiles" }, () => fetchApplications())
      .on("postgres_changes", { event: "*", schema: "public", table: "job_categories" }, () => fetchJobCategories())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_restrictions" }, () => fetchRestrictions())
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

  const fetchJobCategories = async () => {
    const { data, error } = await supabase
      .from("job_categories")
      .select("*")
      .order("name");

    if (!error && data) {
      setJobCategories(data);
    }
  };

  const fetchRestrictions = async () => {
    const { data, error } = await supabase
      .from("user_restrictions")
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRestrictions(data as any);
    }
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      const { error } = await supabase
        .from("job_categories")
        .update({ name: categoryForm.name, description: categoryForm.description })
        .eq("id", editingCategory.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Category updated successfully" });
        setShowCategoryDialog(false);
        setEditingCategory(null);
        setCategoryForm({ name: "", description: "" });
        fetchJobCategories();
      }
    } else {
      const { error } = await supabase
        .from("job_categories")
        .insert({ name: categoryForm.name, description: categoryForm.description });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Category added successfully" });
        setShowCategoryDialog(false);
        setCategoryForm({ name: "", description: "" });
        fetchJobCategories();
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase
      .from("job_categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Category deleted successfully" });
      fetchJobCategories();
    }
  };

  const handleRestrictUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_restrictions")
      .insert({
        user_id: restrictionForm.userId,
        reason: restrictionForm.reason,
        restricted_by: user.id,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User restricted successfully" });
      setShowRestrictionDialog(false);
      setRestrictionForm({ userId: "", reason: "" });
      fetchRestrictions();
    }
  };

  const handleRemoveRestriction = async (id: string) => {
    const { error } = await supabase
      .from("user_restrictions")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Restriction removed successfully" });
      fetchRestrictions();
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
          <h1 className="text-3xl font-heading font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage fundis, job categories, and user restrictions</p>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Fundi Applications</TabsTrigger>
            <TabsTrigger value="categories">Job Categories</TabsTrigger>
            <TabsTrigger value="restrictions">User Restrictions</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-6">
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
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="mb-4">
              <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: "", description: "" }); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Job Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit" : "Add"} Job Category</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category Name</Label>
                      <Input
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {editingCategory ? "Update" : "Add"} Category
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobCategories.map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryForm({ name: category.name, description: category.description || "" });
                          setShowCategoryDialog(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="restrictions" className="mt-6">
            <div className="mb-4">
              <Dialog open={showRestrictionDialog} onOpenChange={setShowRestrictionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Ban className="w-4 h-4 mr-2" />
                    Restrict User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Restrict User</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRestrictUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label>User ID</Label>
                      <Input
                        value={restrictionForm.userId}
                        onChange={(e) => setRestrictionForm({ ...restrictionForm, userId: e.target.value })}
                        placeholder="Enter user ID"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Textarea
                        value={restrictionForm.reason}
                        onChange={(e) => setRestrictionForm({ ...restrictionForm, reason: e.target.value })}
                        placeholder="Reason for restriction"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Restrict User
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {restrictions.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No active restrictions</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {restrictions.map((restriction) => (
                  <Card key={restriction.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{restriction.profiles.full_name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">User ID: {restriction.user_id}</p>
                        <p className="text-sm"><span className="font-medium">Reason:</span> {restriction.reason}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveRestriction(restriction.id)}
                      >
                        Remove Restriction
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;