export interface WeatherService {
    getWeather(latitude: number, longitude: number): Promise<{ temperature: number; windspeed: number }>;
  }
  