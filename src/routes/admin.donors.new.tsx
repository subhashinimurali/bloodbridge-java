import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ADMIN_NAV } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, selectClass } from "@/components/Field";
import { BLOOD_GROUPS, DEPARTMENTS, GENDERS, YEARS } from "@/lib/bdms";

export const Route = createFileRoute("/admin/donors/new")({
  head: () => ({
    meta: [
      { title: "Add Donor — BloodLink Admin" },
      { name: "description", content: "Add a walk-in or offline blood donor record to the campus registry." },
      { property: "og:title", content: "Add Donor — BloodLink Admin" },
      { property: "og:description", content: "Add a donor record to the campus registry." },
    ],
  }),
  component: AddDonor,
});

function AddDonor() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    register_number: "",
    department: DEPARTMENTS[0] as string,
    year: 1,
    gender: "Male",
    phone: "",
    email: "",
    blood_group: "O+",
    dob: "",
    weight: "",
    last_donation_date: "",
    medical_conditions: "",
    address: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("profiles").insert({
      full_name: form.full_name,
      register_number: form.register_number.trim().toUpperCase(),
      department: form.department,
      year: Number(form.year),
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      blood_group: form.blood_group,
      dob: form.dob || null,
      weight: form.weight ? Number(form.weight) : null,
      last_donation_date: form.last_donation_date || null,
      medical_conditions: form.medical_conditions,
      address: form.address,
      willing: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Donor added to the registry");
    navigate({ to: "/admin/donors" });
  }

  return (
    <AppShell items={ADMIN_NAV} title="Add Donor" requiredRole="admin">
      <Card className="max-w-3xl p-6">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </Field>
          <Field label="Register Number">
            <Input required value={form.register_number} onChange={(e) => set("register_number", e.target.value)} />
          </Field>
          <Field label="Department">
            <select className={selectClass} value={form.department} onChange={(e) => set("department", e.target.value)}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Year">
            <select className={selectClass} value={form.year} onChange={(e) => set("year", Number(e.target.value))}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select className={selectClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Blood Group">
            <select className={selectClass} value={form.blood_group} onChange={(e) => set("blood_group", e.target.value)}>
              {BLOOD_GROUPS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Phone">
            <Input required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
          </Field>
          <Field label="Weight (kg)">
            <Input type="number" step="0.1" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          </Field>
          <Field label="Last Donation Date">
            <Input type="date" value={form.last_donation_date} onChange={(e) => set("last_donation_date", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Medical Conditions">
              <Textarea rows={2} value={form.medical_conditions} onChange={(e) => set("medical_conditions", e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Address">
              <Textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="gradient-primary shadow-glow">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Save donor
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
