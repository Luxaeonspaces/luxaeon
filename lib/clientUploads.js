/**
 * Uploads a file straight from the browser to Cloudinary, bypassing Vercel's
 * 4.5MB serverless function body limit entirely — the file never passes
 * through our own API route. Three steps:
 *   1. Ask our server for a signature (tiny JSON, no file)
 *   2. POST the file directly to Cloudinary using that signature
 *   3. Tell our server the upload succeeded, so it can save the DB row
 *      (tiny JSON again, no file)
 *
 * Usage:
 *   await uploadFile({
 *     file,
 *     kind: "procurement",       // procurement | outflow | finance | employee | client | project
 *     procurementId: "...",      // whichever id(s) that kind needs
 *     category, description,     // optional metadata
 *   });
 */
export async function uploadFile({
  file,
  kind = "project",
  procurementId,
  outflowId,
  transactionId,
  userId,
  projectCode,
  accessCode,
  uploadedByRole,
  uploadedBy,
  category,
  description,
}) {
  if (!file) throw new Error("No file selected");

  // 1. Get a signature for this specific upload
  const sigRes = await fetch("/api/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      procurementId,
      outflowId,
      transactionId,
      userId,
      projectCode,
      accessCode,
      uploadedByRole,
      fileName: file.name,
      fileSize: file.size,
    }),
  });
  
  const sig = await sigRes.json();
  if (!sigRes.ok) throw new Error(sig.error || "Could not prepare upload");

  // 2. Upload the file straight to Cloudinary — never touches our server
  const cloudForm = new FormData();
  cloudForm.append("file", file);
  cloudForm.append("folder", sig.folder);
  cloudForm.append("public_id", sig.publicId);
  cloudForm.append("overwrite", "true");
  cloudForm.append("timestamp", String(sig.timestamp));
  cloudForm.append("api_key", sig.apiKey);
  cloudForm.append("signature", sig.signature);

  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`, {
    method: "POST",
    body: cloudForm,
  });
  if (!cloudRes.ok) {
    const body = await cloudRes.text().catch(() => "");
    throw new Error(`Upload to Cloudinary failed: ${body.slice(0, 200)}`);
  }

  // 3. Record the document in our database
  const completeRes = await fetch("/api/upload-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      filename: sig.filename,
      originalName: file.name,
      category,
      description,
      procurementId,
      outflowId,
      transactionId,
      userId,
      projectCode,
      uploadedByRole,
      uploadedBy,
    }),
  });
  const completed = await completeRes.json();
  if (!completeRes.ok) throw new Error(completed.error || "Upload succeeded but saving the record failed");

  return completed; // { ok, id, filename }
}