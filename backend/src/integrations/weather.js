// Integración con Open-Meteo para obtener datos del clima
// API gratuita sin API key para obtener información meteorológica actual y pronósticos

const OPENMETEO_BASE_URL = "https://api.open-meteo.com/v1";

/**
 * Obtiene el clima actual usando coordenadas (requiere geocoding previo)
 * @param {number} latitude - Latitud de la ubicación
 * @param {number} longitude - Longitud de la ubicación
 * @param {string} units - Unidades de temperatura: "celsius" o "fahrenheit"
 * @returns {Promise<Object>} - Respuesta JSON con datos del clima
 */
export async function getWeather(latitude, longitude, units = "celsius") {
  try {
    // Validar coordenadas
    if (
      !latitude ||
      !longitude ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return {
        success: false,
        error: "Coordenadas inválidas",
        message: "Se requieren coordenadas válidas (latitud y longitud)",
      };
    }

    // Validar unidades
    const validUnits = ["celsius", "fahrenheit"];
    if (!validUnits.includes(units)) {
      units = "celsius";
    }

    // Construir URL de la API
    const url = `${OPENMETEO_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&temperature_unit=${units}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error de Open-Meteo API: ${response.status}`);
    }

    const data = await response.json();

    // Procesar y formatear los datos
    const current = data.current;
    const daily = data.daily;
    const unit = units === "celsius" ? "°C" : "°F";

    const weatherData = {
      success: true,
      location: {
        latitude: latitude,
        longitude: longitude,
        timezone: data.timezone,
      },
      current: {
        temperature: Math.round(current.temperature_2m),
        apparent_temperature: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        weather_code: current.weather_code,
        cloud_cover: current.cloud_cover,
        wind_speed: current.wind_speed_10m,
        wind_direction: current.wind_direction_10m,
        unit: unit,
      },
      today: {
        max_temperature: Math.round(daily.temperature_2m_max[0]),
        min_temperature: Math.round(daily.temperature_2m_min[0]),
        precipitation: daily.precipitation_sum[0],
        weather_code: daily.weather_code[0],
        unit: unit,
      },
      hourly: data.hourly.time.slice(0, 24).map((time, index) => ({
        time: time,
        temperature: Math.round(data.hourly.temperature_2m[index]),
        humidity: data.hourly.relative_humidity_2m[index],
        precipitation_probability: data.hourly.precipitation_probability[index],
        weather_code: data.hourly.weather_code[index],
      })),
      timestamp: new Date().toISOString(),
      units: units,
    };

    return weatherData;
  } catch (error) {
    console.error("Error en getWeather:", error);

    return {
      success: false,
      error: error.message,
      message:
        "No se pudo obtener la información del clima en este momento. Por favor, intenta de nuevo más tarde.",
      fallback: true,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Obtiene el pronóstico del clima para los próximos 5 días
 * @param {string} city - Nombre de la ciudad
 * @param {string} countryCode - Código del país (opcional)
 * @param {string} units - Unidades de temperatura
 * @returns {Promise<Object>} - Respuesta JSON con pronóstico del clima
 */
export async function getWeatherForecast(
  city,
  countryCode = null,
  units = "metric"
) {
  try {
    if (!city || typeof city !== "string" || city.trim().length === 0) {
      return {
        success: false,
        error: "El nombre de la ciudad es requerido",
        message: "Por favor, proporciona el nombre de una ciudad válida",
      };
    }

    let query = city.trim();
    if (countryCode) {
      query += `,${countryCode}`;
    }

    const validUnits = ["metric", "imperial", "kelvin"];
    if (!validUnits.includes(units)) {
      units = "metric";
    }

    const url = `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(
      query
    )}&appid=${OPENWEATHER_API_KEY}&units=${units}&lang=es`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: "Ciudad no encontrada",
          message: `No se encontró la ciudad "${city}". Verifica el nombre y el código del país.`,
        };
      } else if (response.status === 401) {
        return {
          success: false,
          error: "API Key inválida",
          message: "La API key de OpenWeatherMap no es válida.",
        };
      } else {
        throw new Error(`Error de OpenWeatherMap API: ${response.status}`);
      }
    }

    const data = await response.json();

    // Procesar pronóstico por días
    const dailyForecasts = {};
    const unit = units === "metric" ? "°C" : units === "imperial" ? "°F" : "K";

    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();

      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          temperatures: [],
          weather: [],
          humidity: [],
          wind_speed: [],
        };
      }

      dailyForecasts[date].temperatures.push(Math.round(item.main.temp));
      dailyForecasts[date].weather.push({
        main: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        time: new Date(item.dt * 1000).toTimeString().split(" ")[0],
      });
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].wind_speed.push(item.wind.speed);
    });

    // Calcular promedios y extremos para cada día
    const processedForecast = Object.values(dailyForecasts).map((day) => {
      const temps = day.temperatures;
      const humidities = day.humidity;
      const windSpeeds = day.wind_speed;

      return {
        date: day.date,
        temperature: {
          min: Math.min(...temps),
          max: Math.max(...temps),
          average: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
          unit: unit,
        },
        humidity: {
          average: Math.round(
            humidities.reduce((a, b) => a + b, 0) / humidities.length
          ),
          min: Math.min(...humidities),
          max: Math.max(...humidities),
        },
        wind: {
          average: Math.round(
            windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
          ),
          max: Math.max(...windSpeeds),
        },
        weather: day.weather[Math.floor(day.weather.length / 2)], // Clima del mediodía
      };
    });

    return {
      success: true,
      city: {
        name: data.city.name,
        country: data.city.country,
        coordinates: {
          latitude: data.city.coord.lat,
          longitude: data.city.coord.lon,
        },
      },
      forecast: processedForecast,
      timestamp: new Date().toISOString(),
      units: units,
    };
  } catch (error) {
    console.error("Error en getWeatherForecast:", error);

    return {
      success: false,
      error: error.message,
      message: "No se pudo obtener el pronóstico del clima en este momento.",
      fallback: true,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Obtiene recomendaciones de cuidado de plantas basadas en el clima
 * @param {string} city - Nombre de la ciudad
 * @param {string} plantType - Tipo de planta (opcional)
 * @returns {Promise<Object>} - Respuesta JSON con recomendaciones
 */
export async function getPlantCareRecommendations(city, plantType = null) {
  try {
    const weatherData = await getWeather(city);

    if (!weatherData.success) {
      return weatherData;
    }

    const { temperature, humidity, weather } = weatherData;
    let recommendations = [];

    // Recomendaciones basadas en temperatura
    if (temperature.current < 10) {
      recommendations.push(
        "🌡️ Temperatura baja: Considera proteger tus plantas del frío o moverlas a un lugar más cálido."
      );
    } else if (temperature.current > 30) {
      recommendations.push(
        "🌡️ Temperatura alta: Asegúrate de que tus plantas tengan suficiente agua y sombra."
      );
    }

    // Recomendaciones basadas en humedad
    if (humidity < 30) {
      recommendations.push(
        "💧 Humedad baja: Considera rociar las hojas o usar un humidificador para tus plantas tropicales."
      );
    } else if (humidity > 80) {
      recommendations.push(
        "💧 Humedad alta: Ten cuidado con el exceso de riego y asegúrate de buena ventilación."
      );
    }

    // Recomendaciones basadas en el clima
    if (weather.main === "Rain") {
      recommendations.push(
        "🌧️ Lluvia: Reduce el riego manual y verifica que el drenaje sea adecuado."
      );
    } else if (weather.main === "Clear") {
      recommendations.push(
        "☀️ Día soleado: Perfecto para plantas que necesitan mucha luz, pero vigila la deshidratación."
      );
    } else if (weather.main === "Clouds") {
      recommendations.push(
        "☁️ Día nublado: Buen momento para regar plantas que prefieren luz indirecta."
      );
    }

    // Recomendaciones específicas por tipo de planta
    if (plantType) {
      const plantTypeLower = plantType.toLowerCase();

      if (
        plantTypeLower.includes("suculenta") ||
        plantTypeLower.includes("cactus")
      ) {
        if (weather.main === "Rain") {
          recommendations.push(
            "🌵 Plantas suculentas: Evita el riego adicional durante la lluvia."
          );
        }
      } else if (
        plantTypeLower.includes("orquídea") ||
        plantTypeLower.includes("orquidea")
      ) {
        if (humidity < 50) {
          recommendations.push(
            "🌸 Orquídeas: Necesitan más humedad. Considera rociar o usar una bandeja con agua."
          );
        }
      }
    }

    return {
      success: true,
      city: weatherData.city,
      current_weather: {
        temperature: temperature.current,
        humidity: humidity,
        condition: weather.description,
      },
      recommendations: recommendations,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error en getPlantCareRecommendations:", error);

    return {
      success: false,
      error: error.message,
      message: "No se pudieron generar recomendaciones en este momento.",
      fallback: true,
      timestamp: new Date().toISOString(),
    };
  }
}
