import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "luxaeon-files";

function supabaseStorageUrl(filePath: string) {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  return { url: `${base}/storage/v1/object/${bucket}/${filePath}`, key };
}

export async function storeFile(subdir: string, filename: string, data: Buffer) {
  const filePath = `${subdir}/${filename}`;
  const remote = supabaseStorageUrl(filePath);
  if (remote) {
    const bucketResponse = await fetch(`${process.env.SUPABASE_URL?.replace(/\/$/, "")}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${remote.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: bucket, name: bucket, public: false }),
    });
    if (!bucketResponse.ok && bucketResponse.status !== 409) {
      throw new Error(`Supabase Storage bucket setup failed (${bucketResponse.status})`);
    }
    const response = await fetch(remote.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${remote.key}`,
        "Content-Type": "application/octet-stream",
        "x-upsert": "true",
      },
      body: new Uint8Array(data),
    });
    if (!response.ok) {
      throw new Error(`Supabase Storage upload failed (${response.status})`);
    }
    return filePath;
  }

  if (process.env.VERCEL) {
    throw new Error("File storage is not configured. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and create the luxaeon-files bucket in Supabase.");
  }

  const dir = path.join(process.cwd(), "storage", subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), data);
  return filePath;
}

export async function retrieveFile(subdir: string, filename: string) {
  const remote = supabaseStorageUrl(`${subdir}/${filename}`);
  if (remote) {
    const response = await fetch(remote.url, {
      headers: { Authorization: `Bearer ${remote.key}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  }

  try {
    return await readFile(path.join(process.cwd(), "storage", subdir, filename));
  } catch {
    return null;
  }
}
