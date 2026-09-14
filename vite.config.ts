import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import {defineConfig} from 'vite';
import { paymentRouter } from './src/server/paymentRoutes.ts';
import { adminRouter } from './src/server/adminRoutes.ts';

function apiMiddlewarePlugin() {
  const apiApp = express();
  apiApp.use(express.json());
  // Mount both /api/payments and /api/paypal to avoid 404 on any variant
  apiApp.use('/api/payments', paymentRouter);
  apiApp.use('/api/paypal', paymentRouter);
  apiApp.use('/api/admin', adminRouter);

  // Direct top-level aliases inside apiApp with express.json body parser
  apiApp.post('/api/create-order', (req: any, res: any, next: any) => {
    req.url = '/create-order';
    paymentRouter(req, res, next);
  });
  apiApp.post('/api/capture-order', (req: any, res: any, next: any) => {
    req.url = '/capture-order';
    paymentRouter(req, res, next);
  });

  return {
    name: 'api-server-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && (
          req.url.startsWith('/api/payments') || 
          req.url.startsWith('/api/paypal') || 
          req.url.startsWith('/api/admin') ||
          req.url.startsWith('/api/create-order') ||
          req.url.startsWith('/api/capture-order')
        )) {
          return apiApp(req, res, next);
        }

        next();
      });

      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/generate-plan' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { generateBusinessPlanWithAI } = await import('./src/server/geminiService.ts');
              const plan = await generateBusinessPlanWithAI(data);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(plan));
            } catch (err: any) {
              console.error('API middleware error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Generation failed' }));
            }
          });
          return;
        }

        if (req.url === '/api/regenerate-section' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { regenerateSectionWithAI } = await import('./src/server/geminiService.ts');
              const updatedContent = await regenerateSectionWithAI(
                data.input,
                data.sectionKey,
                data.currentContent,
                data.customInstruction
              );
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ sectionKey: data.sectionKey, content: updatedContent }));
            } catch (err: any) {
              console.error('Regenerate section middleware error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Regeneration failed' }));
            }
          });
          return;
        }

        if (req.url === '/api/generate-marketing-kit' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { generateMarketingKitWithAI } = await import('./src/server/geminiService.ts');
              const marketingKit = await generateMarketingKitWithAI(data.input, data.plan);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(marketingKit));
            } catch (err: any) {
              console.error('Marketing kit middleware error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Marketing kit generation failed' }));
            }
          });
          return;
        }

        if (req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', service: 'Global Business Generator' }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    define: {
      'import.meta.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(
        process.env.VITE_PAYPAL_CLIENT_ID ||
        process.env.PAYPAL_CLIENT_ID ||
        'BAA91Azu3vaFjziWsSm5T7NSX5wJnThiLhaxYjTEj2AeXwNM1rczvO877jESgNhqvjOmycY3eulrZpJTXw'
      ),
    },
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
