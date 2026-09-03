import Link from "next/link";

export default function ReportCard({ href, title, desc, active }) {
  return (
    <Link
      href={href}
      className={`glass-card block p-5 transition hover:shadow-md ${active ? "ring-2 ring-brown/40" : ""}`}
    >
      <h2 className="font-display font-semibold text-brown">{title}</h2>
      <p className="mt-1 text-xs text-gray-500">{desc}</p>
    </Link>
  );
}