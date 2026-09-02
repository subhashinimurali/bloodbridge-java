/**
 * Shared domain constants and helpers for the Blood Donor Management System.
 */

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
  "Biotechnology",
  "Artificial Intelligence",
] as const;

export const YEARS = [1, 2, 3, 4] as const;
export const GENDERS = ["Male", "Female", "Other"] as const;
export const URGENCIES = ["Normal", "High", "Critical"] as const;
export const REQUEST_STATUSES = ["Pending", "Approved", "Rejected", "Completed"] as const;

/** Auth is email based, so a register number is mapped to a stable internal address. */
export function registerNumberToEmail(registerNumber: string): string {
  return `${registerNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}@bdms.local`;
}

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@bdms.local`;
}

/** Donors may give blood again 90 days after their previous donation. */
export const DONATION_GAP_DAYS = 90;

export function daysSince(date?: string | null): number | null {
  if (!date) return null;
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / 86_400_000);
}

export interface EligibilityInput {
  last_donation_date?: string | null;
  weight?: number | null;
  willing?: boolean | null;
}

export function eligibility(p: EligibilityInput): { eligible: boolean; reason: string } {
  if (p.weight != null && p.weight < 45) return { eligible: false, reason: "Weight below 45 kg" };
  const d = daysSince(p.last_donation_date);
  if (d !== null && d < DONATION_GAP_DAYS)
    return { eligible: false, reason: `Eligible in ${DONATION_GAP_DAYS - d} days` };
  if (p.willing === false) return { eligible: false, reason: "Not currently willing" };
  return { eligible: true, reason: "Eligible to donate" };
}

export function formatDate(date?: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function monthKey(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

/** Last `count` months as {key,label} in chronological order. */
export function lastMonths(count: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
    });
  }
  return out;
}

export function bucketByMonth(dates: (string | null | undefined)[], count = 6) {
  const months = lastMonths(count);
  const map = new Map(months.map((m) => [m.key, 0]));
  for (const raw of dates) {
    if (!raw) continue;
    const d = new Date(raw);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return months.map((m) => ({ month: m.label, count: map.get(m.key) ?? 0 }));
}

export function profileCompletion(p: Record<string, unknown>): number {
  const fields = [
    "full_name",
    "register_number",
    "department",
    "year",
    "gender",
    "phone",
    "email",
    "blood_group",
    "dob",
    "weight",
    "address",
    "photo_url",
  ];
  const filled = fields.filter((f) => {
    const v = p[f];
    return v !== null && v !== undefined && String(v).trim() !== "";
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
