import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Droplet, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usernameToEmail } from "@/lib/bdms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/Field";

export const Route = createFileRoute("/login/admin")({
  head: () => ({
    meta: [
      { title: "Admin Login — BloodLink" },
      { name: "description", content: "Secure administrator sign-in for the BloodLink campus blood donor system." },
      { property: "og:title", content: "Admin Login — BloodLink" },
      { property: "og:description", content: "Secure administrator sign-in for BloodLink." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("Invalid administrator credentials");
      return;
    }
    toast.success("Welcome back, administrator");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="gradient-hero flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="glass-panel animate-rise w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <Droplet className="size-8 fill-primary text-primary" />
          <div>
            <p className="font-display text-xl font-bold">BloodLink</p>
            <p className="text-xs text-muted-foreground">Administrator access</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field label="Username" htmlFor="username">
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </Field>
          <Button type="submit" disabled={busy} className="w-full gradient-primary shadow-glow">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Sign in
          </Button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
          <Link to="/login/student" className="font-medium text-primary hover:underline">
            Student login
          </Link>
        </div>
      </Card>
    </div>
  );
}
