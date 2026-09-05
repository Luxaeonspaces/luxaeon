export default function LeaveMessages({ error, ok }) {
  return (
    <>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {ok && (
        <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-burgundy">
          {ok}
        </p>
      )}
    </>
  );
}