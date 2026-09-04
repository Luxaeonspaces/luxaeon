import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import EmployeeHeader from "./components/EmployeeHeader";
import ProfileForm from "./components/ProfileForm";
import EmployeeDocsSection from "./components/EmployeeDocsSection";
import PayslipsTable from "./components/PayslipsTable";

function DocsSkeleton() {
  return <div className="glass-card h-32 animate-pulse" />;
}

function TableSkeleton() {
  return (
    <div className="glass-card animate-pulse p-4">
      <div className="h-3 w-28 rounded bg-gray-200" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default async function EmployeeDetailPage({ params }: { params: { userId: string } }) {
  const { perms } = await requireUser();
  if (!perms.canManageHr) redirect("/dashboard");

  // Only the core record + profile here — hrDocuments and payrolls are fetched
  // independently below so they can stream in behind the profile form instead
  // of blocking it.
  const employee = await prisma.user.findUnique({
    where: { id: params.userId },
    include: { profile: true },
  });
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <EmployeeHeader employee={employee} />

      <ProfileForm employeeId={employee.id} profile={employee.profile} />

      <Suspense fallback={<DocsSkeleton />}>
        <EmployeeDocsSection userId={employee.id} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <PayslipsTable userId={employee.id} />
      </Suspense>
    </div>
  );
}