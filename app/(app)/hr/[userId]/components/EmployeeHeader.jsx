import Link from "next/link";

export default function EmployeeHeader({ employee }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="main-header flex-1">
        <p className="relative z-10 text-xs uppercase tracking-wide text-white/60">Employee profile</p>
        <h1 className="relative z-10 font-display text-2xl font-semibold">{employee.fullName}</h1>
        <p className="relative z-10 text-sm text-white/85">
          {employee.role} · {employee.department || "—"} · @{employee.username}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/hr/export?userId=${employee.id}&format=pdf`}
          className="rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-sm font-medium text-brown"
        >
          Download PDF
        </a>
        <a
          href={`/api/hr/export?userId=${employee.id}&format=csv`}
          className="rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-sm font-medium text-brown"
        >
          Download Excel/CSV
        </a>
        <Link href="/hr" className="rounded-xl border border-gray-300 bg-white/80 px-3 py-2 text-sm text-brown">
          ← HR list
        </Link>
      </div>
    </div>
  );
}