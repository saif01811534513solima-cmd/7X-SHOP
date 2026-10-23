import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { router as apiRouter } from './src/server/apiHandler';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './src/data/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
          connectSrc: ["'self'", "https:", "wss:"],
          frameSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
        },
      },
      frameguard: { action: 'sameorigin' },
      crossOriginEmbedderPolicy: false,
    })
  );
} else {
  // Relaxed for local development and AI Studio preview iframe
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false,
    })
  );
}

app.use(express.json());

// Cloud Run / Container Health Check (Readiness & Liveness probes)
app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: '7X_SHOP.com',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRouter);

// SEO: Robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://7x-shop.com/sitemap.xml
`);
});

// SEO: Dynamic XML Sitemap
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://7x-shop.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/shop`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/deals`, priority: '0.8', changefreq: 'daily' },
    { loc: `${baseUrl}/categories`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/contact`, priority: '0.5', changefreq: 'monthly' },
  ];

  const categoryUrls = INITIAL_CATEGORIES.map(c => ({
    loc: `${baseUrl}/category/${c.id}`,
    priority: '0.7',
    changefreq: 'weekly',
  }));

  const productUrls = INITIAL_PRODUCTS.map(p => ({
    loc: `${baseUrl}/product/${p.slug || p.id}`,
    priority: '0.8',
    changefreq: 'daily',
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(sitemapXml);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static assets from dist
    const distPath = process.env.DIST_PATH || path.resolve(process.cwd(), 'dist');
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );
    app.use(express.static(distPath));

    // SPA wildcard fallback
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`7X_SHOP.com full-stack server running on port ${PORT}`);
  });
}

startServer();
