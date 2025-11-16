# 🌱 ECOA - Ecosystem Companion Optimization Assistant

Smart plant monitoring and care system that allows users to manage their personal garden through IoT technology, artificial intelligence, and gamification.

## Description

ECOA is a complete platform that combines:
- **RESTful API Backend** with Node.js, Express, and Supabase
- **Web Frontend** with HTML, CSS, and vanilla JavaScript
- **Raspberry Pi Integration** for IoT sensors
- **Artificial Intelligence** with Google Gemini for plants that "talk"
- **External APIs** for plant identification and weather data

## System Architecture

```
ECOA/
├── backend/          # RESTful API with Express and Socket.IO
├── frontend/         # Web application (client and admin)
├── raspi/            # Raspberry Pi scripts
├── integrations/     # External APIs (OpenAI, Weather, Plant.id)
└── docs/             # Technical documentation
```

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Python** 3.8+ (for Raspberry Pi)
- **Supabase** account
- API Keys for external services

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/smallcakekoo/ecoa.git
cd ecoa
```

2. **Setup Backend**
```bash
cd backend
npm install
npm run dev
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Setup Raspberry Pi** (optional)
```bash
cd ../raspi
pip install -r requirements.txt
python main.py
```

## Main Services

### Backend API (Port 3000)
- **Users**: Account and profile management
- **Plants**: CRUD for plants and metrics
- **Alerts**: Notification system
- **Achievements**: Gamification and rewards
- **Donations**: Community support system
- **Integrations**: External APIs

### Web Frontend (Port 5000)
- **Client Dashboard**: Interface for end users
- **Admin Panel**: System administration
- **Real-time**: Socket.IO for live updates

## Integrated APIs

- **Perenual**: Plants
- **Supabase**: Database and authentication

## Main Features

### Smart Plants
Plants can "communicate" with you thanks to Google Gemini:
```javascript
// Interaction example
POST /api/integrations/gemini/chat
{
  "message": "How are you feeling today?",
  "plantType": "rose",
  "plantName": "Garden Rose"
}
```

### IoT Monitoring
Raspberry Pi sensors for:
- Soil moisture
- Ambient temperature
- Light level
- Automatic watering control

### Gamification System
- Achievements for plant care
- Experience levels
- Community donation system

### Real-time Alerts
Socket.IO for instant notifications:
- Plants that need water
- Changes in metrics
- Unlocked achievements

## Technologies Used

### Backend
- **Node.js** + **Express.js**
- **Socket.IO** for real-time
- **Supabase** as database

### Frontend
- **HTML5** + **CSS3** + **JavaScript ES6+**
- **Vite** as bundler
- **Socket.IO Client** for real-time

### IoT
- **Raspberry Pi** with Python
- Humidity and temperature sensors
- Automatic water pumps

## Detailed Documentation

- [**Backend README**](./backend/README.md) - API setup
- [**Frontend README**](./frontend/README.md) - Web setup
- [**API Documentation**](./docs/api.md) - Available endpoints
- [**System Architecture**](./docs/arquitectura.md) - Technical design
- [**Database**](./docs/base_datos.md) - Supabase schema

## Environment Variables

Create the corresponding `.env` files:

### Backend (.env)
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server
PORT=3000
NODE_ENV=development
```

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Raspberry Pi
cd raspi
python -m pytest
```

## Project Status

- **Backend API** - Fully functional
- **Supabase Integration** - Configured
- **Socket.IO** - Real-time implemented
- **Google Gemini** - Talking plants
- **Frontend** - In development
- **Raspberry Pi** - Basic scripts
- **Testing** - Pending

## Development Team

- **Ana Tobón** 
- **Cristina Jauregui** 
- **Sary Payán**
