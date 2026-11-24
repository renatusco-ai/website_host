import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { parseEnquiry, sendEnquiry } from './api/send-enquiry.js';
import { MAX_JSON_BODY_BYTES } from './api/app-store-intake/_lib.js';
import { handleUploadUrl } from './api/app-store-intake/upload-url.js';
import { handleDeleteUpload } from './api/app-store-intake/upload.js';
import { handleSubmitIntake } from './api/app-store-intake/index.js';

function createVercelResAdapter(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
    end(data) {
      res.end(data);
    },
  };
}

function readJsonBody(req, maxBytes = MAX_JSON_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      if (tooLarge) return;
      total += chunk.length;
      if (total > maxBytes) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request payload too large.'), { status: 413 }));
        return;
      }
      const raw = Buffer.concat(chunks).toString();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function localApiPlugin(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      // Register specific intake routes BEFORE /api/app-store-intake to prevent Connect prefix swallowing
      server.middlewares.use('/api/app-store-intake/upload-url', async (req, res, next) => {
        if (req.url && req.url !== '/' && !req.url.startsWith('/?')) return next();
        const adapter = createVercelResAdapter(res);
        if (req.method === 'OPTIONS') return handleUploadUrl(req, adapter, env);
        try {
          req.body = await readJsonBody(req);
          await handleUploadUrl(req, adapter, env);
        } catch (err) {
          adapter.status(err.status || 400).json({ error: err.message || 'Invalid request' });
        }
      });

      server.middlewares.use('/api/app-store-intake/upload', async (req, res, next) => {
        if (req.url && req.url !== '/' && !req.url.startsWith('/?')) return next();
        const adapter = createVercelResAdapter(res);
        if (req.method === 'OPTIONS') return handleDeleteUpload(req, adapter, env);
        try {
          req.body = await readJsonBody(req);
          await handleDeleteUpload(req, adapter, env);
        } catch (err) {
          adapter.status(err.status || 400).json({ error: err.message || 'Invalid request' });
        }
      });

      server.middlewares.use('/api/app-store-intake', async (req, res, next) => {
        if (req.url && req.url !== '/' && !req.url.startsWith('/?')) return next();
        const adapter = createVercelResAdapter(res);
        if (req.method === 'OPTIONS') return handleSubmitIntake(req, adapter, env);
        try {
          req.body = await readJsonBody(req);
          await handleSubmitIntake(req, adapter, env);
        } catch (err) {
          adapter.status(err.status || 400).json({ error: err.message || 'Invalid request' });
        }
      });

      server.middlewares.use('/api/enquiry', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          next();
          return;
        }

        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');

          let body = {};
          try {
            body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }

          const parsed = parseEnquiry(body);
          if (parsed.error) {
            res.statusCode = parsed.status;
            res.end(JSON.stringify({ error: parsed.error }));
            return;
          }

          const result = await sendEnquiry(parsed.data, env);
          res.statusCode = result.error ? result.status : 200;
          res.end(JSON.stringify(result.error ? { error: result.error } : { ok: true }));
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), localApiPlugin(env)],
  };
});
