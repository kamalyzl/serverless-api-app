import axios from "axios";
import { SwapiService } from "../../domain/services/swapiService";
import logger from "../logger/logger";

const BASE_URL = "https://swapi.py4e.com/api";

interface SwapiCharacterResponse {
  name: string;
  homeworld: string;
}

interface SwapiPlanetResponse {
  name: string;
  climate: string;
  terrain: string;
  population: string;
}

export class SwapiApiService implements SwapiService {
  async getCharacter(id: number): Promise<{ name: string; homeworld: string }> {
    const requestId = `swapi-${id}-${Date.now()}`;
    
    logger.info(`Iniciando llamada a SWAPI para ${id}`, {
      requestId,
      characterId: id,
      url: `${BASE_URL}/people/${id}`,
      service: 'swapi'
    });
    
    try {
      const startTime = Date.now();
      const res = await axios.get<SwapiCharacterResponse>(`${BASE_URL}/people/${id}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      logger.info('Llamada a SWAPI exitosa', {
        requestId,
        characterId: id,
        responseTime: `${responseTime}ms`,
        statusCode: res.status,
        data: {
          name: res.data.name,
          homeworld: res.data.homeworld
        },
        service: 'swapi'
      });
      
      return { name: res.data.name, homeworld: res.data.homeworld };
    } catch (error: unknown) {
      const errorDetails = {
        requestId,
        characterId: id,
        url: `${BASE_URL}/people/${id}`,
        service: 'swapi',
        error: {
          message: error instanceof Error ? error.message : 'Error desconocido',
          status: (error as any)?.response?.status || 'N/A',
          statusText: (error as any)?.response?.statusText || 'N/A'
        }
      };
      
      logger.error('Error en llamada a SWAPI', errorDetails);
      throw error;
    }
  }


  async getPlanetDataFromUrl(homeworldUrl: string): Promise<{ name: string; climate: string; terrain: string; population: string }> {
    const requestId = `swapi-planet-url-${Date.now()}`;
    
    logger.info('Iniciando llamada a SWAPI para planeta desde URL', {
      requestId,
      homeworldUrl,
      service: 'swapi'
    });
    
    try {
      const startTime = Date.now();
      const response = await fetch(homeworldUrl);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const planetData = await response.json() as SwapiPlanetResponse;
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      logger.info('Llamada a SWAPI para planeta desde URL exitosa', {
        requestId,
        homeworldUrl,
        responseTime: `${responseTime}ms`,
        statusCode: response.status,
        data: {
          name: planetData.name,
          climate: planetData.climate,
          terrain: planetData.terrain,
          population: planetData.population
        },
        service: 'swapi'
      });
      
      return {
        name: planetData.name,
        climate: planetData.climate,
        terrain: planetData.terrain,
        population: planetData.population
      };
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
      
      logger.error('Error en llamada a SWAPI para planeta desde URL', errorDetails);
      throw error;
    }
  }
}
