
import { planetCoordinates } from "../../domain/PlanetLocation";
import { PlanetCoordinates } from "../../domain/value-objects/PlanetCoordinates";
import { SwapiApiService } from "../../infrastructure/apis/swapiApiService";
import { WeatherApiService } from "../../infrastructure/apis/weatherApiService";
import { PlanetWeatherRecord } from "../../domain/models/PlanetWeatherRecord";
import { logAggregatorError } from "../../infrastructure/logger/planetWeatherAggregatorLogger";
import { StorePlanetWeatherUseCase } from "./StorePlanetWeather";
import { DynamoPlanetWeatherRepository } from "../../infrastructure/repositories/dynamoPlanetWeatherRepository";
import { mapToPlanetWeatherRecord } from "../mappers/mapToPlanetWeatherRecord";

export class PlanetWeatherAggregator {
    private readonly swapiApiService: SwapiApiService;
    private readonly weatherApiService: WeatherApiService;
    private readonly storePlanetWeatherUseCase: StorePlanetWeatherUseCase;

    constructor() {
        this.swapiApiService = new SwapiApiService();
        this.weatherApiService = new WeatherApiService();
        this.storePlanetWeatherUseCase = new StorePlanetWeatherUseCase(new DynamoPlanetWeatherRepository());
    }

    async getAggregatedPlanetWeather(characterId: number): Promise<PlanetWeatherRecord> {
        try {
            const character = await this.getCharacterData(characterId);
            const planet = await this.getPlanetDataFromUrl(character.homeworld);
            const coordinates = this.getPlanetCoordinates(planet.name);
            const weather = await this.getWeatherData(coordinates);

            const record = mapToPlanetWeatherRecord(character, planet, weather);
            await this.storePlanetWeatherRecord(record, characterId);
            return record;
        } catch (error) {
            logAggregatorError('Error en agregación de datos planeta-clima', { characterId }, error);
            throw error;
        }
    }

    private async storePlanetWeatherRecord(record: PlanetWeatherRecord, characterId: number): Promise<void> {
        try {
            await this.storePlanetWeatherUseCase.execute(record);
        } catch (storeError) {
            logAggregatorError('Error almacenando el registro de clima de planeta', { characterId, recordId: record.id }, storeError);
            throw new Error('Error almacenando el registro de clima de planeta: ' + (storeError instanceof Error ? storeError.message : 'Error desconocido'));
        }
    }

    private async getCharacterData(characterId: number) {
        try {
            return await this.swapiApiService.getCharacter(characterId);
        } catch (error) {
            logAggregatorError('Error obteniendo datos del personaje', { characterId }, error);
            throw new Error(`Error obteniendo datos del personaje ${characterId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    private async getPlanetDataFromUrl(homeworldUrl: string) {
        try {
            return await this.swapiApiService.getPlanetDataFromUrl(homeworldUrl);
        } catch (error) {
            logAggregatorError('Error obteniendo datos del planeta desde URL', { homeworldUrl }, error);
            throw new Error(`Error obteniendo datos del planeta desde URL ${homeworldUrl}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    private getPlanetCoordinates(planetName: string): PlanetCoordinates {
        try {
            const coords = planetCoordinates[planetName];
            if (!coords) {
                throw new Error(`No se encontraron coordenadas para el planeta "${planetName}"`);
            }
            return coords;
        } catch (error) {
            logAggregatorError('Error obteniendo coordenadas del planeta', { planetName }, error);
            throw error;
        }
    }

    private async getWeatherData(coordinates: PlanetCoordinates) {
        try {
            return await this.weatherApiService.getWeather(coordinates.latitude, coordinates.longitude);
        } catch (error) {
            logAggregatorError('Error obteniendo datos del clima', { coordinates }, error);
            throw new Error(`Error obteniendo datos del clima para coordenadas (${coordinates.latitude}, ${coordinates.longitude}): ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
}
