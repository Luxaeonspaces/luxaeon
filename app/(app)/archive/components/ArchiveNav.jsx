import Link from "next/link";

export default function ArchiveNav() {
  return (
    <nav
      aria-label="Project views"
      className="flex max-w-full overflow-x-auto border-b border-gold/30"
    >
      <Link
        href="/projects"
        className="shrink-0 border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-gray-500 transition hover:border-gold hover:text-burgundy"
      >
        Active Projects
      </Link>

      <Link
        href="/archive"
        className="shrink-0 border-b-2 border-burgundy px-4 py-3 text-sm font-semibold text-burgundy"
        aria-current="page"
      >
        Project Archives
      </Link>
    </nav>
  );
}