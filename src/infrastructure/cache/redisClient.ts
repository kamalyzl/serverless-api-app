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
        this.isConnected = true;
      });

      this.client.on('ready', () => { });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }

    try {
      const value = await this.client!.get(key);
      logger.info('Redis GET success', { key, found: !!value });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error', {
        key,
        isConnected: this.isConnected
      });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }

    try {
      const serializedValue = JSON.stringify(value);
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
        isConnected: this.isConnected
      });
      throw error;
    }
  }
}

export const redisClient = new RedisClient(); 