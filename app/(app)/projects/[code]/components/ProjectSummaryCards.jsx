export default function ProjectSummaryCards({ project, balance, progress }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Stage</div>
          <div className="font-display text-lg font-bold text-brown">{project.stage}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Design fee</div>
          <div className="font-display text-lg font-bold text-brown">₦{(project.designFee || 0).toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Paid</div>
          <div className="font-display text-lg font-bold text-brown">₦{(project.amountPaid || 0).toLocaleString()}</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-xs uppercase text-gray-500">Balance</div>
          <div className="font-display text-lg font-bold text-brown">₦{balance.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Pipeline progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-whitesmoke">
          <div className="h-full rounded-full bg-brown" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </>
  );
}