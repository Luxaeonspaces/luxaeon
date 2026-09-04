import { prisma } from "@/lib/prisma";

export default async function PayslipsTable({ userId }) {
  const payrolls = await prisma.payrollRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 font-semibold text-brown">Recent payslips</div>
      <table className="w-full text-left text-sm">
        <thead className="bg-whitesmoke text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Period</th>
            <th className="px-4 py-2">Net</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((pay) => (
            <tr key={pay.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{pay.period}</td>
              <td className="px-4 py-2">₦{pay.netPay.toLocaleString()}</td>
              <td className="px-4 py-2">{pay.status}</td>
            </tr>
          ))}
          {payrolls.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                No payslips yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}