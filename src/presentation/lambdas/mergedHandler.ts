import { APIGatewayProxyHandler } from "aws-lambda";
import { PlanetWeatherAggregator } from "../../application/useCases/PlanetWeatherAggregator";
import 'dotenv/config';
import { logErrorIfNotTest } from '../../infrastructure/logger/logErrorIfNotTest';

const planetWeatherAggregator = new PlanetWeatherAggregator();

export const main: APIGatewayProxyHandler = async (event) => {

    try {
        const characterId = Number(event.queryStringParameters?.characterId);

        if (!characterId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing characterId in query parameters" }),
            };
        }

        const result = await planetWeatherAggregator.getAggregatedPlanetWeather(characterId);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    }
    catch (error) {
        logErrorIfNotTest("Error al obtener datos agregados:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};

