import { PlanetWeatherAggregator } from '../../../src/application/useCases/PlanetWeatherAggregator';
import { SwapiApiService } from '../../../src/infrastructure/apis/swapiApiService';
import { WeatherApiService } from '../../../src/infrastructure/apis/weatherApiService';
import { DynamoPlanetWeatherRepository } from '../../../src/infrastructure/repositories/dynamoPlanetWeatherRepository';

jest.mock('../../../src/infrastructure/apis/swapiApiService');
jest.mock('../../../src/infrastructure/apis/weatherApiService');
jest.mock('../../../src/infrastructure/repositories/dynamoPlanetWeatherRepository');

// NO mockees Date

describe('PlanetWeatherAggregator integración parcial (mock DynamoDB, SWAPI y Weather)', () => {
  const characterId = 1;
  const fakeCharacter = { name: 'Luke Skywalker', homeworld: 'https://swapi.py4e.com/api/planets/1/' };
  const fakePlanet = {
    name: 'Tatooine',
    climate: 'arid',
    terrain: 'desert',
    population: '200000',
  };
  const fakeWeather = { temperature: 42, windspeed: 7 };

  beforeEach(() => {
    (SwapiApiService as jest.Mock).mockImplementation(() => ({
      getCharacter: jest.fn().mockResolvedValue(fakeCharacter),
      getPlanetDataFromUrl: jest.fn().mockResolvedValue(fakePlanet),
    }));
    (WeatherApiService as jest.Mock).mockImplementation(() => ({
      getWeather: jest.fn().mockResolvedValue(fakeWeather),
    }));
    (DynamoPlanetWeatherRepository as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(undefined),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería integrar correctamente los datos mockeados y no guardar en DynamoDB real', async () => {
    const aggregator = new PlanetWeatherAggregator();
    const result = await aggregator.getAggregatedPlanetWeather(characterId);

    expect(result).toMatchObject({
      characterName: fakeCharacter.name,
      planetName: fakePlanet.name,
      planetClimate: fakePlanet.climate,
      planetTerrain: fakePlanet.terrain,
      planetPopulation: fakePlanet.population,
      weatherTemperature: fakeWeather.temperature,
      weatherWindspeed: fakeWeather.windspeed,
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });
});
