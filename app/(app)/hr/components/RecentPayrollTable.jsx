import { prisma } from "@/lib/prisma";

export default async function RecentPayrollTable() {
  const payrolls = await prisma.payrollRecord.findMany({ orderBy: { createdAt: "desc" }, take: 30 });

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <span className="font-semibold text-brown">Recent payroll</span>
        <a href="/api/export/payroll" className="text-sm font-semibold text-brown underline">
          Download payroll Excel
        </a>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Employee</th>
            <th className="px-4 py-2">Period</th>
            <th className="px-4 py-2">Net</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((p) => (
            <tr key={p.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{p.employeeName}</td>
              <td className="px-4 py-2">{p.period}</td>
              <td className="px-4 py-2">₦{p.netPay.toLocaleString()}</td>
              <td className="px-4 py-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}