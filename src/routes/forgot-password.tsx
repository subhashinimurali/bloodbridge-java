import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplet, Loader2, MailCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { resolveAuthEmail } from "@/lib/bdms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/Field";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — BloodLink" },
      { name: "description", content: "Request a password reset link for your BloodLink student account." },
      { property: "og:title", content: "Forgot Password — BloodLink" },
      { property: "og:description", content: "Reset your BloodLink student account password." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [reg, setReg] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(await resolveAuthEmail(reg), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="gradient-hero flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="glass-panel animate-rise w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <Droplet className="size-8 fill-primary text-primary" />
          <div>
            <p className="font-display text-xl font-bold">BloodLink</p>
            <p className="text-xs text-muted-foreground">Password recovery</p>
          </div>
        </div>

        {sent ? (
          <div className="mt-7 space-y-4 text-center">
            <MailCheck className="mx-auto size-12 text-primary" />
            <h1 className="font-display text-lg font-semibold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If an account exists for register number <span className="font-medium text-foreground">{reg}</span>,
              we've sent a password reset link. Follow it to choose a new password.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login/student">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field
              label="Register Number"
              htmlFor="reg"
              hint="Enter the register number you use to sign in."
            >
              <Input id="reg" value={reg} onChange={(e) => setReg(e.target.value)} placeholder="21CS001" required />
            </Field>
            <Button type="submit" disabled={busy} className="w-full gradient-primary shadow-glow">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              Send reset link
            </Button>
          </form>
        )}

        {!sent && (
          <div className="mt-6 flex justify-between text-sm">
            <Link to="/login/student" className="text-muted-foreground hover:text-foreground">
              ← Student login
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
