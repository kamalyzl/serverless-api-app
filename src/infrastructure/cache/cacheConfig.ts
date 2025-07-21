export interface CacheConfig {
    ttlSeconds: number;
    prefix: string;
  }
  
  export const CACHE_CONFIGS = {
    SWAPI_CHARACTER: { ttlSeconds: 30 * 60, prefix: 'swapi:character' }, // 30 minutos
    SWAPI_PLANET: { ttlSeconds: 30 * 60, prefix: 'swapi:planet' },
    WEATHER: { ttlSeconds: 30 * 60, prefix: 'weather' },
  } as const;
  