import Link from "next/link";

export default function ReportsAccessDenied() {
  return (
    <div className="space-y-6">
      <div className="main-header">
        <h1 className="relative z-10 font-display text-2xl font-semibold">Reports</h1>
      </div>
      <div className="glass-card p-8 text-center">
        <p className="text-lg font-semibold text-brown">Can&apos;t access data</p>
        <p className="mt-2 text-sm text-gray-600">
          You do not have access to reports. Contact the Founder or IT.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-brown underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}