import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Droplet, HeartPulse, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BloodLink — College Blood Donor Management System" },
      {
        name: "description",
        content:
          "BloodLink connects college students and administrators to manage blood donors, requests, donation history and camp notifications in one place.",
      },
      { property: "og:title", content: "BloodLink — College Blood Donor Management System" },
      {
        property: "og:description",
        content:
          "Manage campus blood donors, requests, donation history and camps with role-based dashboards.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Users, title: "Donor Registry", text: "Searchable records with blood group, department and eligibility." },
  { icon: Activity, title: "Live Requests", text: "Raise and track blood requests with urgency and approval status." },
  { icon: HeartPulse, title: "Donation Tracking", text: "90-day eligibility timers and complete donation history." },
  { icon: ShieldCheck, title: "Role-Based Access", text: "Separate secure dashboards for admins and students." },
];

function Landing() {
  useEffect(() => {
    const { hash, search } = window.location;
    if (hash.includes("type=recovery") || search.includes("type=recovery") || (search.includes("code=") && !hash)) {
      window.location.replace(`/reset-password${search}${hash}`);
    }
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between px-5 sm:px-10">
        <div className="flex items-center gap-2">
          <Droplet className="size-7 fill-primary text-primary" />
          <span className="font-display text-xl font-bold">BloodLink</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login/student">
            <Button variant="ghost">Student Login</Button>
          </Link>
          <Link to="/login/admin">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </div>
      </header>

      <section className="gradient-hero relative overflow-hidden px-5 py-20 text-white sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <Droplet className="size-3.5" /> College Blood Donor Management
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Every drop counts. Track it, manage it, save lives.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
            A complete donor management and tracking system for the campus — registrations,
            eligibility, blood requests, donation history, camps and analytics.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg" className="gradient-primary shadow-glow">
                Register as Donor
              </Button>
            </Link>
            <Link to="/login/student">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                Student Login
              </Button>
            </Link>
            <Link to="/login/admin">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
        <h2 className="font-display text-2xl font-bold">What you can do</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Card key={f.title} className="card-hover animate-rise p-5" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground sm:px-10">
        BloodLink · College Blood Donor Management &amp; Tracking System
      </footer>
    </div>
  );
}
