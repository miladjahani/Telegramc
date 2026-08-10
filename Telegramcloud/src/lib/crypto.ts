/**
 * 🔐 رمزگذاری پرمیوم — AES-256-GCM با کلید مشتق‌شده از PBKDF2
 * فرمت خروجی: [4بایت طول هدر][هدر JSON][متن رمزنگاری‌شده] → .tdenc2
 */

const ITER = 150000;

async function deriveKey(pass: string, salt: Uint8Array): Promise<CryptoKey> {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as any, iterations: ITER, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBlob(blob: Blob, pass: string, originalName: string): Promise<Blob> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as any }, key, await blob.arrayBuffer());
  const header = new TextEncoder().encode(JSON.stringify({
    v: 2, alg: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iter: ITER,
    salt: Array.from(salt), iv: Array.from(iv),
    name: originalName, type: blob.type || 'application/octet-stream',
  }));
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, header.length, true);
  return new Blob([len, header, new Uint8Array(ct)], { type: 'application/octet-stream' });
}

export async function decryptBlob(blob: Blob, pass: string): Promise<{ blob: Blob; name: string; type: string }> {
  const ab = await blob.arrayBuffer();
  const dv = new DataView(ab);
  const hlen = dv.getUint32(0, true);
  const header = JSON.parse(new TextDecoder().decode(new Uint8Array(ab, 4, hlen)));
  const ct = ab.slice(4 + hlen);
  const key = await deriveKey(pass, new Uint8Array(header.salt));
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(header.iv) as any }, key, ct);
    return { blob: new Blob([pt], { type: header.type }), name: header.name, type: header.type };
  } catch {
    throw new Error('رمز عبور اشتباه است');
  }
}

export const isEncryptedName = (n: string) => n.endsWith('.tdenc2');