import { CategoryId, Listing } from '../types';

export const MAX_IMAGES = 5;
export const MAX_IMAGE_KB = 280;
export const MAX_VIDEO_SECONDS = 60;
export const MAX_VIDEO_MB = 10;

export const MARKETPLACE_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbz4zqsfEDYc8JEGgoVpg4dPFv8v8jIZx2LFg6a2RLuUmT8pfVCqrtP-Nrm08CBHGare/exec';

export interface MediaImageItem {
  id: string;
  previewUrl: string;
  compressedDataUrl?: string;
  compressedSizeBytes?: number;
  file?: File;
  remoteUrl?: string;
  name: string;
}

export interface MediaVideoItem {
  id: string;
  previewUrl: string;
  file?: File;
  remoteUrl?: string;
  durationSeconds?: number;
  name: string;
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    let settled = false;

    const cleanup = () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Ignore revoke error
      }
      video.remove();
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('تعذر قراءة مدة الفيديو خلال الوقت المتوقع'));
    }, 6000);

    video.onloadedmetadata = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      cleanup();
      resolve(duration);
    };

    video.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(new Error('تعذر قراءة مدة الفيديو المحدد'));
    };

    video.src = objectUrl;
  });
}

export function formatVideoDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return '00:00';
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
}

async function compressImageToDataUrl(
  source: File | string,
  fallbackUrl: string,
  maxWidth = 900,
  quality = 0.78
): Promise<string> {
  // 1. If source is a File, try createImageBitmap first (fastest native decoder for mobile camera photos)
  if (typeof source !== 'string' && typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(source);
      const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl && dataUrl.startsWith('data:image/')) {
          return dataUrl;
        }
      } else {
        bitmap.close();
      }
    } catch {
      // Fall through to Image / FileReader decoders
    }
  }

  // 2. Try Image element via string URL or ObjectURL
  const tryImageCanvas = (): Promise<string> =>
    new Promise((resolve) => {
      let settled = false;
      let objectUrl = '';
      const finish = (result: string) => {
        if (settled) return;
        settled = true;
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // Ignore revoke error
          }
        }
        resolve(result);
      };

      const timer = setTimeout(() => finish(''), 6000);

      try {
        const srcUrl =
          typeof source === 'string' ? source : (objectUrl = URL.createObjectURL(source));
        const img = new Image();
        img.onload = () => {
          clearTimeout(timer);
          try {
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            const width = Math.max(1, Math.round(img.width * scale));
            const height = Math.max(1, Math.round(img.height * scale));
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              finish('');
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            finish(canvas.toDataURL('image/jpeg', quality));
          } catch {
            finish('');
          }
        };
        img.onerror = () => {
          clearTimeout(timer);
          finish('');
        };
        img.src = srcUrl;
      } catch {
        clearTimeout(timer);
        finish('');
      }
    });

  const fromImage = await tryImageCanvas();
  if (fromImage) return fromImage;

  if (typeof source === 'string') {
    return source.startsWith('data:image/') ? source : fallbackUrl;
  }

  // 3. Final fallback: FileReader
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = typeof reader.result === 'string' ? reader.result : '';
        if (!resultStr) {
          resolve(fallbackUrl);
          return;
        }
        const img = new Image();
        img.onload = () => {
          try {
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            const width = Math.max(1, Math.round(img.width * scale));
            const height = Math.max(1, Math.round(img.height * scale));
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(resultStr);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch {
            resolve(resultStr);
          }
        };
        img.onerror = () => resolve(fallbackUrl);
        img.src = resultStr;
      };
      reader.onerror = () => resolve(fallbackUrl);
      reader.readAsDataURL(source);
    } catch {
      resolve(fallbackUrl);
    }
  });
}

export async function prepareSelectedImage(
  file: File,
  maxWidth = 1280,
  quality = 0.82
): Promise<string> {
  return compressImageToDataUrl(file, '', maxWidth, quality);
}

