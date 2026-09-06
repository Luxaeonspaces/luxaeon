import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import OutflowWorkflowExplainer from "./components/OutflowWorkflowExplainer";
import PermissionMatrix from "./components/PermissionMatrix";
import LiveSessionFlags from "./components/LiveSessionFlags";

export default async function PermissionsPage() {
  const { user, perms } = await requireUser();
  if (!perms.canManageUsers) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Role-based access control</h1>
        <p className="relative z-10 text-sm text-white/80">Permission matrix + expense approval workflow</p>
      </div>

      <OutflowWorkflowExplainer />
      <PermissionMatrix />
      {/* <LiveSessionFlags user={user} perms={perms} /> */}
    </div>
  );
}