import { getTransactions } from "./finance-data";

export default async function FinanceSummary() {
  const transactions = await getTransactions();

  const income = transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "Expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const net = income - expenses;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="glass-card p-4 text-center">
        <div className="text-xs uppercase text-gray-500">
          Income
        </div>

        <div className="font-display text-2xl font-bold text-burgundy">
          ₦{income.toLocaleString()}
        </div>
      </div>

      <div className="glass-card p-4 text-center">
        <div className="text-xs uppercase text-gray-500">
          Expenses
        </div>

        <div className="font-display text-2xl font-bold text-burgundy">
          ₦{expenses.toLocaleString()}
        </div>
      </div>

      <div className="glass-card p-4 text-center">
        <div className="text-xs uppercase text-gray-500">
          Net
        </div>

        <div className="font-display text-2xl font-bold text-burgundy">
          ₦{net.toLocaleString()}
        </div>
      </div>
    </div>
  );
}