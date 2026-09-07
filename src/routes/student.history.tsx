import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { STUDENT_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { bucketByMonth, formatDate } from "@/lib/bdms";
import { exportCsv, exportPdf, type Row } from "@/lib/export";

export const Route = createFileRoute("/student/history")({
  head: () => ({
    meta: [
      { title: "Donation History — BloodLink" },
      { name: "description", content: "Every donation you have made, with dates, hospitals and units." },
      { property: "og:title", content: "Donation History — BloodLink" },
      { property: "og:description", content: "Your personal donation record." },
    ],
  }),
  component: StudentHistory,
});

function StudentHistory() {
  const { user } = useAuth();

  const { data: donations = [] } = useQuery({
    queryKey: ["my-donations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user!.id).maybeSingle();
      if (!profile) return [];
      const { data } = await supabase
        .from("donations")
        .select("*")
        .eq("profile_id", profile.id)
        .order("donation_date", { ascending: false });
      return data ?? [];
    },
  });

  const rows: Row[] = donations.map((d) => ({
    Date: formatDate(d.donation_date),
    Units: d.units,
    Hospital: d.hospital ?? "—",
    Notes: d.notes ?? "",
  }));

  const monthly = bucketByMonth(donations.map((d) => d.donation_date), 6);
  const totalUnits = donations.reduce((sum, d) => sum + (d.units ?? 0), 0);

  return (
    <AppShell items={STUDENT_NAV} title="Donation History" requiredRole="student">
      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold">Your donations</h2>
              <p className="text-sm text-muted-foreground">
                {donations.length} donation(s) · {totalUnits} unit(s) contributed
              </p>
            </div>
            <div className="no-print flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportCsv(rows, "my-donations")}>
                <Download className="size-4" /> CSV
              </Button>
              <Button size="sm" onClick={exportPdf}>
                <Printer className="size-4" /> PDF
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-semibold">Date</th>
                  <th className="py-2 pr-4 font-semibold">Units</th>
                  <th className="py-2 pr-4 font-semibold">Hospital</th>
                  <th className="py-2 pr-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b border-border/60">
                    <td className="py-2 pr-4">{formatDate(d.donation_date)}</td>
                    <td className="py-2 pr-4">{d.units}</td>
                    <td className="py-2 pr-4">{d.hospital || "—"}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{d.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {donations.length === 0 && (
              <p className="py-10 text-center text-muted-foreground">No donations recorded yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Last 6 months</h2>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="donations" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
