import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Link from "next/link";

function formatWAT(date: Date) {
  return `${new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(date)} WAT`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  const { user, perms } = await requireUser();

  if (!perms.canSeeReports) {
    return (
      <div className="space-y-6">
        <div className="main-header">
          <h1 className="relative z-10 font-display text-2xl font-semibold">Reports</h1>
        </div>
        <div className="glass-card p-8 text-center">
          <p className="text-lg font-semibold text-burgundy">Can&apos;t access data</p>
          <p className="mt-2 text-sm text-gray-600">
            You do not have access to reports. Contact the Founder or IT.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-burgundy underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const type = searchParams?.type || "";

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Reports</h1>
        <p className="relative z-10 text-sm text-white/80">Choose a report type available to your role</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {perms.canSeeFinanceReport && (
          <ReportCard
            href="/reports?type=finance"
            title="Finance audit"
            desc="Transaction create, view, export, payroll links"
            active={type === "finance"}
          />
        )}
        {perms.canSeeLoginReport && <ReportCard
          href="/reports?type=login"
          title="Login & security"
          desc="Sign-ins and user access events"
          active={type === "login"}
        />}
        {perms.canSeeProjectReport && (
          <ReportCard
            href="/reports?type=project"
            title="Project activity"
            desc="Projects created/updated, notes, team work log"
            active={type === "project"}
          />
        )}
      </div>

      {!type && (
        <p className="text-sm text-gray-500">Select a report type above to view the audit trail.</p>
      )}

      {type === "finance" && perms.canSeeFinanceReport && <FinanceReport />}
      {type === "login" && perms.canSeeLoginReport && <LoginReport />}
      {type === "project" && perms.canSeeProjectReport && <ProjectReport />}
    </div>
  );
}

function ReportCard({
  href,
  title,
  desc,
  active,
}: {
  href: string;
  title: string;
  desc: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`glass-card block p-5 transition hover:shadow-md ${active ? "ring-2 ring-burgundy/40" : ""}`}
    >
      <h2 className="font-display font-semibold text-burgundy">{title}</h2>
      <p className="mt-1 text-xs text-gray-500">{desc}</p>
    </Link>
  );
}

async function FinanceReport() {
  let audits: any[] = [];
  try {
    audits = await prisma.transactionAudit.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  } catch {
    audits = [];
  }
  const txs = await prisma.transaction.findMany({ take: 300 });
  const map = Object.fromEntries(txs.map((t) => [t.txnId, t]));
  const income = audits.filter((a) => map[a.txnId || ""]?.type === "Income" || (a.details || "").includes("Income"));
  const expense = audits.filter(
    (a) => map[a.txnId || ""]?.type === "Expense" || (a.details || "").includes("Expense") || a.action === "Linked Payroll"
  );

  return (
    <div className="space-y-4">
      <Segment title="Income — finance audit" rows={income} map={map} />
      <Segment title="Expense — finance audit" rows={expense} map={map} />
    </div>
  );
}

function Segment({ title, rows, map }: { title: string; rows: any[]; map: Record<string, any> }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">{title}</div>
      <div className="table-scroll">
        <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">When</th>
            <th className="px-4 py-2">Txn</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Who · Dept</th>
            <th className="px-4 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-t border-gold/20">
              <td className="px-4 py-2 text-xs whitespace-nowrap">{formatWAT(a.createdAt)}</td>
              <td className="px-4 py-2 font-mono text-xs">{a.txnId || "—"}</td>
              <td className="px-4 py-2 text-burgundy">{a.action}</td>
              <td className="px-4 py-2">
                {a.performedBy}
                <span className="block text-xs text-gray-500">
                  {a.role} · {a.department || "—"}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-600">{a.details || "—"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                No entries
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}

async function LoginReport() {
  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [{ action: "Login" }, { action: { contains: "Password" } }, { action: { contains: "User" } }],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">Login &amp; security audit</div>
      <div className="table-scroll">
        <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">When</th>
            <th className="px-4 py-2">Who</th>
            <th className="px-4 py-2">Dept</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t border-gold/20">
              <td className="px-4 py-2 text-xs whitespace-nowrap">{formatWAT(l.createdAt)}</td>
              <td className="px-4 py-2">{l.fullName || l.username}</td>
              <td className="px-4 py-2">{l.department || "—"}</td>
              <td className="px-4 py-2 text-burgundy">{l.action}</td>
              <td className="px-4 py-2 text-gray-600">{l.details}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                No login events yet
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}

async function ProjectReport() {
  const work = await prisma.workActivity.findMany({
    where: {
      OR: [
        { action: { contains: "Project" } },
        { entityType: "project" },
        { action: { contains: "Lead" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">Project &amp; sales activity</div>
      <table className="w-full text-left text-sm">
        <thead className="bg-cream/50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">When</th>
            <th className="px-4 py-2">Who</th>
            <th className="px-4 py-2">Dept</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {work.map((w) => (
            <tr key={w.id} className="border-t border-gold/20">
              <td className="px-4 py-2 text-xs">{w.createdAt.toISOString().slice(0, 16)}</td>
              <td className="px-4 py-2">{w.fullName}</td>
              <td className="px-4 py-2">{w.department || "—"}</td>
              <td className="px-4 py-2 text-burgundy">{w.action}</td>
              <td className="px-4 py-2 text-gray-600">{w.details || w.entityId}</td>
            </tr>
          ))}
          {work.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                No project activity yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
