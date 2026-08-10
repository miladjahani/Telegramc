import type { Api } from 'telegram';
import { isEncryptedName } from './crypto';

export function getFileName(m: Api.Message): string {
  if (m.document) {
    const a = m.document.attributes.find((x: any) => x.className === 'DocumentAttributeFilename');
    if (a?.fileName) return a.fileName;
  }
  if (m.photo) return `photo_${m.id}.jpg`;
  if (m.video) return `video_${m.id}.mp4`;
  if (m.audio) return `audio_${m.id}.mp3`;
  if (m.voice) return `voice_${m.id}.ogg`;
  return `file_${m.id}`;
}

export const getFileSize = (m: Api.Message): number => (m.document ? Number(m.document.size) || 0 : 0);
export const isEncrypted = (m: Api.Message) => isEncryptedName(getFileName(m));

export function getFileCategory(m: Api.Message): 'image' | 'video' | 'audio' | 'archive' | 'doc' {
  if (isEncrypted(m)) return 'doc';
  if (m.photo) return 'image';
  if (m.video) return 'video';
  if (m.audio || m.voice) return 'audio';
  if (m.document) {
    const mime = m.document.mimeType || '';
    const n = getFileName(m).toLowerCase();
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('7z') || n.endsWith('.zip') || n.endsWith('.rar')) return 'archive';
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
  }
  return 'doc';
}