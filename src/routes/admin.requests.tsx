import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ADMIN_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { selectClass } from "@/components/Field";
import { REQUEST_STATUSES, formatDate } from "@/lib/bdms";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({
    meta: [
      { title: "Blood Requests — BloodLink Admin" },
      { name: "description", content: "Review, approve, reject and complete campus blood requests." },
      { property: "og:title", content: "Blood Requests — BloodLink Admin" },
      { property: "og:description", content: "Review and act on campus blood requests." },
    ],
  }),
  component: AdminRequests,
});

const statusClass: Record<string, string> = {
  Pending: "bg-warning/20 text-warning-foreground",
  Approved: "bg-success/15 text-success",
  Completed: "bg-secondary/10 text-secondary",
  Rejected: "bg-destructive/10 text-destructive",
};

function AdminRequests() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");

  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const { data } = await supabase.from("blood_requests").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("blood_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request updated");
      void qc.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blood_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request deleted");
      void qc.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = requests.filter((r) => !filter || r.status === filter);

  return (
    <AppShell items={ADMIN_NAV} title="Blood Requests" requiredRole="admin">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <select className={`${selectClass} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground">{rows.length} request(s)</p>
        </div>

        <div className="mt-4 grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold">
                    {r.patient_name}{" "}
                    <span className="ml-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {r.blood_group}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {r.hospital} · {r.units} unit(s) · needed {formatDate(r.required_date)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contact {r.contact_number} · Urgency {r.urgency}
                  </p>
                  {r.reason && <p className="mt-1 text-sm">{r.reason}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${statusClass[r.status] ?? ""}`}>
                    {r.status}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: r.id, status: "Approved" })}>
                      <Check className="size-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: r.id, status: "Rejected" })}>
                      <X className="size-4" /> Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: r.id, status: "Completed" })}>
                      Complete
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)} aria-label="Delete request">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="py-10 text-center text-muted-foreground">No requests found.</p>}
        </div>
      </Card>
    </AppShell>
  );
}
