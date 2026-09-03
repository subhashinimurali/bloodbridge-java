import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Droplet, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registerNumberToEmail } from "@/lib/bdms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/Field";

export const Route = createFileRoute("/login/student")({
  head: () => ({
    meta: [
      { title: "Student Login — BloodLink" },
      { name: "description", content: "Students sign in with their register number to manage donations and blood requests." },
      { property: "og:title", content: "Student Login — BloodLink" },
      { property: "og:description", content: "Sign in with your register number to manage donations." },
    ],
  }),
  component: StudentLogin,
});

function StudentLogin() {
  const navigate = useNavigate();
  const [reg, setReg] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: registerNumberToEmail(reg),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("Invalid register number or password");
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/student", replace: true });
  }

  return (
    <div className="gradient-hero flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="glass-panel animate-rise w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <Droplet className="size-8 fill-primary text-primary" />
          <div>
            <p className="font-display text-xl font-bold">BloodLink</p>
            <p className="text-xs text-muted-foreground">Student / donor access</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field label="Register Number" htmlFor="reg">
            <Input id="reg" value={reg} onChange={(e) => setReg(e.target.value)} placeholder="21CS001" required />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </Field>
          <Button type="submit" disabled={busy} className="w-full gradient-primary shadow-glow">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            Sign in
          </Button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
          <Link to="/register" className="font-medium text-primary hover:underline">
            New donor? Register
          </Link>
        </div>
      </Card>
    </div>
  );
}
