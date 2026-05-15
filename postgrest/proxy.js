// =============================================================
// proxy.js — Proxy HTTP para UCC Control Acceso
// Escucha en :3000, reenvía /rest/v1/* → PostgREST :3001/*
// No requiere dependencias externas (sólo Node.js built-in http)
// =============================================================

const http = require('http');

const PROXY_PORT     = 3000;
const POSTGREST_HOST = 'localhost';
const POSTGREST_PORT = 3001;

const server = http.createServer((req, res) => {
  // Manejar preflight OPTIONS directamente
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    });
    res.end();
    return;
  }

  // Eliminar el prefijo /rest/v1 que agrega supabase-js
  const targetPath = req.url.replace(/^\/rest\/v1/, '') || '/';

  const options = {
    hostname: POSTGREST_HOST,
    port:     POSTGREST_PORT,
    path:     targetPath,
    method:   req.method,
    headers:  Object.assign({}, req.headers, {
      host: `${POSTGREST_HOST}:${POSTGREST_PORT}`,
    }),
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Eliminar headers CORS que vienen de PostgREST para evitar duplicados
    const headers = Object.assign({}, proxyRes.headers);
    delete headers['access-control-allow-origin'];
    delete headers['access-control-allow-headers'];
    delete headers['access-control-allow-methods'];
    delete headers['access-control-expose-headers'];
    // Agregar nuestros propios headers CORS
    headers['Access-Control-Allow-Origin']   = '*';
    headers['Access-Control-Allow-Headers']  = '*';
    headers['Access-Control-Allow-Methods']  = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    headers['Access-Control-Expose-Headers'] = 'Content-Range, Range-Unit';
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[proxy] Error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway', detail: err.message }));
  });

  req.pipe(proxyReq);
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[proxy] Escuchando en :${PROXY_PORT}`);
  console.log(`[proxy] Reenviando /rest/v1/* → http://${POSTGREST_HOST}:${POSTGREST_PORT}/*`);
});
