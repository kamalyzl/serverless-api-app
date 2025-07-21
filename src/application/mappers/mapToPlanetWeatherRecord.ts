import { PlanetWeatherRecord } from '../../domain/models/PlanetWeatherRecord';
import { v4 as uuidv4 } from 'uuid';

export function mapToPlanetWeatherRecord(
  character: { name: string; homeworld: string },
  planet: { name: string; climate: string; terrain: string; population: string },
  weather: { temperature: number; windspeed: number }
): PlanetWeatherRecord {
  return {
    id: uuidv4(),
    characterName: character.name,
    planetName: planet.name,
    planetClimate: planet.climate,
    planetTerrain: planet.terrain,
    planetPopulation: planet.population,
    weatherTemperature: weather.temperature,
    weatherWindspeed: weather.windspeed,
    createdAt: new Date().toISOString(),
  };
}
