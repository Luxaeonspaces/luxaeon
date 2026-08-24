import Sidebar from "@/components/Sidebar";
import BackButton from "@/components/BackButton";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, perms } = await requireUser();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        fullName={user.fullName}
        role={user.role}
        department={user.department}
        perms={{
          canSeeFinance: perms.canSeeFinance,
          canManageUsers: perms.canManageUsers,
          canManageHr: perms.canManageHr,
          canSeeAudit: perms.canSeeAudit,
          canProcessProcurement: perms.canProcessProcurement,
          canManageSalesTargets: perms.canManageSalesTargets,
          canManageAppraisals: perms.canManageAppraisals,
          canManageOnboarding: perms.canManageOnboarding,
          canSeeAllActivity: perms.canSeeAllActivity,
        }}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gold/30 bg-white/70 px-4 py-2 backdrop-blur-xl">
          <BackButton />
          <span className="text-xs text-gray-500">Luxaeon Spaces · Business OS</span>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 page-enter">{children}</main>
      </div>
    </div>
  );
}
