import { getPayrolls } from "./my-space-data";

export default async function PayrollSection({ userId }) {
  const payrolls = await getPayrolls(userId);

  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-gold/30 px-4 py-3 font-semibold text-burgundy">
        My payroll (view only)
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-cream/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Basic</th>
              <th className="px-4 py-2">Net</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {payrolls.map((payroll) => (
              <tr
                key={payroll.id}
                className="border-t border-gold/20"
              >
                <td className="px-4 py-2">
                  {payroll.period}
                </td>

                <td className="px-4 py-2">
                  ₦{payroll.basicSalary.toLocaleString()}
                </td>

                <td className="px-4 py-2">
                  ₦{payroll.netPay.toLocaleString()}
                </td>

                <td className="px-4 py-2">
                  {payroll.status}
                </td>
              </tr>
            ))}

            {payrolls.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No payslips yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}