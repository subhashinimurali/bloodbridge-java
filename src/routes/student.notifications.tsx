import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarDays, Siren } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { STUDENT_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { selectClass } from "@/components/Field";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/bdms";

export const Route = createFileRoute("/student/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — BloodLink" },
      { name: "description", content: "Donation camp announcements and urgent blood alerts for your group." },
      { property: "og:title", content: "Notifications — BloodLink" },
      { property: "og:description", content: "Stay updated on camps and emergency needs." },
    ],
  }),
  component: StudentNotifications,
});

function StudentNotifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("");

  const { data } = useQuery({
    queryKey: ["student-notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [notifications, profile] = await Promise.all([
        supabase.from("notifications").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("blood_group").eq("user_id", user!.id).maybeSingle(),
      ]);
      return { items: notifications.data ?? [], group: profile.data?.blood_group ?? null };
    },
  });

  const group = data?.group ?? null;
  const items = (data?.items ?? []).filter((n) => {
    if (n.target_blood_group && group && n.target_blood_group !== group) return false;
    if (filter && n.type !== filter) return false;
    return true;
  });

  return (
    <AppShell items={STUDENT_NAV} title="Notifications" requiredRole="student">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <select className={`${selectClass} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All types</option>
            <option>General</option>
            <option>Camp</option>
            <option>Emergency</option>
          </select>
          <p className="text-sm text-muted-foreground">
            {items.length} message(s){group ? ` relevant to ${group}` : ""}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((n) => {
            const Icon = n.type === "Emergency" ? Siren : n.type === "Camp" ? CalendarDays : Bell;
            return (
              <div key={n.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                <Icon
                  className={`mt-0.5 size-5 shrink-0 ${n.type === "Emergency" ? "text-destructive" : "text-primary"}`}
                />
                <div className="min-w-0">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.type}
                    {n.target_blood_group ? ` · ${n.target_blood_group}` : ""}
                    {n.camp_date ? ` · Camp on ${formatDate(n.camp_date)}` : ""} · {formatDate(n.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          {items.length === 0 && <p className="py-10 text-center text-muted-foreground">No notifications yet.</p>}
        </div>
      </Card>
    </AppShell>
  );
}
