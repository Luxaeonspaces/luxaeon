import { requireUser } from "@/lib/session";
import { addVendor } from "./actions";
import { Suspense } from "react";
import VendorsTable from "./_components/VendorsTable";

function TableSkeleton() {
  return (
    <div className="glass-card h-40 animate-pulse p-4">
      <div className="h-3 w-24 rounded bg-gray-200" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default async function VendorsPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  await requireUser();

  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Vendors</h1>
      </div>
      <form key={searchParams?.ok || "vendor"} action={addVendor} className="glass-card grid gap-3 p-5 md:grid-cols-3">
        <input name="name" className="input" placeholder="Name *" required />
        <input name="category" className="input" placeholder="Category" />
        <input name="phone" className="input" placeholder="Phone" />
        <button type="submit" className="btn-primary md:col-span-3">
          Add vendor
        </button>
      </form>
      <Suspense fallback={<TableSkeleton />}>
        <VendorsTable />
      </Suspense>
    </div>
  );
}