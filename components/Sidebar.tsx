"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Props = {
  fullName: string;
  role: string;
  department?: string | null;
  perms: {
    canSeeFinance: boolean;
    canManageUsers: boolean;
    canManageHr: boolean;
    canSeeAudit: boolean;
    canProcessProcurement: boolean;
    canManageSalesTargets: boolean;
    canManageAppraisals: boolean;
    canManageOnboarding: boolean;
    canSeeAllActivity: boolean;
  };
};

const links = [
  { href: "/dashboard", label: "Dashboard", show: () => true },
  { href: "/leads", label: "Leads & Sales", show: () => true },
  { href: "/projects", label: "Projects", show: () => true },
  { href: "/finance", label: "Finance & Cashflow", show: (p: Props["perms"]) => p.canSeeFinance },
  { href: "/outflow", label: "Outflow Approvals", show: () => true },
  { href: "/procurement", label: "Procurement", show: () => true },
  { href: "/sales-targets", label: "Sales Targets", show: (p: Props["perms"]) => p.canManageSalesTargets },
  { href: "/appraisals", label: "Appraisals", show: () => true },
  { href: "/onboarding", label: "Employee Onboarding", show: (p: Props["perms"]) => p.canManageOnboarding },
  { href: "/activity", label: "Team Activity", show: (p: Props["perms"]) => p.canSeeAllActivity },
  { href: "/vendors", label: "Vendors", show: () => true },
  { href: "/archive", label: "Project Archivess", show: () => true },
  { href: "/documents", label: "Documents & Templates", show: () => true },
  { href: "/client-portal", label: "Client Portal", show: () => true },
  { href: "/my-space", label: "My Employee Space", show: () => true },
  { href: "/leave", label: "Leave Requests", show: () => true },
  { href: "/profile", label: "My Profile & Payslip", show: () => true },
  { href: "/payroll", label: "Payroll", show: (p: Props["perms"]) => p.canManageHr || p.canSeeFinance },
  { href: "/hr", label: "HR & Profiles", show: (p: Props["perms"]) => p.canManageHr },
  { href: "/users", label: "User Management", show: (p: Props["perms"]) => p.canManageUsers },
  { href: "/permissions", label: "Role Permissions", show: (p: Props["perms"]) => p.canManageUsers },
  { href: "/reports", label: "Reports", show: () => true },
  { href: "/settings", label: "Settings", show: () => true },
];

export default function Sidebar({ fullName, role, department, perms }: Props) {
  const path = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-gold/40 bg-white/65 p-4 backdrop-blur-xl">
      <div className="mb-6 px-2">
        <img src="/logo.png" alt="Luxaeon" className="mb-2 h-12 w-12 object-contain" />
        <h1 className="font-display text-lg font-semibold text-burgundy">Luxaeon Spaces</h1>
        <p className="text-xs text-gray-500">Business OS · Next.js</p>
        <div className="mt-3 rounded-xl bg-burgundy/5 px-3 py-2 text-xs">
          <p className="font-semibold text-burgundy">{fullName}</p>
          <p className="text-gray-600">
            {role}
            {department ? ` · ${department}` : ""}
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
        {links
          .filter((l) => l.show(perms))
          .map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${path === l.href || path.startsWith(l.href + "/") ? "nav-link-active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-4 rounded-xl border border-gold/40 bg-white/80 px-3 py-2 text-sm font-medium text-burgundy transition hover:bg-cream"
      >
        Sign out
      </button>
    </aside>
  );
}