export function estimateDataUrlByteSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  const commaIdx = dataUrl.indexOf(',');
  const base64Len = commaIdx >= 0 ? dataUrl.length - commaIdx - 1 : dataUrl.length;
  return Math.max(1, Math.floor(base64Len * 0.75));
}

function encodeImageToJpegDataUrl(
  source: ImageBitmap | HTMLImageElement,
  srcWidth: number,
  srcHeight: number,
  maxDimension: number,
  quality: number
): { dataUrl: string; byteSize: number } | null {
  const longestSide = Math.max(srcWidth, srcHeight);
  const scale = longestSide > maxDimension ? maxDimension / longestSide : 1;
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;

  const byteSize = estimateDataUrlByteSize(dataUrl);
  return { dataUrl, byteSize };
}

async function loadImageElementForCompression(
  source: File | string
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    let objectUrl = '';
    const img = new Image();
    const timer = setTimeout(() => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
      }
      resolve(null);
    }, 6000);

    img.onload = () => {
      clearTimeout(timer);
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
      }
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timer);
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
      }
      resolve(null);
    };

    try {
      img.src =
        typeof source === 'string' ? source : (objectUrl = URL.createObjectURL(source));
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

/**
 * High-clarity resize & JPEG compression before sending to database:
 * keeps image under 300 KB (default 280 KB target) while preserving crisp feather/bird detail.
 */
export async function compressImageToTargetSize(
  source: File | string,
  targetMaxBytes = MAX_IMAGE_KB * 1024
): Promise<{ dataUrl: string; byteSize: number } | null> {
  const steps: Array<[number, number]> = [
    [1280, 0.85],
    [1280, 0.78],
    [1080, 0.76],
    [960, 0.72],
    [840, 0.66],
    [720, 0.58],
    [600, 0.5],
    [480, 0.42],
    [360, 0.34],
  ];

  let chosen: { dataUrl: string; byteSize: number } | null = null;

  if (typeof source !== 'string' && typeof createImageBitmap === 'function') {
    try {
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' });
      } catch {
        bitmap = await createImageBitmap(source);
      }
      try {
        for (const [maxDim, quality] of steps) {
          const encoded = encodeImageToJpegDataUrl(
            bitmap,
            bitmap.width,
            bitmap.height,
            maxDim,
            quality
          );
          if (encoded && encoded.byteSize > 0) {
            if (!chosen || encoded.byteSize < chosen.byteSize) {
              chosen = encoded;
            }
            if (encoded.byteSize <= targetMaxBytes) {
              chosen = encoded;
              break;
            }
          }
        }
      } finally {
        bitmap.close();
      }
    } catch {
      chosen = null;
    }
  }

  if (!chosen) {
    const img = await loadImageElementForCompression(source);
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      for (const [maxDim, quality] of steps) {
        const encoded = encodeImageToJpegDataUrl(
          img,
          img.naturalWidth,
          img.naturalHeight,
          maxDim,
          quality
        );
        if (encoded && encoded.byteSize > 0) {
          if (!chosen || encoded.byteSize < chosen.byteSize) {
            chosen = encoded;
          }
          if (encoded.byteSize <= targetMaxBytes) {
            chosen = encoded;
            break;
          }
        }
      }
    }
  }

  return chosen;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIndex = result.indexOf(',');
      if (commaIndex === -1) {
        reject(new Error('تعذر تحويل ملف الفيديو إلى Base64'));
        return;
      }
      resolve(result.slice(commaIndex + 1));
    };
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الفيديو المحدد'));
    reader.readAsDataURL(blob);
  });
}

