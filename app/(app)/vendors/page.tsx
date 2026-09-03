import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { addVendor } from "./actions";
import { unstable_cache } from "next/cache";

const getVendors = unstable_cache(
  async () => prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ["vendors-list"],
  { tags: ["vendors"] }
);

export default async function VendorsPage({ searchParams }: { searchParams?: { ok?: string; created?: string; error?: string } }) {
  await requireUser();
  const vendors = await getVendors();

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
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-t border-gold/20">
                <td className="px-4 py-2">{v.name}</td>
                <td className="px-4 py-2">{v.category}</td>
                <td className="px-4 py-2">{v.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}