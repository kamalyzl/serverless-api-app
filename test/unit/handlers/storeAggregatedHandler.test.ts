import { main as storeAggregatedHandler } from "../../../src/presentation/lambdas/storeAggregatedHandler";
import { StorePlanetWeatherUseCase } from "../../../src/application/useCases/StorePlanetWeather";
import * as uuid from "uuid";

jest.mock("../../../src/infrastructure/repositories/dynamoPlanetWeatherRepository");
jest.mock("../../../src/application/useCases/StorePlanetWeather");
jest.mock("uuid");

// Utilidades para mockear y restaurar Date
function mockDate(fixedDate: string) {
  const RealDate = Date;
  const MockedDate = class extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        return new RealDate(fixedDate);
      }
      // @ts-expect-error: spread en super para mock
      super(...args);
      return this;
    }
  } as DateConstructor;
  const originalDateNow = RealDate.now;
  global.Date = MockedDate;
  Date.now = jest.fn(() => new RealDate(fixedDate).getTime());
  return { RealDate, originalDateNow };
}

function restoreDate(RealDate: DateConstructor, originalDateNow: () => number) {
  global.Date = RealDate;
  Date.now = originalDateNow;
}

function createEvent(body: object) {
  return { body: JSON.stringify(body) } as any;
}

describe("storeAggregatedHandler", () => {
  const mockExecute = jest.fn();
  const fixedDate = "2024-06-01T12:00:00.000Z";
  const fixedId = "test-uuid";
  let RealDate: DateConstructor;
  let originalDateNow: () => number;

  beforeAll(() => {
    ({ RealDate, originalDateNow } = mockDate(fixedDate));
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
    restoreDate(RealDate, originalDateNow);
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
    const event = createEvent(validBody);

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
      planetName: "Tatooine",
      planetClimate: "arid",
      planetTerrain: "desert",
      planetPopulation: "200000",
      weatherTemperature: 35,
    };
    const event = createEvent(invalidBody);

    const result = await storeAggregatedHandler(event, {} as any, () => {}) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty("message", "Validation failed");
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
    const event = createEvent(validBody);

    const result = await storeAggregatedHandler(event, {} as any, () => {}) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty("message", "Error de base de datos");
  });
});
