import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ADMIN_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/Field";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BloodLink Admin" },
      { name: "description", content: "Configure college details, donation rules and admin credentials." },
      { property: "og:title", content: "Settings — BloodLink Admin" },
      { property: "og:description", content: "System settings for the campus donor registry." },
    ],
  }),
  component: AdminSettings,
});

const KEYS = [
  { key: "college_name", label: "College name" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "donation_gap_days", label: "Minimum gap between donations (days)" },
  { key: "min_weight_kg", label: "Minimum donor weight (kg)" },
  { key: "footer_note", label: "Footer note" },
];

function AdminSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*");
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!settings) return;
    const next: Record<string, string> = {};
    for (const k of KEYS) next[k.key] = settings.find((s) => s.key === k.key)?.value ?? "";
    setValues(next);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      for (const k of KEYS) {
        const existing = settings?.find((s) => s.key === k.key);
        if (existing) {
          const { error } = await supabase
            .from("app_settings")
            .update({ value: values[k.key] ?? "", updated_at: new Date().toISOString() })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("app_settings").insert({ key: k.key, value: values[k.key] ?? "" });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success("Settings saved");
      void qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password updated");
      setPassword("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell items={ADMIN_NAV} title="Settings" requiredRole="admin">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">System settings</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            {KEYS.map((k) => (
              <Field key={k.key} label={k.label} htmlFor={`s-${k.key}`}>
                {k.key === "footer_note" ? (
                  <Textarea
                    id={`s-${k.key}`}
                    rows={3}
                    value={values[k.key] ?? ""}
                    onChange={(e) => setValues({ ...values, [k.key]: e.target.value })}
                  />
                ) : (
                  <Input
                    id={`s-${k.key}`}
                    value={values[k.key] ?? ""}
                    onChange={(e) => setValues({ ...values, [k.key]: e.target.value })}
                  />
                )}
              </Field>
            ))}
            <Button type="submit" disabled={save.isPending}>
              <Save className="size-4" /> Save settings
            </Button>
          </form>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="font-display text-base font-semibold">Admin account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email}</p>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
              }
              changePassword.mutate();
            }}
          >
            <Field label="New password" htmlFor="s-pass">
              <Input id="s-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Button type="submit" variant="outline" disabled={changePassword.isPending}>
              Change password
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
