import { APIGatewayProxyHandler } from "aws-lambda";
import 'dotenv/config';
import { v4 as uuidv4 } from "uuid";
import { StorePlanetWeatherUseCase } from "../../application/useCases/StorePlanetWeather";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";
import { CreatePlanetWeatherDTOSchema } from '../../domain/dtos/CreatePlanetWeatherDTO';
import { PlanetWeatherRecord } from '../../domain/models/PlanetWeatherRecord';
import { responseOk, responseBadRequest, responseError } from '../../shared/utils/httpResponses';
import logger from '../../infrastructure/logger/logger';

function parseAndValidateBody(event: any): PlanetWeatherRecord | null {
  try {
    const body = JSON.parse(event.body || '{}');
    const parseResult = CreatePlanetWeatherDTOSchema.safeParse(body);
    if (!parseResult.success) {
      return null;
    }
    return {
      ...body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const record = parseAndValidateBody(event);
    if (!record) {
      return responseBadRequest("Validation failed");
    }

    const repository = new DynamoPlanetWeatherRepository();
    const useCase = new StorePlanetWeatherUseCase(repository);

    const start = Date.now();
    await useCase.execute(record);
    const duration = Date.now() - start;
    logger.info(`Function duration: ${duration}ms`);

    return {
      ...responseOk(record),
      statusCode: 201
    };
  } catch (error) {
    return responseError((error as Error).message);
  }
};
