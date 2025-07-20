import { PlanetWeatherRecord } from "../models/PlanetWeatherRecord";

export interface IPlanetWeatherRepository {
  save(record: PlanetWeatherRecord): Promise<void>;
  getAll(): Promise<PlanetWeatherRecord[]>;
}
