import { getSession, storeSession } from './storage';
import type { Api } from 'telegram';

let client: any = null;
let cfg: { apiId: number; apiHash: string } | null = null;
let mods: { TG: any; SS: any } | null = null;
const thumbCache = new Map<number, string>();

async function loadMods() {
  if (!mods) {
    const TG = await import('telegram');
    const SS = await import('telegram/sessions');
    mods = { TG, SS };
  }
  return mods;
}

const resolveEntity = (e: any) => (e === 'saved-messages' || e === 'self' ? 'me' : e);
const mimeOf = (m: any) => m.document?.mimeType || (m.photo ? 'image/jpeg' : m.video ? 'video/mp4' : m.audio ? 'audio/mpeg' : 'application/octet-stream');
const toBlob = (b: any, mime: string) => new Blob([(b instanceof Uint8Array ? b : new Uint8Array(b)) as any], { type: mime });

export interface TelegramConfig { apiId: number; apiHash: string; }

export async function initClient(config: TelegramConfig): Promise<any> {
  const { TG, SS } = await loadMods();
  cfg = config;
  const s = new SS.StringSession(getSession() || '');
  client = new TG.TelegramClient(s, config.apiId, config.apiHash, { connectionRetries: 5 });
  await client.connect();
  storeSession(client.session.save());
  return client;
}

export async function sendCode(phone: string) {
  if (!client || !cfg) throw new Error('Client not initialized');
  const r = await client.sendCode({ apiId: cfg.apiId, apiHash: cfg.apiHash }, phone);
  return { phoneCodeHash: r.phoneCodeHash };
}

export async function signIn(phone: string, code: string, phoneCodeHash: string): Promise<boolean> {
  if (!client) throw new Error('Client not initialized');
  const { TG } = await loadMods();
  try {
    await client.invoke(new TG.Api.auth.SignIn({ phoneNumber: phone, phoneCodeHash, phoneCode: code }));
    storeSession(client.session.save());
    return true;
  } catch (err: any) {
    if (err?.errorMessage === 'SESSION_PASSWORD_NEEDED') throw new Error('2FA_REQUIRED');
    throw err;
  }
}

export async function checkPassword(password: string): Promise<boolean> {
  if (!client) throw new Error('Client not initialized');
  const { TG } = await loadMods();
  const info = await client.invoke(new TG.Api.account.GetPassword());
  const check = await client.computeCheck(info, password);
  await client.invoke(new TG.Api.auth.CheckPassword({ password: check }));
  storeSession(client.session.save());
  return true;
}

export async function getMe(): Promise<any> {
  if (!client) throw new Error('Not connected');
  return await client.getMe();
}

export async function getMessages(entity: any, limit = 100): Promise<Api.Message[]> {
  if (!client) throw new Error('Not connected');
  return (await client.getMessages(resolveEntity(entity), { limit })) as Api.Message[];
}

export async function getChannels(): Promise<any[]> {
  if (!client) return [];
  try {
    const res: any = await client.getDialogs({ limit: 100 });
    return (res.dialogs || [])
      .filter((d: any) => d.entity && /Channel/.test(d.entity.className))
      .map((d: any) => ({ entity: d.entity, title: d.entity.title || 'کانال', id: Number(d.entity.id) }));
  } catch { return []; }
}

export async function getDialogs(): Promise<any[]> {
  if (!client) throw new Error('Not connected');
  const res: any = await client.getDialogs({ limit: 50 });
  return (res.dialogs || []).filter((d: any) => d.entity).map((d: any) => {
    const e = d.entity;
    return { entity: e, title: e.title || [e.firstName, e.lastName].filter(Boolean).join(' ') || 'Unknown' };
  });
}

export async function forwardMessage(ids: number[], peer: any): Promise<void> {
  if (!client) throw new Error('Not connected');
  await client.forwardMessages(peer, { messages: ids, fromPeer: 'me' });
}

export async function downloadMedia(message: any, onProgress?: (p: number) => void): Promise<Blob> {
  if (!client || !message.media) throw new Error('No media');
  const { TG } = await loadMods();
  const mime = mimeOf(message);
  const progress = (d: any, t: any) => { if (onProgress && t) onProgress(Math.min(100, Math.round((Number(d) / Number(t)) * 100))); };
  try {
    const b: any = await client.downloadMedia(message, { progressCallback: progress });
    if (b) return toBlob(b, mime);
  } catch { /* fallback */ }
  let loc: any = null; let dcId: number | undefined; let fileSize: number | undefined;
  try {
    if (message.photo?.sizes?.length) {
      const s = message.photo.sizes[message.photo.sizes.length - 1];
      loc = new TG.Api.InputFileLocation({ volumeId: s.location.volumeId, localId: s.location.localId, secret: s.location.secret, fileReference: s.location.fileReference });
      dcId = message.photo.dcId; fileSize = s.size ? Number(s.size) : undefined;
    } else if (message.document) {
      loc = new TG.Api.InputDocumentFileLocation({ id: message.document.id, accessHash: message.document.accessHash, fileReference: message.document.fileReference, thumbSize: '' });
      dcId = message.document.dcId; fileSize = Number(message.document.size) || undefined;
    }
  } catch { loc = null; }
  if (loc) {
    const b: any = await client.downloadFile(loc, { dcId, fileSize, progressCallback: progress });
    if (b) return toBlob(b, mime);
  }
  throw new Error('Download failed');
}

export async function downloadThumb(message: any): Promise<string | null> {
  if (!client || !message.media) return null;
  if (thumbCache.has(message.id)) return thumbCache.get(message.id)!;
  try {
    let b: any = null;
    if (message.photo) b = await client.downloadMedia(message, { size: 's' } as any);
    else if (message.document && (message.video || message.document.mimeType?.startsWith('image/'))) b = await client.downloadMedia(message, { thumb: 0 } as any);
    if (!b) return null;
    const url = URL.createObjectURL(toBlob(b, 'image/jpeg'));
    thumbCache.set(message.id, url);
    return url;
  } catch { return null; }
}

export async function uploadFile(file: File, entity: any = 'me', onProgress?: (p: number) => void): Promise<any> {
  if (!client) throw new Error('Not connected');
  return await client.sendFile(resolveEntity(entity), {
    file, caption: file.name, forceDocument: true,
    progressCallback: (d: any, t: any) => { if (onProgress && t) onProgress(Math.min(100, Math.round((Number(d) / Number(t)) * 100))); },
  });
}

export async function deleteMessages(entity: any, ids: number[]): Promise<void> {
  if (!client) throw new Error('Not connected');
  await client.deleteMessages(resolveEntity(entity), ids, { revoke: true });
}

export async function logout(): Promise<void> {
  if (client) {
    try { const { TG } = await loadMods(); await client.invoke(new TG.Api.auth.LogOut()); } catch {}
    await client.disconnect();
    client = null;
  }
  localStorage.removeItem('tg_session');
  localStorage.removeItem('tg_api_credentials');
}

export const isConnected = () => !!client && !!client.connected;