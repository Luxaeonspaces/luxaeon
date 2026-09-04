import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getVendors = unstable_cache(
  async () => prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ["vendors-list"],
  { tags: ["vendors"] }
);

export default async function VendorsTable() {
  const vendors = await getVendors();

  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{v.name}</td>
              <td className="px-4 py-2">{v.category}</td>
              <td className="px-4 py-2">{v.phone}</td>
            </tr>
          ))}
          {vendors.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                No vendors yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}