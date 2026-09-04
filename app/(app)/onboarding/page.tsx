import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import StartOnboardingForm from "./components/StartOnboardingForm";
import OnboardingChecklistList from "./components/OnboardingChecklistList";

function FormSkeleton() {
  return <div className="glass-card h-16 animate-pulse" />;
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass-card h-40 animate-pulse p-5">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-3 h-2 w-full rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default async function OnboardingPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  const { perms } = await requireUser();
  if (!perms.canManageOnboarding) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Employee Onboarding</h1>
        <p className="relative z-10 text-sm text-white/80">Checklist workflow for new hires</p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <StartOnboardingForm formKey={searchParams?.ok || "onboard"} />
      </Suspense>

      <Suspense fallback={<ListSkeleton />}>
        <OnboardingChecklistList />
      </Suspense>
    </div>
  );
}