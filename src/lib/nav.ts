import {
  Bell,
  ClipboardList,
  Droplet,
  FileBarChart,
  Gauge,
  History,
  Settings,
  UserPlus,
  Users,
  UserCog,
} from "lucide-react";
import type { NavItem } from "@/components/AppShell";

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: Gauge },
  { label: "Donors", to: "/admin/donors", icon: Users },
  { label: "Add Donor", to: "/admin/donors/new", icon: UserPlus },
  { label: "Blood Requests", to: "/admin/requests", icon: ClipboardList },
  { label: "Reports", to: "/admin/reports", icon: FileBarChart },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", to: "/student", icon: Gauge },
  { label: "My Profile", to: "/student/profile", icon: UserCog },
  { label: "Request Blood", to: "/student/request", icon: Droplet },
  { label: "Donation History", to: "/student/history", icon: History },
  { label: "Notifications", to: "/student/notifications", icon: Bell },
];
