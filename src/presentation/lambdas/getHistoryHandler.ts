import { APIGatewayProxyHandler } from "aws-lambda";
import { GetPlanetWeatherHistoryUseCase } from "../../application/useCases/GetPlanetWeatherHistory";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";
import 'dotenv/config';
import { logErrorIfNotTest } from '../../infrastructure/logger/logErrorIfNotTest';
import { responseOk, responseError } from '../../shared/utils/httpResponses';
import { getLimit, getLastKey } from '../../shared/utils/requestUtils';
import logger from '../../infrastructure/logger/logger';

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const repository = new DynamoPlanetWeatherRepository();
    const useCase = new GetPlanetWeatherHistoryUseCase(repository);

    const limit = getLimit(event, 10);
    const lastKey = getLastKey(event);

    const start = Date.now();
    const result = await useCase.execute(limit, lastKey);
    const duration = Date.now() - start;
    logger.info(`Function duration: ${duration}ms`);
    return responseOk(result);
  } catch (error) {
    logErrorIfNotTest('Error al obtener historial:', error);
    return responseError('Internal Server Error');
  }
};
