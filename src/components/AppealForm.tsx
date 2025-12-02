import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Send } from "lucide-react";

interface Appeal {
  id: string;
  appeal_message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface AppealFormProps {
  restrictionId: string;
  restrictionReason: string;
  existingAppeals: Appeal[];
  onAppealSubmitted: () => void;
}

export const AppealForm = ({
  restrictionId,
  restrictionReason,
  existingAppeals,
  onAppealSubmitted,
}: AppealFormProps) => {
  const [appealMessage, setAppealMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const hasPendingAppeal = existingAppeals.some((a) => a.status === "pending");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealMessage.trim()) return;

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("restriction_appeals").insert({
      restriction_id: restrictionId,
      user_id: user.id,
      appeal_message: appealMessage,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit appeal. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Appeal Submitted",
        description: "Your appeal has been submitted for review.",
      });
      setAppealMessage("");
      onAppealSubmitted();
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "approved":
        return <Badge className="bg-success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Account Restricted</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Reason: {restrictionReason}
            </p>
          </div>
        </div>
      </Card>

      {existingAppeals.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Previous Appeals</h4>
          {existingAppeals.map((appeal) => (
            <Card key={appeal.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {new Date(appeal.created_at).toLocaleDateString()}
                </span>
                {getStatusBadge(appeal.status)}
              </div>
              <p className="text-sm mb-2">{appeal.appeal_message}</p>
              {appeal.admin_response && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium">Admin Response:</p>
                  <p className="text-sm text-muted-foreground">{appeal.admin_response}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {!hasPendingAppeal && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Submit New Appeal</h4>
            <Textarea
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              placeholder="Explain why you believe this restriction should be lifted..."
              rows={4}
              required
            />
          </div>
          <Button type="submit" disabled={submitting || !appealMessage.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {submitting ? "Submitting..." : "Submit Appeal"}
          </Button>
        </form>
      )}

      {hasPendingAppeal && (
        <p className="text-sm text-muted-foreground">
          You have a pending appeal. Please wait for an admin to review it.
        </p>
      )}
    </div>
  );
};
