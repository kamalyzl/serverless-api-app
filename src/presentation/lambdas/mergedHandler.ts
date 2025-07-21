import { APIGatewayProxyHandler } from "aws-lambda";
import { PlanetWeatherAggregator } from "../../application/useCases/PlanetWeatherAggregator";
import 'dotenv/config';
import { logErrorIfNotTest } from '../../infrastructure/logger/logErrorIfNotTest';
import logger from '../../infrastructure/logger/logger';
import { responseOk, responseBadRequest, responseError } from '../../shared/utils/httpResponses';
import { getCharacterId } from '../../shared/utils/requestUtils';

const planetWeatherAggregator = new PlanetWeatherAggregator();

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const characterId = getCharacterId(event);
    if (!characterId) {
      return responseBadRequest("El parámetro characterId es requerido y debe ser un número positivo");
    }

    const start = Date.now();
    const result = await planetWeatherAggregator.getAggregatedPlanetWeather(characterId);
    const duration = Date.now() - start;
    logger.info(`Function duration: ${duration}ms`);
    return responseOk(result);
  } catch (error) {
    logErrorIfNotTest("Error al obtener datos agregados:", error);
    return responseError("Internal Server Error");
  }
};

