import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
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
import { BLOOD_GROUPS, DEPARTMENTS, GENDERS, YEARS, eligibility } from "@/lib/bdms";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — BloodLink" },
      { name: "description", content: "Update your donor profile, contact details and donation availability." },
      { property: "og:title", content: "My Profile — BloodLink" },
      { property: "og:description", content: "Keep your donor details up to date." },
    ],
  }),
  component: StudentProfile,
});

type FormState = {
  full_name: string;
  register_number: string;
  department: string;
  year: number;
  gender: string;
  phone: string;
  email: string;
  blood_group: string;
  dob: string;
  weight: string;
  last_donation_date: string;
  medical_conditions: string;
  address: string;
  willing: boolean;
};

const EMPTY: FormState = {
  full_name: "",
  register_number: "",
  department: DEPARTMENTS[0],
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
  willing: true,
};

function StudentProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name,
      register_number: profile.register_number,
      department: profile.department || DEPARTMENTS[0],
      year: profile.year,
      gender: profile.gender,
      phone: profile.phone,
      email: profile.email,
      blood_group: profile.blood_group,
      dob: profile.dob ?? "",
      weight: profile.weight != null ? String(profile.weight) : "",
      last_donation_date: profile.last_donation_date ?? "",
      medical_conditions: profile.medical_conditions ?? "",
      address: profile.address ?? "",
      willing: profile.willing,
    });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("Profile not found");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
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
          willing: form.willing,
        })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      void qc.invalidateQueries({ queryKey: ["my-profile"] });
      void qc.invalidateQueries({ queryKey: ["student-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const status = eligibility({
    last_donation_date: form.last_donation_date || null,
    weight: form.weight ? Number(form.weight) : null,
    willing: form.willing,
  });

  return (
    <AppShell items={STUDENT_NAV} title="My Profile" requiredRole="student">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold">Donor details</h2>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
              status.eligible ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"
            }`}
          >
            {status.reason}
          </span>
        </div>

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Full name" htmlFor="p-name">
            <Input id="p-name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Register number">
            <Input value={form.register_number} disabled />
          </Field>
          <Field label="Department">
            <select className={selectClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Year">
            <select className={selectClass} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select className={selectClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
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
          <Field label="Phone" htmlFor="p-phone">
            <Input id="p-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email" htmlFor="p-email">
            <Input id="p-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Date of birth" htmlFor="p-dob">
            <Input id="p-dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          </Field>
          <Field label="Weight (kg)" htmlFor="p-weight">
            <Input id="p-weight" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </Field>
          <Field label="Last donation date" htmlFor="p-last">
            <Input
              id="p-last"
              type="date"
              value={form.last_donation_date}
              onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
            />
          </Field>
          <Field label="Available to donate">
            <label className="flex h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.willing}
                onChange={(e) => setForm({ ...form, willing: e.target.checked })}
                className="size-4 accent-[var(--primary)]"
              />
              Yes, contact me for donations
            </label>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Medical conditions" htmlFor="p-med">
              <Textarea
                id="p-med"
                rows={2}
                value={form.medical_conditions}
                onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Address" htmlFor="p-addr">
              <Textarea id="p-addr" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              <Save className="size-4" /> Save changes
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
