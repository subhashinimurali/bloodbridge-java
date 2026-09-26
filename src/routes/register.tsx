import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Droplet, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BLOOD_GROUPS, DEPARTMENTS, GENDERS, YEARS } from "@/lib/bdms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, selectClass } from "@/components/Field";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Donor Registration — BloodLink" },
      { name: "description", content: "Register as a campus blood donor: profile, blood group, contact and medical details." },
      { property: "og:title", content: "Donor Registration — BloodLink" },
      { property: "og:description", content: "Join the campus donor registry in a minute." },
    ],
  }),
  component: Register,
});

function Register() {
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
    password: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: { emailRedirectTo: `${window.location.origin}/student` },
    });
    if (error || !data.user) {
      setBusy(false);
      toast.error(error?.message ?? "Registration failed");
      return;
    }

    const userId = data.user.id;
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userId,
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
    await supabase.from("user_roles").insert({ user_id: userId, role: "student" });
    setBusy(false);

    if (profileError) {
      toast.error(profileError.message);
      return;
    }
    toast.success("Registration complete — welcome to BloodLink!");
    navigate({ to: "/student", replace: true });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Droplet className="size-8 fill-primary text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Donor Registration</h1>
            <p className="text-sm text-muted-foreground">Join the campus blood donor registry.</p>
          </div>
        </div>

        <Card className="animate-rise p-6 sm:p-8">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="full_name">
              <Input id="full_name" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </Field>
            <Field label="Register Number" htmlFor="register_number" hint="Used as your login ID">
              <Input id="register_number" required value={form.register_number} onChange={(e) => set("register_number", e.target.value)} />
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
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="Email" htmlFor="email" hint="Password reset links are sent here">
              <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Date of Birth" htmlFor="dob">
              <Input id="dob" type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
            </Field>
            <Field label="Weight (kg)" htmlFor="weight">
              <Input id="weight" type="number" min={30} step="0.1" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
            </Field>
            <Field label="Last Donation Date" htmlFor="last_donation_date">
              <Input id="last_donation_date" type="date" value={form.last_donation_date} disabled={neverDonated} onChange={(e) => set("last_donation_date", e.target.value)} />
              <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={neverDonated}
                  onChange={(e) => {
                    setNeverDonated(e.target.checked);
                    if (e.target.checked) set("last_donation_date", "");
                  }}
                />
                Not donated yet
              </label>
            </Field>
            <Field label="Password" htmlFor="password" hint="Minimum 6 characters">
              <Input id="password" type="password" required value={form.password} onChange={(e) => set("password", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Medical Conditions" htmlFor="medical_conditions">
                <Textarea id="medical_conditions" rows={2} value={form.medical_conditions} onChange={(e) => set("medical_conditions", e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Address" htmlFor="address">
                <Textarea id="address" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
              </Field>
            </div>

            <div className="flex items-center justify-between gap-3 sm:col-span-2">
              <Link to="/login/student" className="text-sm text-muted-foreground hover:text-foreground">
                Already registered? Sign in
              </Link>
              <Button type="submit" disabled={busy} className="gradient-primary shadow-glow">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                Create account
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
