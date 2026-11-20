import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const ROOT_DIR = process.cwd();
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');

fs.mkdirSync(VIDEOS_DIR, { recursive: true });

function resolveVideoExtension(fileNameHeader: string, contentTypeHeader: string): string {
  const cleanName = path.basename(fileNameHeader || '');
  const extMatch = cleanName.match(/\.(mp4|webm|mov|m4v|3gp|ogg|ogv|avi|mkv)$/i);
  if (extMatch?.[1]) {
    return `.${extMatch[1].toLowerCase()}`;
  }

  const ct = (contentTypeHeader || '').toLowerCase();
  if (ct.includes('webm')) return '.webm';
  if (ct.includes('quicktime') || ct.includes('mov')) return '.mov';
  if (ct.includes('3gpp')) return '.3gp';
  if (ct.includes('ogg')) return '.ogv';
  if (ct.includes('x-m4v')) return '.m4v';
  return '.mp4';
}

async function startServer() {
  const app = express();

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Serve uploaded short videos with Range requests (206 Partial Content) & CORS headers
  app.use(
    '/api/videos',
    (_req: Request, res: Response, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(VIDEOS_DIR, {
      acceptRanges: true,
      maxAge: '30d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mov')) {
          res.setHeader('Content-Type', 'video/quicktime');
        } else if (filePath.endsWith('.webm')) {
          res.setHeader('Content-Type', 'video/webm');
        } else if (filePath.endsWith('.mp4') || filePath.endsWith('.m4v')) {
          res.setHeader('Content-Type', 'video/mp4');
        }
      },
    })
  );

  // Upload raw video file (up to 80MB / 60s) and return its playable URL
  app.post(
    '/api/upload-video',
    express.raw({ type: '*/*', limit: '80mb' }),
    async (req: Request, res: Response) => {
      try {
        const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
        if (bodyBuffer.length === 0) {
          res.status(400).json({
            success: false,
            error: 'ملف الفيديو فارغ أو لم يصل بشكل صحيح.',
          });
          return;
        }

        const rawName = decodeURIComponent(
          String(req.headers['x-file-name'] || req.query.name || 'video.mp4')
        );
        const contentType = String(req.headers['content-type'] || 'video/mp4');
        const ext = resolveVideoExtension(rawName, contentType);
        const filename = `vid-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
        const targetPath = path.join(VIDEOS_DIR, filename);

        await fs.promises.writeFile(targetPath, bodyBuffer);

        res.json({
          success: true,
          url: `/api/videos/${filename}`,
          filename,
          size: bodyBuffer.length,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: err instanceof Error ? err.message : 'تعذر حفظ ملف الفيديو على الخادم.',
        });
      }
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const vitePromise = createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
      },
      appType: 'spa',
    });

    app.use(async (req: Request, res: Response, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
