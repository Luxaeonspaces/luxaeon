import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AccessControlNotice from "./components/AccessControlNotice";
import UsersTable from "./components/UsersTable";
import CreateUserForm from "./components/CreateUserForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import UpdateUserForm from "./components/UpdateUserForm";

function TableSkeleton() {
  return (
    <div className="glass-card h-56 animate-pulse p-4">
      <div className="h-3 w-40 rounded bg-gray-200" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { error?: string; ok?: string };
}) {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">User Management</h1>
        <p className="relative z-10 text-sm text-white/80">
          Founder &amp; IT staff · edit usernames, create, disable, or remove accounts
        </p>
      </div>


      <AccessControlNotice />

      <Suspense fallback={<TableSkeleton />}>
        <UsersTable currentUserId={user.id} />
      </Suspense>

      {searchParams?.ok && (
        <p className="rounded-xl border border-brown/40 bg-brown/10 px-4 py-3 text-sm text-brown">{searchParams.ok}</p>
      )}
      {searchParams?.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</p>
      )}
      <CreateUserForm formKey={searchParams?.ok || "create"} />
      <ResetPasswordForm formKey={`reset-${searchParams?.ok || ""}`} />
      <UpdateUserForm formKey={`upd-${searchParams?.ok || ""}`} />
    </div>
  );
}