import { PlanetWeatherRecord } from "../../domain/models/PlanetWeatherRecord"; import { IPlanetWeatherRepository } from '../../domain/repositories/IPlanetWeatherRepository';
import logger from "../../infrastructure/logger/logger";

export class GetPlanetWeatherHistoryUseCase {
  constructor(
    private readonly repository: IPlanetWeatherRepository
  ) { }

  async execute(limit: number, lastKey?: Record<string, any>): Promise<{ items: PlanetWeatherRecord[]; lastEvaluatedKey?: Record<string, any> }> {
    try {
      return await this.repository.getPaginatedOrderedByDate(limit, lastKey);
    } catch (error) {
      logger.error('Error al obtener el historial de clima de planetas', {
        error: error instanceof Error ? error.message : error,
        limit,
        lastKey
      });
      throw error;
    }
  }
}
