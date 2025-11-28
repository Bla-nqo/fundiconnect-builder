import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle, Briefcase } from "lucide-react";

const StatsCounter = () => {
  const [stats, setStats] = useState({
    verifiedFundis: 0,
    totalUsers: 0,
    completedJobs: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get verified fundis count
        const { count: fundisCount } = await supabase
          .from("fundi_profiles")
          .select("*", { count: "exact", head: true })
          .eq("admin_approved", true);

        // Get total users count
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Get completed jobs count
        const { count: jobsCount } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed");

        setStats({
          verifiedFundis: fundisCount || 0,
          totalUsers: usersCount || 0,
          completedJobs: jobsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();

    // Subscribe to real-time updates
    const fundisChannel = supabase
      .channel("fundis-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fundi_profiles",
        },
        () => fetchStats()
      )
      .subscribe();

    const profilesChannel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => fetchStats()
      )
      .subscribe();

    const jobsChannel = supabase
      .channel("jobs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(fundisChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(jobsChannel);
    };
  }, []);

  const statItems = [
    {
      icon: CheckCircle,
      value: stats.verifiedFundis,
      label: "Verified Fundis",
      color: "text-primary",
    },
    {
      icon: Users,
      value: stats.totalUsers,
      label: "Total Users",
      color: "text-accent",
    },
    {
      icon: Briefcase,
      value: stats.completedJobs,
      label: "Jobs Completed",
      color: "text-green-500",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-full bg-background flex items-center justify-center ${item.color}`}>
                <item.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold font-heading">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCounter;