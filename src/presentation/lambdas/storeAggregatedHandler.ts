import { APIGatewayProxyHandler } from "aws-lambda";
import 'dotenv/config';
import { v4 as uuidv4 } from "uuid";
import { StorePlanetWeatherUseCase } from "../../application/useCases/StorePlanetWeather";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const record = {
      ...body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    const repository = new DynamoPlanetWeatherRepository();
    const useCase = new StorePlanetWeatherUseCase(repository);

    await useCase.execute(record);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Record stored successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
