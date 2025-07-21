import axios from "axios";
import { WeatherService } from "../../domain/services/weatherService";
import logger from "../logger/logger";
import { cacheService } from "../cache/cacheService";

interface WeatherResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    time: string;
  };
}

export class WeatherApiService implements WeatherService {
    
    private readonly baseUrl = "https://api.open-meteo.com/v1/forecast";

    async getWeather(latitude: number, longitude: number): Promise<{ temperature: number; windspeed: number }> {
        const requestId = `weather-${latitude}-${longitude}-${Date.now()}`;
        
        // Intentar obtener del cache primero
        const cachedWeather = await cacheService.getWeather<{ temperature: number; windspeed: number }>(latitude, longitude);
        if (cachedWeather) {
            logger.info('Weather obtenido del cache', {
                requestId,
                coordinates: { latitude, longitude },
                service: 'weather'
            });
            return cachedWeather;
        }
        
        logger.info('Iniciando llamada a Weather API', {
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
            
            // Guardar en cache
            await cacheService.setWeather(latitude, longitude, weatherData);
            
            logger.info('Llamada a Weather API exitosa', {
                requestId,
                responseTime: `${responseTime}ms`,
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
            
            logger.error('Error en llamada a Weather API', errorDetails);
            throw error;
        }
    }
}
