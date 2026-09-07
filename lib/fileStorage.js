import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const present = [cloudName, apiKey, apiSecret].filter(Boolean).length;
  if (present === 0) return null; // genuinely not configured — local dev fallback is fine
  if (present < 3) {
    const missing = [
      !cloudName && "CLOUDINARY_CLOUD_NAME",
      !apiKey && "CLOUDINARY_API_KEY",
      !apiSecret && "CLOUDINARY_API_SECRET",
    ].filter(Boolean);
    throw new Error(
      `Cloudinary is partially configured — missing ${missing.join(", ")}. ` +
        `This is almost always a typo'd env var name, not intentional. ` +
        `Fix it or unset all three to use local-disk storage in dev.`
    );
  }

  const folder = process.env.CLOUDINARY_FOLDER || "luxaeon";
  return { cloudName, apiKey, apiSecret, folder };
}

function signParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
}

export async function storeFile(subdir, filename, data) {
  const filePath = `${subdir}/${filename}`;
  const cfg = cloudinaryConfig();

  if (cfg) {
    const folder = `${cfg.folder}/${subdir}`;
    const publicId = filename.replace(/\.[^./]+$/, "");
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { folder, public_id: publicId, overwrite: "true", timestamp: String(timestamp) };
    const signature = signParams(paramsToSign, cfg.apiSecret);

    const form = new FormData();
    form.append("file", new Blob([data]), filename);
    form.append("folder", folder);
    form.append("public_id", publicId);
    form.append("overwrite", "true");
    form.append("timestamp", String(timestamp));
    form.append("api_key", cfg.apiKey);
    form.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/raw/upload`, {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Cloudinary upload failed (${response.status}): ${body}`);
    }
    return filePath;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "File storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  const dir = path.join(process.cwd(), "storage", subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), data);
  return filePath;
}

export async function retrieveFile(subdir, filename) {
  const cfg = cloudinaryConfig();
  if (cfg) {
    const publicId = `${cfg.folder}/${subdir}/${filename}`.replace(/\.[^./]+$/, "");
    const url = `https://res.cloudinary.com/${cfg.cloudName}/raw/upload/${publicId}${extOf(filename)}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  }

  try {
    return await readFile(path.join(process.cwd(), "storage", subdir, filename));
  } catch {
    return null;
  }
}

function extOf(filename) {
  const i = filename.lastIndexOf(".");
  return i === -1 ? "" : filename.slice(i);
}