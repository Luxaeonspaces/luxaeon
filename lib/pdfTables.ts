/**
 * Dynamic table rendering for pdf-lib
 */
import { PDFPage, PDFFont, rgb, RGB } from "pdf-lib";

export type PdfTableColumn = {
  key: string;
  label: string;
  width: number; // relative weight or absolute points
  align?: "left" | "right" | "center";
};

export type PdfTableRow = Record<string, string | number>;

const BURGUNDY = rgb(0.36, 0.1, 0.11);
const GOLD = rgb(0.79, 0.66, 0.43);
const DARK = rgb(0.12, 0.12, 0.12);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT = rgb(0.96, 0.94, 0.9);

export function drawDynamicTable(
  page: PDFPage,
  opts: {
    x: number;
    y: number;
    width: number;
    columns: PdfTableColumn[];
    rows: PdfTableRow[];
    font: PDFFont;
    bold: PDFFont;
    fontSize?: number;
    headerBg?: RGB;
  }
): number {
  const {
    x,
    width,
    columns,
    rows,
    font,
    bold,
    fontSize = 9,
    headerBg = LIGHT,
  } = opts;
  let y = opts.y;

  const totalWeight = columns.reduce((a, c) => a + c.width, 0);
  const colWidths = columns.map((c) => (c.width / totalWeight) * width);

  const rowHeight = fontSize + 10;

  // Header
  page.drawRectangle({
    x,
    y: y - 4,
    width,
    height: rowHeight,
    color: headerBg,
  });
  page.drawLine({
    start: { x, y: y - 4 },
    end: { x: x + width, y: y - 4 },
    thickness: 0.8,
    color: GOLD,
  });

  let cx = x + 4;
  columns.forEach((col, i) => {
    const w = colWidths[i];
    const text = col.label;
    let tx = cx;
    const tw = bold.widthOfTextAtSize(text, fontSize);
    if (col.align === "right") tx = cx + w - tw - 8;
    else if (col.align === "center") tx = cx + (w - tw) / 2;
    page.drawText(text, {
      x: Math.max(cx, tx),
      y: y + 2,
      size: fontSize,
      font: bold,
      color: BURGUNDY,
    });
    cx += w;
  });
  y -= rowHeight + 2;

  // Body rows
  rows.forEach((row, rowIndex) => {
    if (y < 70) return;
    if (rowIndex % 2 === 1) {
      page.drawRectangle({
        x,
        y: y - 4,
        width,
        height: rowHeight,
        color: rgb(0.99, 0.98, 0.96),
      });
    }
    cx = x + 4;
    columns.forEach((col, i) => {
      const w = colWidths[i];
      const text = String(row[col.key] ?? "");
      let tx = cx;
      const tw = font.widthOfTextAtSize(text, fontSize);
      if (col.align === "right") tx = cx + w - tw - 8;
      else if (col.align === "center") tx = cx + (w - tw) / 2;
      // clip long text
      let display = text;
      while (font.widthOfTextAtSize(display, fontSize) > w - 10 && display.length > 3) {
        display = display.slice(0, -4) + "…";
      }
      page.drawText(display, {
        x: Math.max(cx, tx),
        y: y + 2,
        size: fontSize,
        font,
        color: DARK,
      });
      cx += w;
    });
    y -= rowHeight;
  });

  // Bottom rule
  page.drawLine({
    start: { x, y: y + 4 },
    end: { x: x + width, y: y + 4 },
    thickness: 0.6,
    color: GOLD,
  });

  return y;
}

export const INVOICE_COLUMNS: PdfTableColumn[] = [
  { key: "description", label: "Description", width: 3 },
  { key: "qty", label: "Qty", width: 0.6, align: "center" },
  { key: "unitPrice", label: "Unit Price (₦)", width: 1.2, align: "right" },
  { key: "amount", label: "Amount (₦)", width: 1.2, align: "right" },
];
