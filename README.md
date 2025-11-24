<div align="center">

<img src="./LogoReadme.png" alt="ECOA Logo" width="400" />

# 🌱 ECOA - Ecosystem Companion Optimization Assistant

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

</div>

Smart plant monitoring and care system that allows users to manage their personal garden through IoT technology, artificial intelligence, and gamification.

## Description

ECOA is a complete platform that combines:
- **RESTful API Backend** with Node.js, Express, and Supabase
- **Web Frontend** with HTML, CSS, and vanilla JavaScript
- **Raspberry Pi Integration** for IoT sensors
- **External APIs** for weather data

## System Architecture

```
ECOA/
├── backend/          # RESTful API with Express and Socket.IO
├── frontend/         # Web application (client and admin)
├── raspi/            # Raspberry Pi scripts
├── integrations/     # External APIs (Weather)
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
- **Real-time**: Socket.IO and Supabase Realtime for live updates

## Integrated APIs

- **OpenWeatherMap** - Current weather data (requires API key)
- **Open-Meteo** - Weather data fallback (no API key required)
- **Supabase** - Database and real time

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

For more in-depth information about specific components of the ECOA system, refer to the following documentation:

### Setup Guides

- [**Backend README**](./backend/README.md) - Complete backend setup, API endpoints, Socket.IO events, and Supabase configuration
- [**Frontend README**](./frontend/README.md) - Frontend installation, environment variables, Vite configuration, and real-time features

### Technical References

- [**API Documentation**](./docs/api.md) - Complete REST API reference with request/response examples
- [**System Architecture**](./docs/arquitectura.md) - System design, component interactions, and data flow diagrams
- [**Database Schema**](./docs/base_datos.md) - Supabase tables, relationships, and RLS policies

## Environment Variables

Create the corresponding `.env` files:

### Backend (.env)
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server
PORT=3000
```

### Frontend (.env)
```env
# Supabase Configuration (for Realtime)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: The frontend requires Supabase credentials to enable real-time updates via Supabase Realtime and tables with real-time updates. Make sure to create a `.env` file in the `frontend/` directory with these variables before running the application.

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
