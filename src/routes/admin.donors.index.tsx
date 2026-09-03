import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ADMIN_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { selectClass } from "@/components/Field";
import { BLOOD_GROUPS, DEPARTMENTS, eligibility, formatDate } from "@/lib/bdms";
import { exportCsv, exportExcel } from "@/lib/export";

export const Route = createFileRoute("/admin/donors/")({
  head: () => ({
    meta: [
      { title: "Donor Registry — BloodLink Admin" },
      { name: "description", content: "Search, filter and manage every registered campus blood donor." },
      { property: "og:title", content: "Donor Registry — BloodLink Admin" },
      { property: "og:description", content: "Search and manage registered campus blood donors." },
    ],
  }),
  component: Donors,
});

const PAGE_SIZE = 8;

function Donors() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const [dept, setDept] = useState("");
  const [page, setPage] = useState(1);

  const { data: donors = [] } = useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Donor removed");
      void qc.invalidateQueries({ queryKey: ["donors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(
    () =>
      donors.filter((d) => {
        const text = `${d.full_name} ${d.register_number} ${d.phone}`.toLowerCase();
        return (
          text.includes(q.toLowerCase()) &&
          (!group || d.blood_group === group) &&
          (!dept || d.department === dept)
        );
      }),
    [donors, q, group, dept],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const exportRows = filtered.map((d) => ({
    Name: d.full_name,
    Register: d.register_number,
    Department: d.department,
    Year: d.year,
    Group: d.blood_group,
    Phone: d.phone,
    LastDonation: d.last_donation_date ?? "",
    Eligible: eligibility(d).eligible ? "Yes" : "No",
  }));

  return (
    <AppShell items={ADMIN_NAV} title="Donor Registry" requiredRole="admin">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, register number or phone"
              className="pl-9"
            />
          </div>
          <select className={`${selectClass} w-auto`} value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">All blood groups</option>
            {BLOOD_GROUPS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select className={`${selectClass} w-auto`} value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <Button variant="outline" onClick={() => exportCsv(exportRows, "donors")}>
            <Download className="size-4" /> CSV
          </Button>
          <Button variant="outline" onClick={() => exportExcel(exportRows, "donors")}>
            <Download className="size-4" /> Excel
          </Button>
          <Link to="/admin/donors/new">
            <Button className="gradient-primary">
              <UserPlus className="size-4" /> Add Donor
            </Button>
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Donor</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Group</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Last Donation</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const e = eligibility(d);
                return (
                  <tr key={d.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{d.full_name}</p>
                      <p className="text-xs text-muted-foreground">{d.register_number}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {d.department} · Yr {d.year}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        {d.blood_group}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{d.phone}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(d.last_donation_date)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          e.eligible
                            ? "rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"
                            : "rounded-md bg-warning/20 px-2 py-0.5 text-xs font-semibold text-warning-foreground"
                        }
                      >
                        {e.reason}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => remove.mutate(d.id)} aria-label="Delete donor">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    No donors match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {filtered.length} donor{filtered.length === 1 ? "" : "s"} · page {current} of {pages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
