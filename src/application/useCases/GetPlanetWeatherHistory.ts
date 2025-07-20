import { PlanetWeatherRecord } from "../../domain/models/PlanetWeatherRecord";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";

export class GetPlanetWeatherHistoryUseCase {
  constructor(private readonly repository: DynamoPlanetWeatherRepository) {}

  async execute(): Promise<PlanetWeatherRecord[]> {
    return await this.repository.getAll();
  }
}
