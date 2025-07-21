import {
  PutCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { dynamoDb } from '../database/dynamo/dynamoClient';
import { PlanetWeatherRecord } from '../../domain/models/PlanetWeatherRecord';
import { IPlanetWeatherRepository } from '../../domain/repositories/IPlanetWeatherRepository';
import logger from '../logger/logger';
import { sortByCreatedAtDesc } from '../../shared/utils/sortByCreatedAt';

export class DynamoPlanetWeatherRepository implements IPlanetWeatherRepository {

  private tableName = process.env.DYNAMODB_TABLE;

  async save(record: PlanetWeatherRecord): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: record,
    });
    try {
      await dynamoDb.send(command);
      logger.info('Registro guardado exitosamente en DynamoDB', { tableName: this.tableName, recordId: record.id });
    } catch (error) {
      logger.error('Error al guardar registro en DynamoDB', { error: error instanceof Error ? error.message : error, tableName: this.tableName, recordId: record.id });
      throw error;
    }
  }

  async getAll(): Promise<PlanetWeatherRecord[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });
    try {
      const response = await dynamoDb.send(command);
      logger.info('Registros obtenidos exitosamente de DynamoDB', { count: response.Items?.length });
      return response.Items as PlanetWeatherRecord[];
    } catch (error) {
      logger.error('Error al obtener registros de DynamoDB', { error: error instanceof Error ? error.message : error, tableName: this.tableName });
      throw error;
    }
  }

  async getPaginatedOrderedByDate(
    limit = 10,
    lastEvaluatedKey?: Record<string, AttributeValue>
  ): Promise<{
    items: PlanetWeatherRecord[];
    lastEvaluatedKey?: Record<string, AttributeValue>;
    nextPageToken?: string
  }> {
    const command = new ScanCommand({
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });
    try {
      const response = await dynamoDb.send(command);
      const items = sortByCreatedAtDesc(response.Items as PlanetWeatherRecord[] || []);
      const nextPageToken = response.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(response.LastEvaluatedKey))
        : null;

      const result: {
        items: PlanetWeatherRecord[];
        lastEvaluatedKey?: Record<string, AttributeValue>;
        nextPageToken?: string;
      } = {
        items,
        lastEvaluatedKey: response.LastEvaluatedKey,
      };
      if (nextPageToken) {
        result.nextPageToken = nextPageToken;
      }
      logger.info('Registros paginados obtenidos exitosamente de DynamoDB', { count: items.length, hasNextPage: !!nextPageToken });
      return result;
    } catch (error) {
      logger.error('Error al obtener registros paginados de DynamoDB', { error: error instanceof Error ? error.message : error, tableName: this.tableName });
      throw error;
    }
  }
}
