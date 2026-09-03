import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarCheck, ClipboardList, Droplet, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { ADMIN_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { BLOOD_GROUPS, bucketByMonth, eligibility, formatDate } from "@/lib/bdms";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — BloodLink" },
      { name: "description", content: "Campus blood donor analytics: donors, requests, donations and camp activity." },
      { property: "og:title", content: "Admin Dashboard — BloodLink" },
      { property: "og:description", content: "Campus blood donor analytics at a glance." },
    ],
  }),
  component: AdminDashboard,
});

const PIE_COLORS = ["var(--chart-1)", "var(--chart-4)", "var(--chart-2)", "var(--chart-3)"];

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [profiles, requests, donations] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("blood_requests").select("*"),
        supabase.from("donations").select("*"),
      ]);
      return {
        profiles: profiles.data ?? [],
        requests: requests.data ?? [],
        donations: donations.data ?? [],
      };
    },
  });

  const profiles = data?.profiles ?? [];
  const requests = data?.requests ?? [];
  const donations = data?.donations ?? [];

  const eligible = profiles.filter((p) => eligibility(p).eligible).length;
  const pending = requests.filter((r) => r.status === "Pending").length;

  const groupData = BLOOD_GROUPS.map((g) => ({
    group: g,
    donors: profiles.filter((p) => p.blood_group === g).length,
  }));

  const monthly = bucketByMonth(donations.map((d) => d.donation_date), 6).map((m) => ({
    month: m.month,
    donations: m.count,
  }));

  const statusData = ["Pending", "Approved", "Completed", "Rejected"]
    .map((s) => ({ name: s, value: requests.filter((r) => r.status === s).length }))
    .filter((s) => s.value > 0);

  const deptMap = new Map<string, number>();
  for (const p of profiles) deptMap.set(p.department || "Other", (deptMap.get(p.department || "Other") ?? 0) + 1);
  const deptData = [...deptMap.entries()].map(([department, donors]) => ({ department, donors }));

  return (
    <AppShell items={ADMIN_NAV} title="Admin Dashboard" requiredRole="admin">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Donors" value={profiles.length} icon={Users} hint="Registered students" />
        <StatCard label="Eligible Now" value={eligible} icon={Droplet} accent="success" hint="Ready to donate" delay={70} />
        <StatCard label="Pending Requests" value={pending} icon={ClipboardList} accent="warning" hint="Awaiting approval" delay={140} />
        <StatCard label="Total Donations" value={donations.length} icon={CalendarCheck} accent="secondary" hint="All time" delay={210} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Donors by Blood Group">
          <BarChart data={groupData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="group" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="donors" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Donations — Last 6 Months">
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="donations" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Request Status">
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
              {statusData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ChartCard>

        <ChartCard title="Donors by Department">
          <BarChart data={deptData} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis type="category" dataKey="department" width={120} stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="donors" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-display text-base font-semibold">Recent Registrations</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Register No.</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Blood Group</th>
                <th className="py-2">Registered</th>
              </tr>
            </thead>
            <tbody>
              {profiles.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{p.full_name}</td>
                  <td className="py-2.5 pr-4">{p.register_number}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{p.department}</td>
                  <td className="py-2.5 pr-4">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {p.blood_group}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

export const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card className="p-5">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <div className="mt-3 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
