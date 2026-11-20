import { useMemo } from 'react';

const MAX_BLOB_CACHE_ENTRIES = 120;
const base64ToBlobUrlCache = new Map<string, string>();

function dataUrlToBlob(dataUrl: string): Blob | null {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return null;

  const header = dataUrl.slice(0, commaIdx);
  const base64Data = dataUrl.slice(commaIdx + 1);
  if (!base64Data) return null;

  const mimeMatch = header.match(/data:([^;]+);base64/i);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  try {
    const binaryStr = atob(base64Data);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  } catch {
    return null;
  }
}

/**
 * Converts heavy Base64 data URLs once into lightweight cached Blob Object URLs
 * so sliders, thumbnails, and lightboxes share a single binary reference in RAM
 * instead of duplicating large Base64 strings in DOM attributes.
 */
export function getOptimizedImageSrc(rawSrc: string): string {
  const src = (rawSrc || '').trim();
  if (!src) return '';

  if (
    !src.startsWith('data:image/') ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function' ||
    typeof atob !== 'function'
  ) {
    return src;
  }

  const cached = base64ToBlobUrlCache.get(src);
  if (cached) {
    // Refresh LRU order
    base64ToBlobUrlCache.delete(src);
    base64ToBlobUrlCache.set(src, cached);
    return cached;
  }

  const blob = dataUrlToBlob(src);
  if (!blob) return src;

  const objectUrl = URL.createObjectURL(blob);
  base64ToBlobUrlCache.set(src, objectUrl);

  // Evict oldest cached Blob URL when exceeding bounded cache limit
  if (base64ToBlobUrlCache.size > MAX_BLOB_CACHE_ENTRIES) {
    const oldestKey = base64ToBlobUrlCache.keys().next().value;
    if (oldestKey) {
      const oldestUrl = base64ToBlobUrlCache.get(oldestKey);
      base64ToBlobUrlCache.delete(oldestKey);
      if (oldestUrl) {
        try {
          URL.revokeObjectURL(oldestUrl);
        } catch {
          // ignore revoke error
        }
      }
    }
  }

  return objectUrl;
}

export function useOptimizedImages(rawImages: string[]): string[] {
  const cacheSignature = rawImages
    .map((src) => `${src.length}:${src.slice(0, 32)}:${src.slice(-16)}`)
    .join('|');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => rawImages.map((src) => getOptimizedImageSrc(src)), [cacheSignature]);
}
