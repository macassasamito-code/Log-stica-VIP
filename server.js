import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve compiled static assets from Vite build (dist/)
app.use(
  express.static(distPath, {
    maxAge: '1d',
    etag: true,
  })
);

// Health check endpoint for Hostinger Node.js runner
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Rede de Delivery VIP & Express — Maputo, Moçambique',
    timestamp: new Date().toISOString(),
  });
});

// SPA Fallback: send index.html for all client-side routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[Rede de Delivery VIP & Express - Maputo] Servidor ativo na porta ${PORT}`
  );
});
