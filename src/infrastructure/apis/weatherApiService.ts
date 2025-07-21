import axios from "axios";
import { WeatherService } from "../../domain/services/weatherService";
import { cacheService } from "../cache/cacheService";
import { WeatherResponse } from "./types/WeatherResponse";
import { logWeatherStart, logWeatherSuccess, logWeatherError } from "../logger/weatherLogger";

export class WeatherApiService implements WeatherService {
    
    private readonly baseUrl = process.env.WEATHER_BASE_URL!;

    async getWeather(latitude: number, longitude: number): Promise<{ temperature: number; windspeed: number }> {
        const requestId = `weather-${latitude}-${longitude}-${Date.now()}`;
        
        const cachedWeather = await cacheService.getWeather<{ temperature: number; windspeed: number }>(latitude, longitude);
        if (cachedWeather) {
            return cachedWeather;
        }
        
        logWeatherStart({
            requestId,
            coordinates: { latitude, longitude },
            url: this.baseUrl,
            service: 'weather'
        });
        
        const params = {
            latitude,
            longitude,
            current_weather: true,
        };
        
        try {
            const startTime = Date.now();
            const res = await axios.get<WeatherResponse>(this.baseUrl, { params });
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            const weatherData = {
                temperature: res.data.current_weather.temperature,
                windspeed: res.data.current_weather.windspeed,
            };
            
            await cacheService.setWeather(latitude, longitude, weatherData);
            
            logWeatherSuccess({
                requestId,
                responseTime,
                statusCode: res.status,
                data: {
                    temperature: res.data.current_weather.temperature,
                    windspeed: res.data.current_weather.windspeed,
                    timestamp: res.data.current_weather.time
                },
                service: 'weather'
            });

            return weatherData;
        } catch (error: unknown) {
            const errorDetails = {
                requestId,
                coordinates: { latitude, longitude },
                url: this.baseUrl,
                params,
                service: 'weather',
                error: {
                    message: error instanceof Error ? error.message : 'Error desconocido',
                    status: (error as any)?.response?.status || 'N/A',
                    statusText: (error as any)?.response?.statusText || 'N/A'
                }
            };
            
            logWeatherError(errorDetails);
            throw error;
        }
    }
}
