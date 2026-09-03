export function formatWAT(date) {
  return `${new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(date)} WAT`;
}