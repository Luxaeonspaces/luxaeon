function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Given an upload "kind" and its related IDs, returns the storage subdir and
 * a unique safe filename — matching exactly what /api/upload has always
 * generated, so switching a component to the direct-upload flow later never
 * changes where files land or how they're named.
 */
export function resolveUploadTarget({ kind, procurementId, outflowId, transactionId, userId, projectCode, fileName }) {
  const safe = sanitize(fileName);
  const now = Date.now();

  switch (kind) {
    case "procurement":
      return { subdir: "procurement_docs", filename: `PROC_${procurementId}_${now}_${safe}` };
    case "outflow":
      return { subdir: "outflow_docs", filename: `OUT_${outflowId}_${now}_${safe}` };
    case "finance":
      return { subdir: "finance_docs", filename: `FIN_${transactionId}_${now}_${safe}` };
    case "employee":
      return { subdir: "hr_docs", filename: `HR_${userId}_${now}_${safe}` };
    case "client":
      return { subdir: "client_docs", filename: `${projectCode}_${now}_${safe}` };
    default:
      return { subdir: "uploads", filename: `${projectCode}_${now}_${safe}` };
  }
}