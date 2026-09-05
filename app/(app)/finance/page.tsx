import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

import FinanceHeader from "./components/FinanceHeader";
import FinanceSummary from "./components/FinanceSummary";
import FinanceSummarySkeleton from "./components/FinanceSummarySkeleton";
import TransactionColumn from "./components/TransactionColumn";
import TransactionColumnSkeleton from "./components/TransactionColumnSkeleton";

export default async function FinancePage() {
  const { perms } = await requireUser();

  if (!perms.canSeeFinance) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <FinanceHeader />

      <Suspense fallback={<FinanceSummarySkeleton />}>
        <FinanceSummary />
      </Suspense>

      <Suspense fallback={<TransactionColumnSkeleton />}>
        <TransactionColumn title="Income" type="Income" />
      </Suspense>

      <Suspense fallback={<TransactionColumnSkeleton />}>
        <TransactionColumn title="Expenses" type="Expense" />
      </Suspense>
    </div>
  );
}