import * as XLSX from "xlsx";

export function exportRowsToExcel(filename, columns, rows) {
  const data = rows.map((row) => {
    const obj = {};
    columns.forEach((col) => {
      obj[col.label] = col.format ? col.format(row) : (row[col.key] ?? "");
    });
    return obj;
  });
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "報表");
  XLSX.writeFile(workbook, filename);
}
