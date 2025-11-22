# 🌦️ Weather API Documentation

This document details the endpoints available in the ECOA Weather API integration. This service allows retrieving current weather data for a specific city or obtaining a greeting based on the time of day.

## Base URL

All endpoints are prefixed with `/api/integrations`.

## Endpoints

### 1. Get Current Weather

Retrieves the current weather for a specific city.

- **URL**: `/weather`
- **Method**: `GET`
- **Query Parameters**:
    - `city` (optional): Name of the city. Default: "Cali".
    - `country` (optional): ISO 3166 country code. Default: "CO".

#### Request Example

```http
GET /api/integrations/weather?city=Bogota&country=CO
```

#### Response Example (Success)

```json
{
  "success": true,
  "temperature": 19,
  "description": "Cloudy",
  "city": "Bogotá",
  "country": "CO",
  "humidity": 65,
  "icon": "03d",
  "timestamp": "2023-11-22T15:30:00.000Z"
}
```

#### Response Example (Error)

```json
{
  "success": false,
  "error": "City not found",
  "message": "City not found: Atlantis",
  "timestamp": "2023-11-22T15:30:00.000Z"
}
```

---

### 2. Get Greeting

Returns a greeting appropriate for the time of day (Morning, Afternoon, Evening, Night).

- **URL**: `/weather/greeting`
- **Method**: `GET`
- **Query Parameters**:
    - `hour` (optional): Hour of the day (0-23) to force a specific greeting. If not provided, uses server time.

#### Request Example

```http
GET /api/integrations/weather/greeting
```

#### Response Example

```json
{
  "success": true,
  "greeting": "Good Afternoon",
  "hour": 15,
  "timestamp": "2023-11-22T15:30:00.000Z"
}
```

---

### 3. Get Combined Weather & Greeting

Retrieves both the current weather and the appropriate greeting in a single request.

- **URL**: `/weather/combined`
- **Method**: `GET`
- **Query Parameters**:
    - `city` (optional): Name of the city. Default: "Cali".
    - `country` (optional): ISO 3166 country code. Default: "CO".

#### Request Example

```http
GET /api/integrations/weather/combined?city=Medellin
```

#### Response Example

```json
{
  "success": true,
  "weather": {
    "temperature": 22,
    "description": "Light rain",
    "city": "Medellín",
    "country": "CO",
    "humidity": 70,
    "icon": "09d"
  },
  "greeting": "Good Afternoon",
  "error": null,
  "timestamp": "2023-11-22T15:30:00.000Z"
}
```

---

### 4. Integrations Status

Checks the status of all integrations, including the database and the Weather API.

- **URL**: `/status`
- **Method**: `GET`

#### Request Example

```http
GET /api/integrations/status
```

#### Response Example

```json
{
  "success": true,
  "message": "Integrations status",
  "database": {
    "status": "connected",
    "message": "Successful connection"
  },
  "integrations": {
    "weather": {
      "name": "Weather API",
      "status": "available",
      "endpoints": [
        "GET /api/integrations/weather",
        "GET /api/integrations/weather/greeting",
        "GET /api/integrations/weather/combined"
      ]
    }
  },
  "timestamp": "2023-11-22T15:30:00.000Z"
}
```

## Error Handling

In case of internal server errors, the API will return a 500 status code with the following format:

```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error details..."
}
```
