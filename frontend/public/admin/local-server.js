const express = require('express');
const cors = require('cors');

const app = express();

// Configurar CORS muy permisivo
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

app.use(express.json());

// Datos simulados que funcionan
const mockUsers = [
  {
    id: 1,
    email: 'admin@ecoa.com',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 2,
    email: 'test@ecoa.com',
    role: 'admin',
    name: 'Test User'
  },
  {
    id: 3,
    email: 'cristina123@gmail.com',
    role: 'admin',
    name: 'Cristina Admin'
  }
];

const mockPlants = [
  {
    id: 1,
    name: 'Luna',
    species: 'Ficus lyrata',
    description: 'Planta de interior muy resistente',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    is_adopted: false,
    user_id: 1
  },
  {
    id: 2,
    name: 'Sol',
    species: 'Monstera deliciosa',
    description: 'Planta tropical muy popular',
    image_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=400&h=400&fit=crop',
    is_adopted: true,
    user_id: 2
  },
  {
    id: 3,
    name: 'lavanda',
    species: 'lavanda',
    description: 'Planta aromática',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
    is_adopted: false,
    user_id: 1
  }
];

const mockDonations = [
  {
    id: 1,
    donor_name: 'John Smith',
    amount: 50,
    purpose: 'For fertilizers',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    donor_name: 'Maria Garcia',
    amount: 25,
    purpose: 'Plant care',
    created_at: new Date().toISOString()
  }
];

// Endpoints
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor local funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.get('/users', (req, res) => {
  res.json({
    success: true,
    data: mockUsers
  });
});

app.post('/users/login', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email es requerido'
    });
  }
  
  const user = mockUsers.find(u => u.email === email && u.role === 'admin');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas o usuario no autorizado. Solo usuarios con rol admin pueden acceder.'
    });
  }
  
  const token = `admin-token-${Date.now()}-${user.id}`;
  
  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      token: token
    }
  });
});

app.get('/plants', (req, res) => {
  res.json({
    success: true,
    data: mockPlants
  });
});

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

app.get('/donations', (req, res) => {
  res.json({
    success: true,
    data: mockDonations
  });
});

app.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      users: { total: mockUsers.length },
      plants: { total: mockPlants.length, adopted: mockPlants.filter(p => p.is_adopted).length },
      donations: { total: mockDonations.length, amount: mockDonations.reduce((sum, d) => sum + d.amount, 0) }
    }
  });
});

// Endpoint para buscar imágenes de plantas
app.get('/api/integrations/perenual/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Query parameter 'q' is required"
    });
  }
  
  // Simular respuesta de Perenual API con imágenes reales
  const mockImages = {
    'ficus lyrata': {
      default_image: {
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
        small_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        medium_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop'
      }
    },
    'monstera deliciosa': {
      default_image: {
        thumbnail: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=150&h=150&fit=crop',
        small_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=300&h=300&fit=crop',
        medium_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=600&h=600&fit=crop'
      }
    },
    'luna': {
      default_image: {
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
        small_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        medium_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop'
      }
    },
    'sol': {
      default_image: {
        thumbnail: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=150&h=150&fit=crop',
        small_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=300&h=300&fit=crop',
        medium_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=600&h=600&fit=crop'
      }
    },
    'lavanda': {
      default_image: {
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=150&fit=crop',
        small_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop',
        medium_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=600&fit=crop'
      }
    }
  };
  
  const searchTerm = q.toLowerCase();
  const plantData = mockImages[searchTerm];
  
  if (plantData) {
    res.json({
      success: true,
      search_results: {
        plants: [plantData]
      }
    });
  } else {
    res.json({
      success: true,
      search_results: {
        plants: []
      }
    });
  }
});

// Endpoint para subir imágenes
app.post('/api/upload/image', (req, res) => {
  try {
    // Simular subida de imagen - devolver URL de imagen de ejemplo
    const imageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop';
    
    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        image_url: imageUrl,
        filename: `plant-${Date.now()}.jpg`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error subiendo imagen',
      error: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('🚀 Servidor local corriendo en puerto', PORT);
  console.log('🌱 API disponible en: http://localhost:3001');
  console.log('📡 CORS configurado para permitir todos los orígenes');
  console.log('👤 Usuarios admin disponibles:');
  mockUsers.forEach(user => {
    console.log(`   - ${user.email} (${user.name})`);
  });
  console.log('🌿 Plantas disponibles:', mockPlants.length);
  console.log('💰 Donaciones disponibles:', mockDonations.length);
});
