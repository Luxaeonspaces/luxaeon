export default function ReadOnlyField({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-gold/20 bg-white/50 px-3 py-2">
      <div className="text-xs text-gray-500">
        {label}
      </div>

      <div className="font-medium text-gray-800">
        {value || "—"}
      </div>
    </div>
  );
}