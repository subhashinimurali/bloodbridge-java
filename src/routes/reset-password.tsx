import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Droplet, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/Field";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — BloodLink" },
      { name: "description", content: "Choose a new password for your BloodLink account." },
      { property: "og:title", content: "Reset Password — BloodLink" },
      { property: "og:description", content: "Choose a new password for your BloodLink account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) setReady(true);
    });
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const linkError = url.searchParams.get("error_description") || hash.get("error_description");

    (async () => {
      if (linkError) {
        toast.error(linkError.replace(/\+/g, " "));
        setInvalid(true);
        return;
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return setReady(true);
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        if (!error) return setReady(true);
      } else if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });
        if (!error) return setReady(true);
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) return setReady(true);
      setTimeout(() => {
        setReady((r) => {
          if (!r) setInvalid(true);
          return r;
        });
      }, 4000);
    })();
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated — sign in with your new password");
    await supabase.auth.signOut();
    navigate({ to: "/login/student", replace: true });
  }

  return (
    <div className="gradient-hero flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="glass-panel animate-rise w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <Droplet className="size-8 fill-primary text-primary" />
          <div>
            <p className="font-display text-xl font-bold">BloodLink</p>
            <p className="text-xs text-muted-foreground">Choose a new password</p>
          </div>
        </div>

        {invalid && !ready ? (
          <div className="mt-7 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              This reset link is invalid or has expired. Request a new one.
            </p>
            <Button asChild className="w-full gradient-primary">
              <Link to="/forgot-password">Request new link</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="New Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                disabled={!ready}
              />
            </Field>
            <Field label="Confirm Password" htmlFor="confirm">
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                disabled={!ready}
              />
            </Field>
            <Button type="submit" disabled={busy || !ready} className="w-full gradient-primary shadow-glow">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Update password
            </Button>
            {!ready && (
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Verifying your reset link…
              </p>
            )}
          </form>
        )}

        <div className="mt-6 text-sm">
          <Link to="/login/student" className="text-muted-foreground hover:text-foreground">
            ← Student login
          </Link>
        </div>
      </Card>
    </div>
  );
}
