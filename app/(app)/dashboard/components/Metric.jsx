export default function Metric({ label, value }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="font-display text-2xl font-bold tracking-tight text-brown">{value}</div>
      <div className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}