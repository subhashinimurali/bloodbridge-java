import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "secondary";
  delay?: number;
}

const accentClass: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  secondary: "bg-secondary/10 text-secondary",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
  delay = 0,
}: StatCardProps) {
  return (
    <Card
      className="card-hover animate-rise glass-panel gap-0 p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold leading-none">{value}</p>
          {hint && <p className="mt-2 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", accentClass[accent])}>
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}
