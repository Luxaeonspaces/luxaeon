import { requireUser } from "@/lib/session";
import ReportsAccessDenied from "./_components/ReportsAccessDenied";
import ReportCard from "./_components/ReportCard";
import FinanceReport from "./_components/FinanceReport";
import LoginReport from "./_components/LoginReport";
import ProjectReport from "./_components/ProjectReport";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  const { perms } = await requireUser();

  if (!perms.canSeeReports) {
    return <ReportsAccessDenied />;
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
        {perms.canSeeLoginReport && (
          <ReportCard
            href="/reports?type=login"
            title="Login & security"
            desc="Sign-ins and user access events"
            active={type === "login"}
          />
        )}
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