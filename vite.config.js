import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { processEnquiry, writeEnquiryResult } from './api/send-enquiry.js';

function enquiryApi(env) {
  return {
    name: 'enquiry-api',
    configureServer(server) {
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
          try {
            const result = await processEnquiry(
              {
                body: Buffer.concat(chunks).toString('utf8'),
                headers: req.headers,
                ip: req.socket?.remoteAddress,
              },
              { env },
            );
            writeEnquiryResult(res, result);
          } catch (err) {
            console.error('Enquiry dev handler failed:', err?.name || 'Error');
            writeEnquiryResult(res, { status: 500, error: 'Could not send enquiry.' });
          }
        });
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) {
          next();
          return;
        }
        const queryIndex = req.url.indexOf('?');
        const path = queryIndex === -1 ? req.url : req.url.slice(0, queryIndex);
        const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
        if (path === '/' || path.startsWith('/assets/') || path.includes('.')) {
          next();
          return;
        }
        const rel = path.replace(/^\//, '').replace(/\/$/, '');
        const htmlFile = join(process.cwd(), 'dist', `${rel}.html`);
        const direct = join(process.cwd(), 'dist', rel);
        if (existsSync(htmlFile)) {
          req.url = `/${rel}.html${query}`;
        } else if (!existsSync(direct)) {
          req.url = `/404.html${query}`;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), enquiryApi(env)],
    ssr: {
      noExternal: ['react-router', 'react-router-dom', 'framer-motion', 'lenis'],
    },
  };
});
