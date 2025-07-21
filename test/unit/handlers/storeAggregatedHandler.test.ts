import { main as storeAggregatedHandler } from "../../../src/presentation/lambdas/storeAggregatedHandler";
import { StorePlanetWeatherUseCase } from "../../../src/application/useCases/StorePlanetWeather";
import { DynamoPlanetWeatherRepository } from "../../../src/infrastructure/repositories/dynamoPlanetWeatherRepository";
import * as uuid from "uuid";

jest.mock("../../../src/infrastructure/repositories/dynamoPlanetWeatherRepository");
jest.mock("../../../src/application/useCases/StorePlanetWeather");
jest.mock("uuid");

describe("storeAggregatedHandler", () => {
  const mockExecute = jest.fn();
  const fixedDate = "2024-06-01T12:00:00.000Z";
  const fixedId = "test-uuid";

  beforeAll(() => {
    jest.spyOn(global, "Date").mockImplementation(() => ({
      toISOString: () => fixedDate,
    } as unknown as Date));
    (uuid.v4 as jest.Mock).mockReturnValue(fixedId);
  });

  beforeEach(() => {
    (StorePlanetWeatherUseCase as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("debería devolver 201 y guardar el registro correctamente", async () => {
    mockExecute.mockResolvedValue(undefined);
    const validBody = {
      characterName: "Luke Skywalker",
      planetName: "Tatooine",
      planetClimate: "arid",
      planetTerrain: "desert",
      planetPopulation: "200000",
      weatherTemperature: 35,
      weatherWindspeed: 10,
    };
    const event = {
      body: JSON.stringify(validBody),
    } as any;

    const result = await storeAggregatedHandler(event, {} as any, () => {}) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual({
      ...validBody,
      id: fixedId,
      createdAt: fixedDate,
    });
    expect(mockExecute).toHaveBeenCalledWith({
      ...validBody,
      id: fixedId,
      createdAt: fixedDate,
    });
  });

  it("debería devolver 400 si la validación falla", async () => {
    const invalidBody = {
      // Falta characterName y otros campos requeridos
      planetName: "Tatooine",
      planetClimate: "arid",
      planetTerrain: "desert",
      planetPopulation: "200000",
      weatherTemperature: 35,
    };
    const event = {
      body: JSON.stringify(invalidBody),
    } as any;

    const result = await storeAggregatedHandler(event, {} as any, () => {}) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty("message", "Validation failed");
    expect(responseBody).toHaveProperty("errors");
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("debería devolver 500 si ocurre un error interno", async () => {
    mockExecute.mockRejectedValue(new Error("Error de base de datos"));
    const validBody = {
      characterName: "Luke Skywalker",
      planetName: "Tatooine",
      planetClimate: "arid",
      planetTerrain: "desert",
      planetPopulation: "200000",
      weatherTemperature: 35,
      weatherWindspeed: 10,
    };
    const event = {
      body: JSON.stringify(validBody),
    } as any;

    const result = await storeAggregatedHandler(event, {} as any, () => {}) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty("error", "Error de base de datos");
  });
});
