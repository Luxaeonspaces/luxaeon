"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", show: () => true },
  { href: "/leads", label: "Leads & Sales", show: () => true },
  { href: "/projects", label: "Projects", show: () => true },
  { href: "/finance", label: "Finance & Cashflow", show: (p) => p.canSeeFinance },
  { href: "/outflow", label: "Outflow Approvals", show: () => true },
  { href: "/procurement", label: "Procurement", show: () => true },
  { href: "/sales-targets", label: "Sales Targets", show: (p) => p.canManageSalesTargets },
  { href: "/appraisals", label: "Appraisals", show: () => true },
  { href: "/onboarding", label: "Employee Onboarding", show: (p) => p.canManageOnboarding },
  { href: "/activity", label: "Team Activity", show: (p) => p.canSeeAllActivity },
  { href: "/vendors", label: "Vendors", show: () => true },
  { href: "/archive", label: "Project Archivess", show: () => true },
  { href: "/documents", label: "Documents & Templates", show: () => true },
  { href: "/client-portal", label: "Client Portal", show: () => true },
  { href: "/my-space", label: "My Employee Space", show: () => true },
  { href: "/leave", label: "Leave Requests", show: () => true },
  { href: "/profile", label: "My Profile & Payslip", show: () => true },
  { href: "/payroll", label: "Payroll", show: (p) => p.canManageHr || p.canSeeFinance },
  { href: "/hr", label: "HR & Profiles", show: (p) => p.canManageHr },
  { href: "/users", label: "User Management", show: (p) => p.canManageUsers },
  { href: "/permissions", label: "Role Permissions", show: (p) => p.canManageUsers },
  { href: "/reports", label: "Reports", show: (p) => p.canSeeReports },
  { href: "/settings", label: "Settings", show: () => true },
];

export default function Sidebar({ fullName, role, department, perms }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3 z-50 rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-lg leading-none text-brown shadow-sm md:hidden"
      >
        <span aria-hidden="true">☰</span>
      </button>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/25 md:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-[min(18rem,88vw)] flex-col overflow-hidden border-r border-gray-200 bg-white/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl transition-transform duration-200 md:sticky md:top-0 md:h-screen md:z-auto md:w-64 md:shrink-0 md:translate-x-0 md:bg-white/65 md:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-6 flex items-start justify-between px-2">
          <div>
            <img src="/logo.png" alt="Luxaeon" className="mb-2 h-12 w-12 object-contain" />
            <h1 className="font-display text-lg font-semibold text-brown">Luxaeon Spaces</h1>
            <p className="text-xs text-gray-500">Business OS</p>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-xl leading-none text-brown md:hidden"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="mb-4 rounded-xl bg-brown/5 px-3 py-2 text-xs">
          <p className="font-semibold text-brown">{fullName}</p>
          <p className="text-gray-600">
            {role}
            {department ? ` · ${department}` : ""}
          </p>
        </div>
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
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
        <div className="mt-3 shrink-0 border-t border-gray-200 pt-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-sm font-semibold text-brown transition hover:bg-whitesmoke"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}