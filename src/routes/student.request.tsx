import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Droplet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { STUDENT_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, selectClass } from "@/components/Field";
import { useAuth } from "@/lib/auth";
import { BLOOD_GROUPS, URGENCIES } from "@/lib/bdms";

export const Route = createFileRoute("/student/request")({
  head: () => ({
    meta: [
      { title: "Request Blood — BloodLink" },
      { name: "description", content: "Raise a blood request with patient, hospital, group and urgency details." },
      { property: "og:title", content: "Request Blood — BloodLink" },
      { property: "og:description", content: "Ask the campus donor network for help." },
    ],
  }),
  component: StudentRequest,
});

function StudentRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    patient_name: "",
    hospital: "",
    blood_group: "O+",
    units: 1,
    required_date: "",
    contact_number: "",
    urgency: "Normal",
    reason: "",
  });

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("blood_requests").insert({
        requester_id: user!.id,
        patient_name: form.patient_name,
        hospital: form.hospital,
        blood_group: form.blood_group,
        units: Number(form.units),
        required_date: form.required_date || null,
        contact_number: form.contact_number,
        urgency: form.urgency,
        reason: form.reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request submitted for approval");
      navigate({ to: "/student" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell items={STUDENT_NAV} title="Request Blood" requiredRole="student">
      <Card className="mx-auto max-w-3xl p-5">
        <div className="flex items-center gap-3">
          <Droplet className="size-6 fill-primary text-primary" />
          <div>
            <h2 className="font-display text-base font-semibold">New blood request</h2>
            <p className="text-sm text-muted-foreground">An admin reviews every request before donors are contacted.</p>
          </div>
        </div>

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.patient_name.trim() || !form.hospital.trim() || !form.contact_number.trim()) {
              toast.error("Patient, hospital and contact number are required");
              return;
            }
            submit.mutate();
          }}
        >
          <Field label="Patient name" htmlFor="r-name">
            <Input id="r-name" value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
          </Field>
          <Field label="Hospital" htmlFor="r-hosp">
            <Input id="r-hosp" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
          </Field>
          <Field label="Blood group">
            <select
              className={selectClass}
              value={form.blood_group}
              onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Units required" htmlFor="r-units">
            <Input
              id="r-units"
              type="number"
              min={1}
              value={form.units}
              onChange={(e) => setForm({ ...form, units: Number(e.target.value) })}
            />
          </Field>
          <Field label="Required date" htmlFor="r-date">
            <Input
              id="r-date"
              type="date"
              value={form.required_date}
              onChange={(e) => setForm({ ...form, required_date: e.target.value })}
            />
          </Field>
          <Field label="Contact number" htmlFor="r-phone">
            <Input
              id="r-phone"
              value={form.contact_number}
              onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
            />
          </Field>
          <Field label="Urgency">
            <select className={selectClass} value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
              {URGENCIES.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason / notes" htmlFor="r-reason">
              <Textarea id="r-reason" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submit.isPending}>
              Submit request
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
