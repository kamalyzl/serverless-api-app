import { PlanetWeatherRecord } from "../../domain/models/PlanetWeatherRecord";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";

export class StorePlanetWeatherUseCase {
  constructor(private readonly repository: DynamoPlanetWeatherRepository) {}

  async execute(record: PlanetWeatherRecord): Promise<void> {
    await this.repository.save(record);
  }
}
