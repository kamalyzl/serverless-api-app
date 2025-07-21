import axios from "axios";
import { SwapiService } from "../../domain/services/swapiService";
import logger from "../logger/logger";
import { cacheService } from "../cache/cacheService";
import { SwapiCharacterResponse } from "./types/SwapiCharacterResponse";
import { SwapiPlanetResponse } from "./types/SwapiPlanetResponse";
import { logSwapiStart, logSwapiSuccess, logSwapiError } from "../logger/swapiLogger";

export class SwapiApiService implements SwapiService {
  private readonly baseUrl = process.env.SWAPI_BASE_URL!;

  async getCharacter(id: number): Promise<{ name: string; homeworld: string }> {
    const requestId = `swapi-${id}-${Date.now()}`;
    
    const cachedCharacter = await cacheService.getSwapiCharacter<{ name: string; homeworld: string }>(id);
    if (cachedCharacter) {
      return cachedCharacter;
    }
    
    logSwapiStart({ requestId, characterId: id, url: `${this.baseUrl}/people/${id}`, service: 'swapi' });
    
    try {
      const startTime = Date.now();
      const res = await axios.get<SwapiCharacterResponse>(`${this.baseUrl}/people/${id}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const characterData = { name: res.data.name, homeworld: res.data.homeworld };
      
      await cacheService.setSwapiCharacter(id, characterData);
      
      logSwapiSuccess({ requestId, characterId: id, responseTime, statusCode: res.status, data: {
          name: res.data.name,
          homeworld: res.data.homeworld
        }, service: 'swapi' });
      
      return characterData;
    } catch (error: unknown) {
      const errorDetails = {
        requestId,
        characterId: id,
        url: `${this.baseUrl}/people/${id}`,
        service: 'swapi',
        error: {
          message: error instanceof Error ? error.message : 'Error desconocido',
          status: (error as any)?.response?.status || 'N/A',
          statusText: (error as any)?.response?.statusText || 'N/A'
        }
      };
      
      logSwapiError({ requestId, characterId: id, url: `${this.baseUrl}/people/${id}`, service: 'swapi', error: errorDetails });
      throw error;
    }
  }


  async getPlanetDataFromUrl(homeworldUrl: string): Promise<{ name: string; climate: string; terrain: string; population: string }> {
    const requestId = `swapi-planet-url-${Date.now()}`;
    
    const cachedPlanet = await cacheService.getSwapiPlanet<{ name: string; climate: string; terrain: string; population: string }>(homeworldUrl);
    if (cachedPlanet) {
      return cachedPlanet;
    }
    
    logSwapiStart({ requestId, homeworldUrl, service: 'swapi' });
    
    try {
      const startTime = Date.now();
      const response = await fetch(homeworldUrl);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const planetData = await response.json() as SwapiPlanetResponse;
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const planetResult = {
        name: planetData.name,
        climate: planetData.climate,
        terrain: planetData.terrain,
        population: planetData.population
      };
      
      // Guardar en cache
      await cacheService.setSwapiPlanet(homeworldUrl, planetResult);
      
      logSwapiSuccess({
        requestId,
        homeworldUrl,
        responseTime,
        statusCode: response.status,
        data: planetResult,
        service: 'swapi'
      });
      
      return planetResult;
    } catch (error: unknown) {
      const errorDetails = {
        requestId,
        homeworldUrl,
        service: 'swapi',
        error: {
          message: error instanceof Error ? error.message : 'Error desconocido',
          status: (error as any)?.response?.status || 'N/A',
          statusText: (error as any)?.response?.statusText || 'N/A'
        }
      };
      
      logSwapiError(errorDetails);
      throw error;
    }
  }
}
