import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from '../config';

const s = config.storage;

/** True once R2 credentials + bucket + public URL are all configured. */
export const storageEnabled = Boolean(
  s.r2AccountId && s.r2AccessKeyId && s.r2SecretAccessKey && s.r2Bucket && s.r2PublicBaseUrl,
);

const client = storageEnabled
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${s.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: s.r2AccessKeyId, secretAccessKey: s.r2SecretAccessKey },
    })
  : null;

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

export const ALLOWED_IMAGE_TYPES = Object.keys(EXT_BY_TYPE);

/**
 * Upload an image buffer to R2 and return its public URL + storage key. The key
 * is random (no user input) under a `portfolio/` prefix. Throws if storage is
 * not configured — callers should check `storageEnabled` first.
 */
export async function uploadImage(
  buffer: Buffer,
  contentType: string,
): Promise<{ url: string; key: string }> {
  if (!client) throw new Error('Storage not configured');
  const ext = EXT_BY_TYPE[contentType] ?? 'bin';
  const key = `portfolio/${randomUUID()}.${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: s.r2Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  return { url: `${s.r2PublicBaseUrl}/${key}`, key };
}

/** Best-effort delete of a previously uploaded object (ignores failures). */
export async function deleteImage(key: string): Promise<void> {
  if (!client || !key) return;
  try {
    await client.send(new DeleteObjectCommand({ Bucket: s.r2Bucket, Key: key }));
  } catch (err) {
    console.error('[JUNO][storage] delete failed', key, err);
  }
}