async function compressVideoForUpload(
  file: File,
  onProgress?: (status: string) => void
): Promise<{ blob: Blob; mimeType: string; fileName: string }> {
  const defaultMime = file.type || 'video/mp4';
  const defaultName = file.name || `video-${Date.now()}.mp4`;

  // Videos <= 4MB are already lightweight for Apps Script Base64 upload
  if (file.size <= 4 * 1024 * 1024) {
    return { blob: file, mimeType: defaultMime, fileName: defaultName };
  }

  if (
    typeof document === 'undefined' ||
    typeof MediaRecorder === 'undefined'
  ) {
    return { blob: file, mimeType: defaultMime, fileName: defaultName };
  }

  const preferredMimes = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  const supportedMime = preferredMimes.find((m) =>
    MediaRecorder.isTypeSupported(m)
  );
  if (!supportedMime) {
    return { blob: file, mimeType: defaultMime, fileName: defaultName };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.preload = 'auto';

    let settled = false;
    let rafId = 0;
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (safetyTimer) clearTimeout(safetyTimer);
      URL.revokeObjectURL(objectUrl);
      videoEl.remove();
    };

    const finishWithOriginal = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ blob: file, mimeType: defaultMime, fileName: defaultName });
    };

    videoEl.onerror = finishWithOriginal;

    videoEl.onloadedmetadata = async () => {
      const duration = Number.isFinite(videoEl.duration) ? videoEl.duration : 0;
      if (!duration || duration > MAX_VIDEO_SECONDS) {
        finishWithOriginal();
        return;
      }

      const maxWidth = 480;
      const scale =
        videoEl.videoWidth > maxWidth ? maxWidth / videoEl.videoWidth : 1;
      const width = Math.max(
        2,
        Math.round((videoEl.videoWidth * scale) / 2) * 2
      );
      const height = Math.max(
        2,
        Math.round((videoEl.videoHeight * scale) / 2) * 2
      );

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx || typeof canvas.captureStream !== 'function') {
        finishWithOriginal();
        return;
      }

      try {
        const canvasStream = canvas.captureStream(24);
        const videoCapture = (
          videoEl as HTMLVideoElement & {
            captureStream?: () => MediaStream;
            mozCaptureStream?: () => MediaStream;
          }
        );
        const sourceStream =
          typeof videoCapture.captureStream === 'function'
            ? videoCapture.captureStream()
            : typeof videoCapture.mozCaptureStream === 'function'
              ? videoCapture.mozCaptureStream()
              : null;

        if (sourceStream) {
          sourceStream.getAudioTracks().forEach((track) => {
            canvasStream.addTrack(track);
          });
        }

        const chunks: BlobPart[] = [];
        const recorder = new MediaRecorder(canvasStream, {
          mimeType: supportedMime,
          videoBitsPerSecond: 400_000,
        });

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };

        recorder.onstop = () => {
          if (settled) return;
          settled = true;
          cleanup();
          const compressed = new Blob(chunks, {
            type: supportedMime.split(';')[0],
          });
          if (compressed.size > 0 && compressed.size < file.size) {
            const ext = supportedMime.includes('mp4') ? 'mp4' : 'webm';
            resolve({
              blob: compressed,
              mimeType: supportedMime.split(';')[0],
              fileName: defaultName.replace(/\.[^.]+$/, `.${ext}`),
            });
          } else {
            resolve({ blob: file, mimeType: defaultMime, fileName: defaultName });
          }
        };

        recorder.onerror = finishWithOriginal;

        const drawFrame = () => {
          if (settled || videoEl.paused || videoEl.ended) return;
          ctx.drawImage(videoEl, 0, 0, width, height);
          const pct = Math.min(
            99,
            Math.round((videoEl.currentTime / duration) * 100)
          );
          onProgress?.(`جاري ضغط الفيديو لتسريع الرفع... ${pct}%`);
          rafId = requestAnimationFrame(drawFrame);
        };

        videoEl.onended = () => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        };

        safetyTimer = setTimeout(() => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          } else {
            finishWithOriginal();
          }
        }, Math.min(70_000, Math.round(duration * 1000) + 6000));

        recorder.start(250);
        await videoEl.play();
        drawFrame();
      } catch {
        finishWithOriginal();
      }
    };

    videoEl.src = objectUrl;
  });
}

