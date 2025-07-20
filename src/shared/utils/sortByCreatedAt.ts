import { PlanetWeatherRecord } from '../../domain/models/PlanetWeatherRecord';

export function sortByCreatedAtDesc(records: PlanetWeatherRecord[]): PlanetWeatherRecord[] {
  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
