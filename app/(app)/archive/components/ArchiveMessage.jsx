export default function ArchiveMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      {message}
    </p>
  );
}