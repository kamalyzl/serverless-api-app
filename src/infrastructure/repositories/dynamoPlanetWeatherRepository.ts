import {
  PutCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../database/dynamo/dynamoClient';
import { PlanetWeatherRecord } from '../../domain/models/PlanetWeatherRecord';
import { IPlanetWeatherRepository } from '../../domain/repositories/IPlanetWeatherRepository';
import logger from '../logger/logger';


export class DynamoPlanetWeatherRepository implements IPlanetWeatherRepository {
  
  private tableName = process.env.DYNAMODB_TABLE;

  async save(record: PlanetWeatherRecord): Promise<void> {
 
    logger.info({ tableName: this.tableName }, 'Nombre de la tabla DynamoDB');
    logger.info({ record }, 'Guardando registro en DynamoDB');
    const command = new PutCommand({
      TableName: this.tableName,
      Item: record,
    });
    try {
      await dynamoDb.send(command);
      logger.info('Registro guardado exitosamente en DynamoDB');
    } catch (error) {
      logger.error({ error, record }, 'Error al guardar registro en DynamoDB');
      throw error;
    }
  }

  async getAll(): Promise<PlanetWeatherRecord[]> {
    logger.info('Obteniendo todos los registros de DynamoDB');
    const command = new ScanCommand({
      TableName: this.tableName,
    });
    try {
      const response = await dynamoDb.send(command);
      logger.info({ count: response.Items?.length }, 'Registros obtenidos exitosamente de DynamoDB');
      return response.Items as PlanetWeatherRecord[];
    } catch (error) {
      logger.error({ error }, 'Error al obtener registros de DynamoDB');
      throw error;
    }
  }
}
