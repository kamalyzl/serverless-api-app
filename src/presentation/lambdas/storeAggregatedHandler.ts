import { APIGatewayProxyHandler } from "aws-lambda";
import 'dotenv/config';
import { v4 as uuidv4 } from "uuid";
import { StorePlanetWeatherUseCase } from "../../application/useCases/StorePlanetWeather";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";
import { CreatePlanetWeatherDTOSchema } from '../../domain/dtos/CreatePlanetWeatherDTO';
import { PlanetWeatherRecord } from '../../domain/models/PlanetWeatherRecord';

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const parseResult = CreatePlanetWeatherDTOSchema.safeParse(body);

    if (!parseResult.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Validation failed",
          errors: parseResult.error.flatten().fieldErrors,
        }),
      };
    }

    const record: PlanetWeatherRecord = {
      ...body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    const repository = new DynamoPlanetWeatherRepository();
    const useCase = new StorePlanetWeatherUseCase(repository);

    await useCase.execute(record);

    return {
      statusCode: 201,
      body: JSON.stringify(record),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
