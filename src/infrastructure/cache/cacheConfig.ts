export interface CacheConfig {
    ttlSeconds: number;
    prefix: string;
  }
  
  export const CACHE_CONFIGS = {
    SWAPI_CHARACTER: { ttlSeconds: 5 * 60, prefix: 'swapi:character' },
    SWAPI_PLANET: { ttlSeconds: 5 * 60, prefix: 'swapi:planet' },
    WEATHER: { ttlSeconds: 30 * 60, prefix: 'weather' }, // 30 minutos
  } as const;
  