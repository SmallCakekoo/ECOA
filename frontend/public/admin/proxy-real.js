const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Configurar CORS muy permisivo
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Middleware adicional para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Proxy hacia Vercel
app.use('/', createProxyMiddleware({
  target: 'https://ecoa-nine.vercel.app',
  changeOrigin: true,
  secure: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔄 Proxying request:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Forzar headers CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'false';
    
    console.log('✅ Response headers set:', proxyRes.headers);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

const PORT = 3001;
app.listen(PORT, () => {
  console.log('🚀 Proxy CORS corriendo en puerto', PORT);
  console.log('🌱 Proxying hacia: https://ecoa-nine.vercel.app');
  console.log('📡 CORS configurado para permitir todos los orígenes');
  console.log('🔗 Usar: http://localhost:3001');
  console.log('⚠️  Este es un proxy temporal - NO usa datos simulados');
});
