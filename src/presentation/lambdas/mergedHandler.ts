import { APIGatewayProxyHandler } from "aws-lambda";
import { PlanetWeatherAggregator } from "../../application/useCases/PlanetWeatherAggregator";
import 'dotenv/config';

const planetWeatherAggregator = new PlanetWeatherAggregator();

export const main: APIGatewayProxyHandler = async (event) => {
    const result = await planetWeatherAggregator.getAggregatedPlanetWeather(1);
    
    return {
        statusCode: 200,
        body: JSON.stringify(result)
    };
};
