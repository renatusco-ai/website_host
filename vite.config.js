import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { parseEnquiry, sendEnquiry } from './api/send-enquiry.js';

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
    plugins: [react(), tailwindcss(), enquiryApi(env)],
  };
});
