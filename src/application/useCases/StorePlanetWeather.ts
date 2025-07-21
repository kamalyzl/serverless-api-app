import { PlanetWeatherRecord } from "../../domain/models/PlanetWeatherRecord";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";
import logger from "../../infrastructure/logger/logger";

export class StorePlanetWeatherUseCase {
  constructor(private readonly repository: DynamoPlanetWeatherRepository) {}

  async execute(record: PlanetWeatherRecord): Promise<void> {
    try {
      await this.repository.save(record);
    } catch (error) {
      logger.error('Error al guardar registro del clima del planeta', {
        error: error instanceof Error ? error.message : error,
        recordId: record.id
      });
      throw error;
    }
  }
}
