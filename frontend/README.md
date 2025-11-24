# 🌱 ECOA Frontend

Web client application for the ECOA smart plant monitoring system, built with HTML5, CSS3, JavaScript ES6+, and Vite.

## Features

- **Modern and responsive** User Interface
- **Client Dashboard** for end users
- **Admin Panel** for system management
- **Real-time** with Socket.IO client and Supabase Realtime
- **PWA Ready** (Progressive Web App)
- **Optimization** with Vite bundler

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- ECOA Backend running (port 3000)

### Installation

1. **Configure environment variables**

Create a `.env` file in the `frontend/` directory with your Supabase credentials:

```env
# Supabase Configuration (for Realtime)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Important**: These environment variables are required for Supabase Realtime to work. Get your credentials from your [Supabase Dashboard](https://supabase.com/dashboard).

2. **Install dependencies**

```bash
cd frontend
npm install
```

3. **Start development server**

```bash
npm run dev
```

4. **Build for production**

```bash
npm run build
```

5. **Preview the build**

```bash
npm run preview
```

The application will be available at `http://localhost:5000`

## Project Structure

```
frontend/
├── public/
│   ├── client/           # User Panel
│   └── admin/            # Admin Panel
├── package.json
├── package-lock.json
├── vercel.json
├── .gitignore
├── vite.config.js        # Vite configuration
└── README.md
```

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Build preview
npm run preview
```

## Available Interfaces

### Client Panel (`/client`)

**Features:**

- Personal plant dashboard
- Real-time metrics monitoring
- Chat with plants using AI
- User profile and achievements
- Community donations

**Technical features:**

- Responsive design for mobile and desktop
- Socket.IO connection for live updates
- Supabase Realtime for database subscriptions
- LocalStorage for temporary data
- Fetch API for backend communication

### Admin Panel (`/admin`)

**Features:**

- System user management
- Global plant administration
- Alert and notification control
- System statistics and metrics
- Achievement and accessory management
- Integration configuration

## Technologies Used

### Core

- **HTML5** - Semantic structure
- **CSS3** - Modern styles with Flexbox/Grid
- **JavaScript ES6+** - Application logic
- **Vite 7.1** - Build tool and dev server

### Libraries and APIs

- **Socket.IO Client** - WebSockets for real-time
- **Supabase Client** - Real-time database subscriptions
- **Fetch API** - HTTP communication
- **Web APIs** - Geolocation, Notifications, etc.

### Development Tools

- **ESLint** - JavaScript linter
- **Vite** - Ultra-fast bundler
- **Hot Module Replacement** - Automatic reload

## Vite Configuration (original)

```javascript
// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "frontend/public",
  server: {
    port: 5000,
    open: true,
    proxy: {
      "/api": {
        target: "https://ecoa-ruddy.vercel.app",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "../../dist",
    rollupOptions: {
      input: {
        client: path.resolve(__dirname, "public/client/index.html"),
        admin: path.resolve(__dirname, "public/admin/index.html"),
      },
    },
  },
});
```
