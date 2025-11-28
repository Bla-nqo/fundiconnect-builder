import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Wrench, CheckCircle, Clock } from "lucide-react";

interface RoleSwitcherProps {
  userId: string;
  currentRole: "client" | "fundi" | "admin";
  onRoleChange: () => void;
}

export const RoleSwitcher = ({ userId, currentRole, onRoleChange }: RoleSwitcherProps) => {
  const [showFundiForm, setShowFundiForm] = useState(false);
  const [fundiProfile, setFundiProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    mobile_number: "",
    location: "",
    skills: "",
    bio: "",
    experience_years: "",
    hourly_rate: "",
  });

  useEffect(() => {
    checkFundiProfile();
  }, [userId]);

  const checkFundiProfile = async () => {
    const { data } = await supabase
      .from("fundi_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    setFundiProfile(data);
  };

  const handleApplyAsFundi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: profileError } = await supabase.from("fundi_profiles").insert({
        user_id: userId,
        mobile_number: formData.mobile_number,
        location: formData.location,
        skills: formData.skills.split(",").map(s => s.trim()),
        bio: formData.bio,
        experience_years: parseInt(formData.experience_years),
        hourly_rate: parseFloat(formData.hourly_rate),
      });

      if (profileError) throw profileError;

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "fundi",
      });

      if (roleError && !roleError.message.includes("duplicate")) {
        throw roleError;
      }

      toast({
        title: "Application Submitted",
        description: "Your fundi application is pending admin approval",
      });

      setShowFundiForm(false);
      checkFundiProfile();
      onRoleChange();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fundiProfile) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Fundi Status</h3>
            {fundiProfile.admin_approved ? (
              <Badge className="bg-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Approved
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                Pending Approval
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {fundiProfile.admin_approved
            ? "You can now receive job requests as a fundi"
            : "Your application is being reviewed by our admin team"}
        </p>
      </Card>
    );
  }

  if (!showFundiForm) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold">Become a Fundi</h3>
            <p className="text-sm text-muted-foreground">Offer your services and earn</p>
          </div>
        </div>
        <Button onClick={() => setShowFundiForm(true)} className="w-full">
          Apply as Fundi
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Fundi Application</h3>
      <form onSubmit={handleApplyAsFundi} className="space-y-4">
        <div className="space-y-2">
          <Label>Mobile Number *</Label>
          <Input
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            placeholder="+254..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Location *</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Nairobi, Kenya"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Skills (comma-separated) *</Label>
          <Input
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="Electrician, Plumber"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell clients about your experience..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Experience (years) *</Label>
            <Input
              type="number"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Hourly Rate (KES) *</Label>
            <Input
              type="number"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
              min="0"
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFundiForm(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};