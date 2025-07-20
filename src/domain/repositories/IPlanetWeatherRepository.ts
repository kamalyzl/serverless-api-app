import { PlanetWeatherRecord } from "../models/PlanetWeatherRecord";

export interface IPlanetWeatherRepository {
  save(record: PlanetWeatherRecord): Promise<void>;
  getAll(): Promise<PlanetWeatherRecord[]>;
  getPaginatedOrderedByDate(
    limit?: number,
    lastEvaluatedKey?: Record<string, any>
  ): Promise<{
    items: PlanetWeatherRecord[];
    lastEvaluatedKey?: Record<string, any>;
  }>;
}
