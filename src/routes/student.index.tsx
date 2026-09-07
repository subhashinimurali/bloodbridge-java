import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarCheck, Droplet, HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { STUDENT_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { DONATION_GAP_DAYS, daysSince, eligibility, formatDate, initials, profileCompletion } from "@/lib/bdms";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — BloodLink" },
      { name: "description", content: "Your donor profile, eligibility status, donations and campus alerts." },
      { property: "og:title", content: "Student Dashboard — BloodLink" },
      { property: "og:description", content: "Track your eligibility and donation history." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["student-dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      const [donations, requests, notifications] = await Promise.all([
        profile
          ? supabase.from("donations").select("*").eq("profile_id", profile.id).order("donation_date", { ascending: false })
          : Promise.resolve({ data: [] }),
        supabase.from("blood_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(4),
      ]);
      return {
        profile,
        donations: donations.data ?? [],
        requests: requests.data ?? [],
        notifications: notifications.data ?? [],
      };
    },
  });

  const profile = data?.profile;
  const donations = data?.donations ?? [];
  const requests = data?.requests ?? [];
  const notifications = data?.notifications ?? [];

  const status = profile ? eligibility(profile) : { eligible: false, reason: "Complete your profile" };
  const since = daysSince(profile?.last_donation_date);
  const completion = profile ? profileCompletion(profile) : 0;

  return (
    <AppShell items={STUDENT_NAV} title="Student Dashboard" requiredRole="student">
      <div className="space-y-5">
        <Card className="flex flex-wrap items-center gap-4 p-5">
          <div className="grid size-14 place-items-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
            {profile ? initials(profile.full_name) : "?"}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold">{profile?.full_name ?? "Welcome"}</h2>
            <p className="text-sm text-muted-foreground">
              {profile ? `${profile.register_number} · ${profile.department} · Year ${profile.year}` : "No profile found"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 px-3 py-1.5 font-display text-lg font-bold text-primary">
              {profile?.blood_group ?? "—"}
            </span>
            <Link to="/student/profile">
              <Button variant="outline" size="sm">
                Edit profile
              </Button>
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Eligibility" value={status.eligible ? "Eligible" : "Not yet"} icon={HeartPulse} hint={status.reason} />
          <StatCard label="Total donations" value={donations.length} icon={Droplet} hint="Recorded by admin" />
          <StatCard
            label="Last donation"
            value={formatDate(profile?.last_donation_date)}
            icon={CalendarCheck}
            hint={since === null ? "No donation recorded" : `${since} days ago`}
          />
          <StatCard label="Alerts" value={notifications.length} icon={Bell} hint="Recent announcements" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Profile completion</h2>
            <p className="mt-1 text-sm text-muted-foreground">{completion}% complete</p>
            <Progress value={completion} className="mt-3" />
            <p className="mt-4 text-sm text-muted-foreground">
              Donors may give blood again {DONATION_GAP_DAYS} days after their last donation.
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Latest announcements</h2>
            <div className="mt-3 space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-sm text-muted-foreground">Nothing new right now.</p>}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">My blood requests</h2>
            <Link to="/student/request">
              <Button size="sm">New request</Button>
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-semibold">
                    {r.patient_name} · {r.blood_group} · {r.units} unit(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.hospital} · needed {formatDate(r.required_date)}
                  </p>
                </div>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">{r.status}</span>
              </div>
            ))}
            {requests.length === 0 && <p className="text-sm text-muted-foreground">You haven&apos;t raised any requests.</p>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
