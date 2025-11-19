// backend/src/services/integrations/weather.service.js
// Integración con API de clima
// Usa OpenWeatherMap API (requiere API key) o Open-Meteo como alternativa

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1";

/**
 * Obtiene el clima actual por ciudad
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código del país (opcional, ej: "CO", "MX", "US")
 * @returns {Object} - Datos del clima
 */
export async function getCurrentWeather(city = "Cali", countryCode = "CO") {
  try {
    // Intentar usar OpenWeatherMap si hay API key
    if (OPENWEATHER_API_KEY) {
      const query = countryCode ? `${city},${countryCode}` : city;
      const url = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(query)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          temperature: Math.round(data.main.temp),
          description: data.weather[0].description,
          city: data.name,
          country: data.sys.country,
          humidity: data.main.humidity,
          icon: data.weather[0].icon,
          timestamp: new Date().toISOString(),
        };
      }
    }
    
    // Si OpenWeatherMap falla o no hay API key, usar Open-Meteo (no requiere API key)
    // Primero obtener coordenadas de la ciudad usando geocoding
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`;
    const geoResponse = await fetch(geocodeUrl);
    
    if (!geoResponse.ok) {
      throw new Error("Error obteniendo coordenadas de la ciudad");
    }
    
    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      return {
        success: false,
        error: "Ciudad no encontrada",
        message: `No se encontró la ciudad: ${city}`,
      };
    }
    
    const location = geoData.results[0];
    const { latitude, longitude } = location;
    
    // Obtener clima actual
    const weatherUrl = `${OPEN_METEO_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto&forecast_days=1`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error("Error obteniendo datos del clima");
    }
    
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    
    // Convertir código de clima a descripción
    const weatherDescriptions = {
      0: "Despejado",
      1: "Mayormente despejado",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Niebla",
      48: "Niebla helada",
      51: "Llovizna ligera",
      53: "Llovizna moderada",
      55: "Llovizna densa",
      56: "Llovizna helada ligera",
      57: "Llovizna helada densa",
      61: "Lluvia ligera",
      63: "Lluvia moderada",
      65: "Lluvia intensa",
      66: "Lluvia helada ligera",
      67: "Lluvia helada intensa",
      71: "Nieve ligera",
      73: "Nieve moderada",
      75: "Nieve intensa",
      77: "Granos de nieve",
      80: "Chubascos ligeros",
      81: "Chubascos moderados",
      82: "Chubascos intensos",
      85: "Chubascos de nieve ligeros",
      86: "Chubascos de nieve intensos",
      95: "Tormenta",
      96: "Tormenta con granizo ligero",
      99: "Tormenta con granizo intenso",
    };
    
    return {
      success: true,
      temperature: Math.round(current.temperature_2m),
      description: weatherDescriptions[current.weather_code] || "Desconocido",
      city: location.name,
      country: location.country_code?.toUpperCase() || countryCode,
      humidity: current.relative_humidity_2m,
      icon: getWeatherIcon(current.weather_code),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error obteniendo clima:", error);
    return {
      success: false,
      error: error.message,
      message: "No se pudo obtener el clima en este momento.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Obtiene el saludo según la hora del día
 * @param {number} hour - Hora del día (0-23)
 * @returns {string} - Saludo apropiado
 */
export function getGreetingByTime(hour = null) {
  if (hour === null) {
    hour = new Date().getHours();
  }
  
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good Afternoon";
  } else if (hour >= 18 && hour < 22) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
}

/**
 * Convierte código de clima de Open-Meteo a icono
 * @param {number} weatherCode - Código del clima
 * @returns {string} - Nombre del icono
 */
function getWeatherIcon(weatherCode) {
  if (weatherCode === 0 || weatherCode === 1) return "01d"; // Despejado
  if (weatherCode === 2) return "02d"; // Parcialmente nublado
  if (weatherCode === 3) return "03d"; // Nublado
  if (weatherCode >= 45 && weatherCode <= 48) return "50d"; // Niebla
  if (weatherCode >= 51 && weatherCode <= 67) return "09d"; // Lluvia
  if (weatherCode >= 71 && weatherCode <= 77) return "13d"; // Nieve
  if (weatherCode >= 80 && weatherCode <= 86) return "09d"; // Chubascos
  if (weatherCode >= 95 && weatherCode <= 99) return "11d"; // Tormenta
  return "01d"; // Por defecto
}

