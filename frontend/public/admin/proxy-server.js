// Proxy server simple para evitar CORS
// Ejecutar con: node proxy-server.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Proxy hacia el backend de Vercel
app.use('/', createProxyMiddleware({
  target: 'https://ecoa-nine.vercel.app',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug'
}));

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying to: https://ecoa-nine.vercel.app`);
});
