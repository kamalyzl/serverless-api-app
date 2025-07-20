import { PlanetWeatherRecord } from "../../domain/models/PlanetWeatherRecord";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";
import { IPlanetWeatherRepository } from '../../domain/repositories/IPlanetWeatherRepository';

export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey?: Record<string, any>;
}
export class GetPlanetWeatherHistoryUseCase {
  constructor(
    private readonly repository: IPlanetWeatherRepository
  ) { }

  async execute(limit: number, lastKey?: Record<string, any>): Promise<PaginatedResult<PlanetWeatherRecord>> {
    return await this.repository.getPaginatedOrderedByDate(limit, lastKey);
  }
}
