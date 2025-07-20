import { APIGatewayProxyHandler } from "aws-lambda";
import { GetPlanetWeatherHistoryUseCase } from "../../application/useCases/GetPlanetWeatherHistory";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";
import 'dotenv/config';

export const main: APIGatewayProxyHandler = async () => {
  try {
    const repository = new DynamoPlanetWeatherRepository();
    const useCase = new GetPlanetWeatherHistoryUseCase(repository);

    const records = await useCase.execute();

    return {
      statusCode: 200,
      body: JSON.stringify(records),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