async function uploadVideoToAppServer(
  file: File,
  onPercent?: (percent: number) => void
): Promise<{ appUrl: string; sheetUrl: string }> {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload-video');
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
    xhr.setRequestHeader('x-file-name', encodeURIComponent(file.name || 'video.mp4'));

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onPercent?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data?.success && data?.url) {
            onPercent?.(100);
            const relativeUrl = String(data.url);
            const absoluteUrl =
              relativeUrl.startsWith('http') || !origin
                ? relativeUrl
                : `${origin}${relativeUrl}`;
            resolve({ appUrl: relativeUrl, sheetUrl: absoluteUrl });
            return;
          }
        } catch {
          // fall through
        }
      }
      reject(new Error('تعذر رفع الفيديو'));
    };

    xhr.onerror = () => reject(new Error('تعذر الاتصال بالخادم'));
    xhr.send(file);
  });
}

async function uploadVideoToGoogleDriveViaAppsScript(
  appsScriptUrl: string,
  file: File,
  onProgress?: (status: string) => void
): Promise<{ videoUrl: string; sheetVideoUrl: string }> {
  const targetUrl = (appsScriptUrl || MARKETPLACE_WEB_APP_URL).trim();

  onProgress?.('جاري ضغط وتجهيز الفيديو للرفع إلى Google Drive...');
  const prepared = await compressVideoForUpload(file, onProgress);

  onProgress?.('جاري ترميز الفيديو وإرساله إلى Google Drive...');
  const base64Data = await blobToBase64(prepared.blob);

  const response = await fetch(targetUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'uploadVideo',
      fileName: prepared.fileName,
      mimeType: prepared.mimeType,
      base64Data,
    }),
  });

  if (!response.ok) {
    throw new Error(`تعذر رفع الفيديو عبر Google Apps Script (${response.status})`);
  }

  const rawText = await response.text();
  const data = JSON.parse(rawText);
  if (data && data.success === false) {
    throw new Error(data.error || data.message || 'فشل حفظ الفيديو في Google Drive');
  }

  const returnedUrl =
    data?.videoUrl ||
    data?.previewUrl ||
    data?.directUrl ||
    data?.url ||
    (data?.fileId ? `https://drive.google.com/file/d/${data.fileId}/view` : '');

  const normalized = normalizeVideoUrl(String(returnedUrl || ''));
  if (!normalized) {
    throw new Error('لم يتم إرجاع رابط الفيديو من Google Drive');
  }

  return {
    videoUrl: normalized,
    sheetVideoUrl: normalized,
  };
}

const PUBLIC_CATEGORY_IMAGES: Record<CategoryId, string> = {
  all: '/images/poultry_rooster_iraq_1793487643523.jpg',
  poultry: '/images/poultry_rooster_iraq_1793487643523.jpg',
  birds: '/images/pigeon_iraqi_zaajil_1793487645000.jpg',
  feed: '/images/poultry_feed_supplies_1793487722608.jpg',
  vet: '/images/veterinary_poultry_vitamins_1793487645672.jpg',
};

function buildTemporaryStudioImageUrl(
  fileName: string,
  index: number,
  category: CategoryId
): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://iraq-poultry-market.app';
  const assetPath =
    PUBLIC_CATEGORY_IMAGES[category] || PUBLIC_CATEGORY_IMAGES.poultry;
  return `${origin}${assetPath}?source=studio&idx=${index + 1}&file=${encodeURIComponent(fileName)}&t=${Date.now()}`;
}

async function compressImageWithinBudget(
  source: File | string,
  maxChars: number,
  fallbackUrl: string
): Promise<string> {
  if (typeof source === 'string' && source.length <= maxChars && source.startsWith('data:image/')) {
    return source;
  }

  const presets: Array<[number, number]> = [
    [640, 0.72],
    [480, 0.62],
    [360, 0.52],
    [260, 0.45],
    [180, 0.38],
    [140, 0.34],
    [100, 0.28],
  ];

  let lastValidCandidate = '';
  for (const [w, q] of presets) {
    const candidate = await compressImageToDataUrl(source, '', w, q);
    if (!candidate) break;
    lastValidCandidate = candidate;
    if (candidate.length <= maxChars) {
      return candidate;
    }
  }

  if (lastValidCandidate && lastValidCandidate.length <= 48000) {
    return lastValidCandidate;
  }

  return typeof source === 'string' && source.startsWith('data:image/')
    ? source
    : fallbackUrl;
}

