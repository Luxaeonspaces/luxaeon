/** Excel-friendly CSV (opens in Excel) with BOM for ₦ and names */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

export function csvResponse(filename: string, rows: (string | number | null | undefined)[][]) {
  const body = toCsv(rows);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
