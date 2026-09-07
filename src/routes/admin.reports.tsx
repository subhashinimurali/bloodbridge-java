import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ADMIN_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { selectClass } from "@/components/Field";
import { BLOOD_GROUPS, bucketByMonth, eligibility, formatDate } from "@/lib/bdms";
import { exportCsv, exportExcel, exportPdf, type Row } from "@/lib/export";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — BloodLink Admin" },
      { name: "description", content: "Donor and donation reports with CSV, Excel and PDF export." },
      { property: "og:title", content: "Reports — BloodLink Admin" },
      { property: "og:description", content: "Export campus donor and donation reports." },
    ],
  }),
  component: AdminReports,
});

function AdminReports() {
  const [group, setGroup] = useState("");
  const [onlyEligible, setOnlyEligible] = useState(false);

  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [profiles, donations] = await Promise.all([
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("donations").select("*"),
      ]);
      return { profiles: profiles.data ?? [], donations: donations.data ?? [] };
    },
  });

  const profiles = data?.profiles ?? [];
  const donations = data?.donations ?? [];

  const filtered = profiles.filter((p) => {
    if (group && p.blood_group !== group) return false;
    if (onlyEligible && !eligibility(p).eligible) return false;
    return true;
  });

  const rows: Row[] = filtered.map((p) => ({
    Name: p.full_name,
    "Register No": p.register_number,
    Department: p.department,
    Year: p.year,
    "Blood Group": p.blood_group,
    Phone: p.phone,
    Email: p.email,
    "Last Donation": formatDate(p.last_donation_date),
    Eligible: eligibility(p).eligible ? "Yes" : "No",
  }));

  const groupChart = BLOOD_GROUPS.map((g) => ({
    group: g,
    donors: filtered.filter((p) => p.blood_group === g).length,
  }));

  const monthly = bucketByMonth(donations.map((d) => d.donation_date), 6);

  return (
    <AppShell items={ADMIN_NAV} title="Reports" requiredRole="admin">
      <div className="space-y-5">
        <Card className="no-print flex flex-wrap items-center gap-3 p-5">
          <select className={`${selectClass} w-auto`} value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">All blood groups</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyEligible}
              onChange={(e) => setOnlyEligible(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Eligible donors only
          </label>
          <p className="text-sm text-muted-foreground">{rows.length} record(s)</p>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportCsv(rows, "bloodlink-donors")}>
              <Download className="size-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportExcel(rows, "bloodlink-donors")}>
              <FileSpreadsheet className="size-4" /> Excel
            </Button>
            <Button size="sm" onClick={exportPdf}>
              <Printer className="size-4" /> PDF
            </Button>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Donors by blood group</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="group" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="donors" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Donations — last 6 months</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name="donations" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="overflow-x-auto p-5">
          <h2 className="font-display text-base font-semibold">Donor report</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                {rows[0] &&
                  Object.keys(rows[0]).map((h) => (
                    <th key={h} className="py-2 pr-4 font-semibold">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/60">
                  {Object.keys(rows[0]!).map((h) => (
                    <td key={h} className="py-2 pr-4">
                      {r[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-10 text-center text-muted-foreground">No records match the filters.</p>}
        </Card>
      </div>
    </AppShell>
  );
}
