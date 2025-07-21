export interface PlanetWeatherRecord {
  id: string; // UUID o timestamp como identificador
  characterName: string;
  planetName: string;
  planetClimate: string;
  planetTerrain: string;
  planetPopulation: string;
  weatherTemperature: number;
  weatherWindspeed: number;
  createdAt: string; // ISO
}
