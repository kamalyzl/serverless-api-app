import { redisClient } from './redisClient';
import logger from '../logger/logger';
import { CacheConfig, CACHE_CONFIGS } from './cacheConfig';

export class CacheService {
  async get<T>(config: CacheConfig, key: string): Promise<T | null> {
    const cacheKey = `${config.prefix}:${key}`;
    
    try {
      const cachedValue = await redisClient.get<T>(cacheKey);
      
      if (cachedValue) {
        logger.info('Cache hit', { cacheKey, prefix: config.prefix });
        return cachedValue;
      }
      
      logger.info('Cache miss', { cacheKey, prefix: config.prefix });
      return null;
    } catch (error) {
      logger.error('Cache GET error', { cacheKey, error });
      return null;
    }
  }

  async set<T>(config: CacheConfig, key: string, value: T): Promise<void> {
    const cacheKey = `${config.prefix}:${key}`;
    
    try {
      await redisClient.set(cacheKey, value, config.ttlSeconds);
      logger.info('Cache SET success', { cacheKey, ttl: config.ttlSeconds });
    } catch (error) {
      logger.error('Cache SET error', { cacheKey, error });
    }
  }

  async getSwapiCharacter<T>(characterId: number): Promise<T | null> {
    return this.get(CACHE_CONFIGS.SWAPI_CHARACTER, characterId.toString());
  }

  async setSwapiCharacter<T>(characterId: number, value: T): Promise<void> {
    return this.set(CACHE_CONFIGS.SWAPI_CHARACTER, characterId.toString(), value);
  }

  async getSwapiPlanet<T>(planetUrl: string): Promise<T | null> {
    const key = this.hashUrl(planetUrl);
    return this.get(CACHE_CONFIGS.SWAPI_PLANET, key);
  }

  async setSwapiPlanet<T>(planetUrl: string, value: T): Promise<void> {
    const key = this.hashUrl(planetUrl);
    return this.set(CACHE_CONFIGS.SWAPI_PLANET, key, value);
  }

  async getWeather<T>(latitude: number, longitude: number): Promise<T | null> {
    const key = `${latitude}:${longitude}`;
    return this.get(CACHE_CONFIGS.WEATHER, key);
  }

  async setWeather<T>(latitude: number, longitude: number, value: T): Promise<void> {
    const key = `${latitude}:${longitude}`;
    return this.set(CACHE_CONFIGS.WEATHER, key, value);
  }

  private hashUrl(url: string): string {
    return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }
}

export const cacheService = new CacheService();
