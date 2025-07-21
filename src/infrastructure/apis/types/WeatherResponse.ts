export interface WeatherResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    time: string;
  };
} 