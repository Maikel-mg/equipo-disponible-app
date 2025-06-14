
import { Holiday } from "@/models/types";

export function exportToCSV(holidays: Holiday[], filename: string = "festivos.csv") {
  const headers = ["Nombre", "Fecha", "Tipo", "Obligatorio"];
  const csvRows = [
    headers.join(","),
    ...holidays.map(h =>
      [
        `"${h.name.replace(/"/g, '""')}"`,
        h.date,
        h.type,
        h.is_mandatory ? "Sí" : "No"
      ].join(",")
    )
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportToJSON(holidays: Holiday[], filename: string = "festivos.json") {
  const blob = new Blob([JSON.stringify(holidays, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
