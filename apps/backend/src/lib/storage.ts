import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "evidence";

let _supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  _supabase = createClient(supabaseUrl, supabaseKey);
}

export function getSupabase(): SupabaseClient | null {
  return _supabase;
}

export type SupportedMimeType = "image/jpeg" | "image/png" | "image/webp";

/**
 * Validates the file buffer magic bytes to ensure it is genuinely JPEG, PNG, or WebP.
 */
export function verifyImageSignature(buffer: Buffer): { valid: boolean; mimeType?: SupportedMimeType; extension?: string } {
  if (buffer.length < 12) {
    return { valid: false };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: "image/jpeg", extension: "jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: "image/png", extension: "png" };
  }

  // WebP: 'RIFF' at 0..3 and 'WEBP' at 8..11
  const riff = buffer.toString("ascii", 0, 4);
  const webp = buffer.toString("ascii", 8, 12);
  if (riff === "RIFF" && webp === "WEBP") {
    return { valid: true, mimeType: "image/webp", extension: "webp" };
  }

  return { valid: false };
}

/**
 * Uploads evidence image to Supabase Storage bucket 'evidence' at cases/{caseId}/{uuid}.{ext}
 */
export async function uploadEvidenceFile(
  caseId: number,
  buffer: Buffer,
  originalFilename: string,
): Promise<{ storagePath: string; mimeType: string; sizeBytes: number }> {
  const { valid, mimeType, extension } = verifyImageSignature(buffer);
  if (!valid || !mimeType || !extension) {
    throw new Error("Invalid image file. Only JPEG, PNG, and WebP images are permitted.");
  }

  const uuid = crypto.randomUUID();
  const storagePath = `cases/${caseId}/${uuid}.${extension}`;
  const sizeBytes = buffer.length;

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase storage: ${error.message}`);
    }
  } else {
    // Local fallback if Supabase credentials are not provided
    const localDir = path.resolve(process.cwd(), "uploads", "cases", String(caseId));
    await fs.mkdir(localDir, { recursive: true });
    await fs.writeFile(path.resolve(localDir, `${uuid}.${extension}`), buffer);
  }

  return { storagePath, mimeType, sizeBytes };
}

/**
 * Generates a signed URL for an attachment (default: 60 seconds expiry)
 */
export async function createAttachmentSignedUrl(
  storagePath: string,
  expiresInSeconds = 60,
): Promise<{ url: string; expires_in: number }> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to generate signed URL: ${error?.message || "Unknown error"}`);
    }

    return { url: data.signedUrl, expires_in: expiresInSeconds };
  }

  // Local fallback: return local endpoint URL
  return { url: `/api/attachments/raw/${encodeURIComponent(storagePath)}`, expires_in: expiresInSeconds };
}