export async function processAndUploadMedia(
  images: MediaImageItem[],
  video: MediaVideoItem | null,
  appsScriptUrl?: string,
  onProgress?: (status: string) => void,
  category: CategoryId = 'poultry'
): Promise<{
  imageUrls: string[];
  videoUrl: string;
  sheetImageUrls: string[];
  sheetVideoUrl: string;
  uploadedToCloud: boolean;
}> {
  let uploadedToCloud = false;

  const targetImages = images.slice(0, MAX_IMAGES);
  const perImageBudget = Math.max(
    4500,
    Math.floor(42000 / Math.max(1, targetImages.length))
  );
  const imageUrls: string[] = [];
  const sheetImageUrls: string[] = [];

  for (let i = 0; i < targetImages.length; i++) {
    const item = targetImages[i];
    const placeholderUrl = buildTemporaryStudioImageUrl(
      item.name || `image-${i + 1}.jpg`,
      i,
      category
    );
    const localSource: File | string | undefined = item.compressedDataUrl || item.file;
    onProgress?.(`جاري معالجة الصور... (صورة ${i + 1} من ${targetImages.length})`);

    try {
      if (item.remoteUrl) {
        imageUrls.push(item.remoteUrl);
        sheetImageUrls.push(item.remoteUrl);
        uploadedToCloud = true;
      } else if (localSource) {
        // Compress real selected photo cleanly to fit Google Sheets cell limit (50k chars)
        const safeRealPhoto = await compressImageWithinBudget(
          localSource,
          perImageBudget,
          placeholderUrl
        );
        imageUrls.push(safeRealPhoto);
        sheetImageUrls.push(safeRealPhoto);
      } else if (item.previewUrl) {
        imageUrls.push(item.previewUrl);
        sheetImageUrls.push(
          item.previewUrl.startsWith('http') || item.previewUrl.startsWith('data:')
            ? item.previewUrl
            : placeholderUrl
        );
      }
    } catch {
      imageUrls.push(placeholderUrl);
      sheetImageUrls.push(placeholderUrl);
    }
  }

  let videoUrl = '';
  let sheetVideoUrl = '';
  if (video) {
    onProgress?.('جاري معالجة ورفع الفيديو إلى Google Drive...');
    if (video.remoteUrl && video.remoteUrl.trim()) {
      const normalized = normalizeVideoUrl(video.remoteUrl);
      videoUrl = normalized;
      sheetVideoUrl = normalized;
      uploadedToCloud = true;
    } else if (video.file) {
      try {
        const driveUploaded = await uploadVideoToGoogleDriveViaAppsScript(
          appsScriptUrl || MARKETPLACE_WEB_APP_URL,
          video.file,
          onProgress
        );
        videoUrl = driveUploaded.videoUrl;
        sheetVideoUrl = driveUploaded.sheetVideoUrl;
        uploadedToCloud = true;
      } catch (driveErr) {
        // Fallback to local app server video endpoint only if the deployed Apps Script hasn't added uploadVideo yet
        try {
          const uploaded = await uploadVideoToAppServer(video.file, (pct) =>
            onProgress?.(`جاري حفظ الفيديو للحصول على رابط تشغيل... ${pct}%`)
          );
          videoUrl = uploaded.appUrl;
          sheetVideoUrl = uploaded.sheetUrl;
          uploadedToCloud = true;
        } catch {
          throw new Error(
            driveErr instanceof Error
              ? driveErr.message
              : 'تعذر رفع الفيديو عبر Google Apps Script، يرجى المحاولة مرة أخرى.'
          );
        }
      }
    } else if (video.previewUrl && !video.previewUrl.startsWith('blob:')) {
      const normalized = normalizeVideoUrl(video.previewUrl);
      videoUrl = normalized;
      sheetVideoUrl = normalized;
    } else {
      throw new Error('تعذر قراءة ملف الفيديو المختار، يرجى اختيار الفيديو مجدداً.');
    }
  }

  return { imageUrls, videoUrl, sheetImageUrls, sheetVideoUrl, uploadedToCloud };
}

