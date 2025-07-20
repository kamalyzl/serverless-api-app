import { Character, Planet, PlanetWeatherRecord, Weather } from '../../domain/models/PlanetWeatherRecord';
import { v4 as uuidv4 } from 'uuid';

export function mapToPlanetWeatherRecord(
  character: Character,
  planet: Planet,
  weather: Weather
): PlanetWeatherRecord {
  return {
    id: uuidv4(),
    character: {
      name: character.name,
      homeworld: character.homeworld,
    },
    planet: {
      name: planet.name,
      climate: planet.climate,
      terrain: planet.terrain,
      population: planet.population,
    },
    weather: {
      temperature: weather.temperature,
      windspeed: weather.windspeed,
    },
    createdAt: new Date().toISOString(),
  };
}