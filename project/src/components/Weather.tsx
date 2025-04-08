import React, { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  cloudCover: number;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = import.meta.env.VITE_TOMORROW_API_KEY;
        const city = "London"; // You can make this configurable
        const response = await fetch(
          `https://api.tomorrow.io/v4/weather/realtime?location=${city}&apikey=${API_KEY}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        setWeather({
          temperature: Math.round(data.data.values.temperature),
          description: getWeatherDescription(data.data.values.weatherCode),
          humidity: data.data.values.humidity,
          windSpeed: data.data.values.windSpeed,
          precipitationProbability: data.data.values.precipitationProbability,
          cloudCover: data.data.values.cloudCover,
        });
      } catch (err) {
        setError("Failed to load weather data");
        console.error("Weather fetch error:", err);
      }
    };

    fetchWeather();
    // Update weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherDescription = (code: number): string => {
    const weatherCodes: { [key: number]: string } = {
      1000: "Clear",
      1001: "Cloudy",
      1100: "Mostly Clear",
      1101: "Partly Cloudy",
      1102: "Mostly Cloudy",
      2000: "Fog",
      4000: "Drizzle",
      4001: "Light Rain",
      4200: "Light Rain",
      4201: "Heavy Rain",
      5000: "Snow",
      5001: "Flurries",
      5100: "Light Snow",
      6000: "Freezing Drizzle",
      6200: "Light Freezing Rain",
      6201: "Heavy Freezing Rain",
      7000: "Ice Pellets",
      7101: "Light Ice Pellets",
      7102: "Heavy Ice Pellets",
      8000: "Thunderstorm",
    };
    return weatherCodes[code] || "Unknown";
  };

  if (error) {
    return <div className="weather-widget error">{error}</div>;
  }

  if (!weather) {
    return <div className="weather-widget loading">Loading weather...</div>;
  }

  return (
    <div className="weather-widget">
      <h3>Weather</h3>
      <div className="weather-content">
        <div className="temperature">{weather.temperature}°C</div>
        <div className="description">{weather.description}</div>
        <div className="details">
          <div>Humidity: {weather.humidity}%</div>
          <div>Wind: {weather.windSpeed} m/s</div>
          <div>Cloud Cover: {weather.cloudCover}%</div>
          <div>Rain Chance: {weather.precipitationProbability}%</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
