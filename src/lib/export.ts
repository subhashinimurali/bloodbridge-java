/** Report export helpers: CSV, Excel (.xls) and PDF via the browser print dialog. */

export type Row = Record<string, string | number | null | undefined>;

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(rows: Row[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  download(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportExcel(rows: Row[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>
<table border="1"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${rows
    .map((r) => `<tr>${headers.map((h) => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></body></html>`;
  download(html, `${filename}.xls`, "application/vnd.ms-excel");
}

/** Opens the browser print dialog — users choose "Save as PDF". */
export function exportPdf() {
  window.print();
}
