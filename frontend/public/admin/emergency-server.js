const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// CORS muy permisivo
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// Datos de ejemplo para testing
const mockUsers = [
  { id: 1, email: 'admin@ecoa.com', role: 'admin', created_at: new Date().toISOString() },
  { id: 2, email: 'test@ecoa.com', role: 'admin', created_at: new Date().toISOString() }
];

const mockPlants = [
  { 
    id: 1, 
    name: 'Luna', 
    species: 'Ficus lyrata', 
    description: 'Planta de interior hermosa',
    is_adopted: false,
    health_status: 'healthy',
    created_at: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'Sol', 
    species: 'Monstera deliciosa', 
    description: 'Planta tropical',
    is_adopted: true,
    health_status: 'healthy',
    created_at: new Date().toISOString()
  }
];

const mockDonations = [
  { id: 1, amount: 5000, status: 'active', created_at: new Date().toISOString() },
  { id: 2, amount: 3000, status: 'completed', created_at: new Date().toISOString() }
];

// Rutas
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor de emergencia funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/users', (req, res) => {
  res.json({
    success: true,
    data: mockUsers,
    count: mockUsers.length
  });
});

app.get('/plants', (req, res) => {
  res.json({
    success: true,
    data: mockPlants,
    count: mockPlants.length
  });
});

app.get('/donations', (req, res) => {
  res.json({
    success: true,
    data: mockDonations,
    count: mockDonations.length
  });
});

// Login
app.post('/users/login', (req, res) => {
  const { email } = req.body;
  
  const user = mockUsers.find(u => u.email === email && u.role === 'admin');
  
  if (user) {
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user,
        token: 'mock-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// Crear planta
app.post('/plants', (req, res) => {
  const newPlant = {
    id: mockPlants.length + 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  mockPlants.push(newPlant);
  
  res.json({
    success: true,
    message: 'Planta creada exitosamente',
    data: newPlant
  });
});

app.listen(PORT, () => {
  console.log(`🚨 Servidor de emergencia corriendo en puerto ${PORT}`);
  console.log(`🌱 API disponible en: http://localhost:${PORT}`);
  console.log(`📡 CORS configurado para permitir todos los orígenes`);
});
