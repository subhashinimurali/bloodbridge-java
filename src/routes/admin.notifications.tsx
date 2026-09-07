import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ADMIN_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, selectClass } from "@/components/Field";
import { BLOOD_GROUPS, formatDate } from "@/lib/bdms";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — BloodLink Admin" },
      { name: "description", content: "Send donation camp announcements and urgent blood alerts to students." },
      { property: "og:title", content: "Notifications — BloodLink Admin" },
      { property: "og:description", content: "Broadcast camp and emergency alerts to donors." },
    ],
  }),
  component: AdminNotifications,
});

const TYPES = ["General", "Camp", "Emergency"] as const;

function AdminNotifications() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "General" as string,
    target_blood_group: "",
    camp_date: "",
  });

  const { data: items = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").insert({
        title: form.title,
        message: form.message,
        type: form.type,
        target_blood_group: form.target_blood_group || null,
        camp_date: form.camp_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notification sent");
      setForm({ title: "", message: "", type: "General", target_blood_group: "", camp_date: "" });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notification deleted");
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell items={ADMIN_NAV} title="Notifications" requiredRole="admin">
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit p-5">
          <h2 className="font-display text-base font-semibold">New announcement</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim() || !form.message.trim()) {
                toast.error("Title and message are required");
                return;
              }
              create.mutate();
            }}
          >
            <Field label="Title" htmlFor="n-title">
              <Input id="n-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Message" htmlFor="n-msg">
              <Textarea id="n-msg" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </Field>
            <Field label="Type">
              <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Target blood group" hint="Leave empty to notify everyone">
              <select
                className={selectClass}
                value={form.target_blood_group}
                onChange={(e) => setForm({ ...form, target_blood_group: e.target.value })}
              >
                <option value="">All donors</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Camp date" htmlFor="n-date">
              <Input
                id="n-date"
                type="date"
                value={form.camp_date}
                onChange={(e) => setForm({ ...form, camp_date: e.target.value })}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              <Send className="size-4" /> Send notification
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Sent notifications</h2>
          <div className="mt-4 space-y-3">
            {items.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                <Bell className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.type}
                    {n.target_blood_group ? ` · ${n.target_blood_group}` : " · All donors"}
                    {n.camp_date ? ` · Camp ${formatDate(n.camp_date)}` : ""} · {formatDate(n.created_at)}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(n.id)} aria-label="Delete notification">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
            {items.length === 0 && <p className="py-10 text-center text-muted-foreground">No notifications yet.</p>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