export interface CreateListingDoPostPayload {
  title: string;
  category: string;
  price: number;
  city: string;
  district: string;
  sellerName: string;
  phone: string;
  description: string;
  is_featured: boolean;
  images: string[];
  video: string;
}

export async function submitListingToGoogleSheet(
  appsScriptUrl: string,
  payload: CreateListingDoPostPayload
): Promise<{ synced: boolean; adId?: string; message?: string }> {
  const targetUrl = (appsScriptUrl || MARKETPLACE_WEB_APP_URL).trim();
  if (!targetUrl || targetUrl.includes('AKfycbx_market_sheet')) {
    return {
      synced: false,
      message: 'يرجى ربط رابط Google Apps Script الفعلي للمزامنة السحابية',
    };
  }

  try {
    const pinnedFlag = Boolean(payload.is_featured);
    const jsonPayload = {
      action: 'create',
      title: payload.title,
      category: payload.category,
      price: payload.price,
      city: payload.city,
      governorate: payload.city,
      district: payload.district,
      sellerName: payload.sellerName,
      seller_name: payload.sellerName,
      'seller-name': payload.sellerName,
      phone: payload.phone,
      description: payload.description,
      images: payload.images,
      video: payload.video,
      is_featured: pinnedFlag,
      isFeatured: pinnedFlag,
      featured: pinnedFlag,
      is_pinned: pinnedFlag,
      isPinned: pinnedFlag,
      'is-pinned': pinnedFlag,
      date: new Date().toISOString(),
    };

    // text/plain avoids CORS preflight (OPTIONS) on Google Apps Script while delivering valid JSON in e.postData.contents
    const response = await fetch(targetUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(jsonPayload),
    });

    if (!response.ok) {
      return {
        synced: false,
        message: `تعذر حفظ الإعلان في الشيت (رمز الخطأ ${response.status})`,
      };
    }

    const rawText = await response.text();
    if (rawText) {
      try {
        const data = JSON.parse(rawText);
        if (data && data.success === false) {
          return {
            synced: false,
            message: data.error || data.message || 'رفض الخادم حفظ الإعلان',
          };
        }
        return {
          synced: true,
          adId: data?.adId || data?.id,
          message:
            data?.message || 'تم نشر الإعلان وحفظ البيانات في جوجل شيت بنجاح!',
        };
      } catch {
        return {
          synced: true,
          message: 'تم نشر الإعلان وحفظ البيانات في جوجل شيت بنجاح!',
        };
      }
    }

    return {
      synced: true,
      message: 'تم نشر الإعلان وحفظ البيانات في جوجل شيت بنجاح!',
    };
  } catch {
    return {
      synced: false,
      message: 'تعذر الاتصال بقاعدة بيانات جوجل شيت، يرجى التحقق من الإنترنت والمحاولة مجدداً.',
    };
  }
}

const CATEGORY_DEFAULT_IMAGES = PUBLIC_CATEGORY_IMAGES;

function normalizeCategory(rawCategory: unknown): CategoryId {
  const val = String(rawCategory || '').trim().toLowerCase();
  if (val === 'poultry' || val.includes('دواجن') || val.includes('دجاج')) return 'poultry';
  if (val === 'birds' || val.includes('طيور') || val.includes('حمام')) return 'birds';
  if (val === 'feed' || val.includes('أعلاف') || val.includes('اعلاف') || val.includes('مستلزمات'))
    return 'feed';
  if (val === 'vet' || val.includes('أدوية') || val.includes('ادوية') || val.includes('بيطر'))
    return 'vet';
  return 'poultry';
}

