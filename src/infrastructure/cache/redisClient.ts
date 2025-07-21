import { createClient } from 'redis';
import logger from '../logger/logger';

function getRedisConfig() {
  return {
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 10000,
    },
  };

}

class RedisClient {
  private client: ReturnType<typeof createClient> | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      this.client = createClient(getRedisConfig());

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err.message });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis client not connected. Attempting to connect...', { key, isConnected: this.isConnected });
      await this.connect();
    }

    try {
      logger.info('Attempting Redis GET', { key });
      const value = await this.client!.get(key);
      logger.info('Redis GET result', { key, value });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error', {
        key,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        isConnected: this.isConnected,
        clientStatus: this.client ? this.client.isOpen : 'no client',
        env: process.env.NODE_ENV,
        redisHost: process.env.REDIS_HOST,
        redisPort: process.env.REDIS_PORT,
        redisUrl: process.env.REDIS_URL,
      });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis client not connected. Attempting to connect...', { key, isConnected: this.isConnected });
      await this.connect();
    }

    try {
      const serializedValue = JSON.stringify(value);
      logger.info('Attempting Redis SET', { key, ttlSeconds, value });
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client!.set(key, serializedValue);
      }
      logger.info('Redis SET success', { key, ttlSeconds });
    } catch (error) {
      logger.error('Redis SET error', {
        key,
        value,
        ttlSeconds,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        isConnected: this.isConnected,
        clientStatus: this.client ? this.client.isOpen : 'no client',
        env: process.env.NODE_ENV,
        redisHost: process.env.REDIS_HOST,
        redisPort: process.env.REDIS_PORT,
        redisUrl: process.env.REDIS_URL,
      });
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }

    try {
      await this.client!.del(key);
    } catch (error) {
      logger.error('Redis DEL error', { key, error });
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error', { key, error });
      return false;
    }
  }
}

export const redisClient = new RedisClient(); 