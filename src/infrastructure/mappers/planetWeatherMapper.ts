import { PlanetWeatherRecord } from '../../domain/models/PlanetWeatherRecord';
import { marshall as awsMarshall, unmarshall as awsUnmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

export function marshallPlanetWeather(record: PlanetWeatherRecord): Record<string, AttributeValue> {
  return awsMarshall(record);
}

export function unmarshallPlanetWeather(data: Record<string, AttributeValue>): PlanetWeatherRecord {
  return awsUnmarshall(data) as PlanetWeatherRecord;
}
