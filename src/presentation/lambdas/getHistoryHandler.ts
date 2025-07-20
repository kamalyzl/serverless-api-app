import { APIGatewayProxyHandler } from "aws-lambda";
import { GetPlanetWeatherHistoryUseCase } from "../../application/useCases/GetPlanetWeatherHistory";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";
import 'dotenv/config';
import { logErrorIfNotTest } from '../../infrastructure/logger/logErrorIfNotTest';

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const repository = new DynamoPlanetWeatherRepository();
    const useCase = new GetPlanetWeatherHistoryUseCase(repository);

    const queryParams = event.queryStringParameters || {};
    const limit = Number(queryParams.limit || 10);

    const lastKeyParam = queryParams.lastKey
      ? JSON.parse(decodeURIComponent(queryParams.lastKey))
      : undefined;

    // Validar que lastKeyParam sea un objeto y no null ni 0
    const validLastKey = (lastKeyParam && typeof lastKeyParam === 'object' && !Array.isArray(lastKeyParam)) ? lastKeyParam : undefined;

    const result = await useCase.execute(limit, validLastKey);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    logErrorIfNotTest('Error al obtener historial:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