export function normalizeVideoUrl(rawUrl: string): string {
  const trimmed = String(rawUrl || '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined'
  ) {
    return '';
  }

  // Convert cross-environment /api/videos/... URLs to same-origin relative path
  const localVideoMatch = trimmed.match(
    /^https?:\/\/ais-(?:dev|pre)-[^/]+(\/api\/videos\/[^?#]+)/i
  );
  if (localVideoMatch?.[1]) {
    return localVideoMatch[1];
  }

  return trimmed;
}

export function getVideoEmbedInfo(rawUrl: string): {
  kind: 'video' | 'iframe';
  src: string;
  externalUrl: string;
} {
  const normalized = normalizeVideoUrl(rawUrl);

  // Google Drive video sharing links -> embeddable preview player
  const driveFileMatch = normalized.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (driveFileMatch?.[1]) {
    return {
      kind: 'iframe',
      src: `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`,
      externalUrl: normalized,
    };
  }
  const driveIdMatch = normalized.match(
    /drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([^&#]+)/i
  );
  if (driveIdMatch?.[1]) {
    return {
      kind: 'iframe',
      src: `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`,
      externalUrl: normalized,
    };
  }

  // YouTube / YouTube Shorts links -> embeddable player
  const ytMatch = normalized.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
  );
  if (ytMatch?.[1]) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`,
      externalUrl: normalized,
    };
  }

  return {
    kind: 'video',
    src: normalized,
    externalUrl: normalized,
  };
}

export function normalizeImageUrl(rawUrl: string): string {
  let trimmed = rawUrl.trim().replace(/^["']+|["']+$/g, '').trim();
  if (!trimmed) return '';

  // Remove any accidental newlines/spaces inside base64 data URLs from spreadsheet cells
  if (trimmed.startsWith('data:image/')) {
    return trimmed.replace(/\s+/g, '');
  }

  // Convert Google Drive sharing links into direct image URLs if pasted in Sheet
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (driveFileMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }
  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([^&#]+)/i);
  if (driveIdMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // Convert cross-environment Cloud Run preview /images/... URLs to relative /images/... so auth cookies never 302-block them
  const localAssetMatch = trimmed.match(/^https?:\/\/ais-(?:dev|pre)-[^/]+(\/images\/[^?#]+)/i);
  if (localAssetMatch?.[1]) {
    return localAssetMatch[1];
  }

  return trimmed;
}

export function parseImagesField(rawImages: unknown, fallbackSingle?: unknown): string[] {
  const collected: string[] = [];

  const pushSplitString = (rawStr: string) => {
    const trimmed = rawStr.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          for (const entry of parsed) {
            const s = normalizeImageUrl(String(entry || ''));
            if (s) collected.push(s);
          }
          return;
        }
      } catch {
        // Fallback to URL-boundary split
      }
    }
    // Split at URL/data-URI boundaries without breaking data:image/...;base64,/9j/... commas
    trimmed
      .split(/\s*[,|]\s*(?=(?:https?:\/\/|data:image\/|\/images\/))|\n+/)
      .map((s) => normalizeImageUrl(s))
      .filter(Boolean)
      .forEach((s) => collected.push(s));
  };

  if (Array.isArray(rawImages)) {
    for (const entry of rawImages) {
      if (typeof entry === 'string') {
        pushSplitString(entry);
      } else if (entry != null) {
        const s = normalizeImageUrl(String(entry));
        if (s) collected.push(s);
      }
    }
  } else if (typeof rawImages === 'string') {
    pushSplitString(rawImages);
  }

  if (collected.length === 0 && fallbackSingle) {
    if (Array.isArray(fallbackSingle)) {
      for (const entry of fallbackSingle) {
        const s = normalizeImageUrl(String(entry || ''));
        if (s) collected.push(s);
      }
    } else {
      pushSplitString(String(fallbackSingle));
    }
  }

  return collected;
}

function parseFeaturedFlag(rawVal: unknown): boolean {
  if (typeof rawVal === 'boolean') return rawVal;
  if (typeof rawVal === 'number') return rawVal === 1;
  const s = String(rawVal || '').trim().toLowerCase();
  return s === 'true' || s === '1' || s.includes('نعم') || s.includes('مميز');
}

function formatSheetDate(rawDate: unknown): string {
  const s = String(rawDate || '').trim();
  if (!s) return 'حديثاً';
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime()) && s.includes('T')) {
    return parsed.toLocaleDateString('ar-IQ', {
      month: 'short',
      day: 'numeric',
    });
  }
  return s;
}

export async function fetchListingsFromGoogleSheet(
  appsScriptUrl: string
): Promise<Listing[]> {
  const targetUrl = (appsScriptUrl || MARKETPLACE_WEB_APP_URL).trim();
  if (!targetUrl) return [];

  const response = await fetch(targetUrl, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const rawData = await response.json();
  const rows: Record<string, unknown>[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.listings)
      ? rawData.listings
      : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData?.items)
          ? rawData.items
          : [];

  const mapped: Listing[] = rows
    .filter((row) => row && typeof row === 'object')
    .map((row, index) => {
      const category = normalizeCategory(
        row.category ?? row['التصنيف'] ?? row['القسم']
      );
      const title = String(
        row.title ?? row.name ?? row['العنوان'] ?? row['عنوان الإعلان'] ?? ''
      ).trim();

      const rawPrice = String(row.price ?? row['السعر'] ?? '0').replace(/[^\d.]/g, '');
      const price = Math.round(Number(rawPrice) || 0);

      const city = String(
        row.governorate || row.city || row['المحافظة'] || 'بغداد'
      ).trim();
      const district = String(
        row.district || row.area || row['القضاء'] || row['المنطقة'] || 'المركز'
      ).trim();

      const sellerName = String(
        row.seller_name ||
          row['seller-name'] ||
          row.sellerName ||
          row.seller ||
          row.author ||
          row['اسم المعلن'] ||
          row['المعلن'] ||
          'بدون اسم'
      ).trim();

      let phone = String(
        row.phone ?? row.mobile ?? row['رقم الهاتف'] ?? row['الهاتف'] ?? ''
      ).trim();
      if (/^7\d{9}$/.test(phone)) {
        phone = '0' + phone;
      }

      const whatsappRaw = String(row.whatsapp ?? '').trim();
      const whatsapp =
        whatsappRaw ||
        (phone ? '964' + (phone.startsWith('0') ? phone.slice(1) : phone) : '9647700000000');

      const description = String(
        row.description || row.details || row['التفاصيل'] || row['الوصف'] || ''
      ).trim();

      const parsedImages = parseImagesField(
        row.images ?? row['الصور'] ?? row['روابط الصور'],
        row.image ?? row.imageUrl ?? row['الصورة']
      );
      const fallbackImg = CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.poultry;
      const finalImages = parsedImages.length > 0 ? parsedImages : [fallbackImg];

      const videoUrl = normalizeVideoUrl(
        String(
          row.video ?? row.videoUrl ?? row['الفيديو'] ?? row['رابط الفيديو'] ?? ''
        )
      );

      const featured = parseFeaturedFlag(
        row['is-pinned'] ??
          row.is_pinned ??
          row.isPinned ??
          row.is_featured ??
          row.isFeatured ??
          row.featured ??
          row['التثبيت الذهبي'] ??
          row['مميز']
      );

      const id = String(
        row.id ?? row.adId ?? row.ID ?? row['المعرف'] ?? `sheet-${Date.now()}-${index}`
      ).trim();

      return {
        id,
        title: title || 'إعلان دواجن وطيور',
        category,
        price,
        city: city || 'بغداد',
        district: district || 'المركز',
        date: formatSheetDate(row.date ?? row.createdAt ?? row.timestamp ?? row['التاريخ']),
        imageUrl: finalImages[0],
        image: finalImages[0],
        images: finalImages,
        videoUrl: videoUrl || undefined,
        sellerName,
        seller_name: sellerName,
        phone: phone || '07700000000',
        whatsapp,
        isVerified: true,
        featured,
        description:
          description || 'إعلان منشور في سوق الدواجن والطيور العراقي.',
      };
    })
    .filter((item) => Boolean(item.title));

  // Newest first (assuming sheet appends to bottom), with featured ads prioritized
  const reversed = [...mapped].reverse();
  return reversed.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}
