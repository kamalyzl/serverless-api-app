import { main as mergedHandler } from "../../../src/presentation/lambdas/mergedHandler";
import { PlanetWeatherAggregator } from "../../../src/application/useCases/PlanetWeatherAggregator";

describe("mergedHandler", () => {
  let spy: jest.SpyInstance;

  afterEach(() => {
    if (spy) spy.mockRestore();
    jest.clearAllMocks();
  });

  it("debería devolver 400 si no se envía characterId", async () => {
    const event = {
      queryStringParameters: {},
    } as any;

    const result = await mergedHandler(event, {} as any, () => {}) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      message: "Missing characterId in query parameters",
    });
  });

  it("debería devolver 200 y los datos agregados correctamente", async () => {
    const fakeData = {
      character: { name: "Luke Skywalker" },
      planet: { name: "Tatooine" },
      weather: { temperature: 34, windspeed: 7.4 },
    } as any;

    spy = jest.spyOn(PlanetWeatherAggregator.prototype, 'getAggregatedPlanetWeather').mockResolvedValue(fakeData);

    const event = {
      queryStringParameters: {
        characterId: "1",
      },
    } as any;

    const result = await mergedHandler(event, {} as any, () => {}) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(fakeData);
    expect(spy).toHaveBeenCalledWith(1);
  });

  it("debería manejar errores y devolver 500", async () => {
    spy = jest.spyOn(PlanetWeatherAggregator.prototype, 'getAggregatedPlanetWeather').mockRejectedValue(new Error("fail"));

    const event = {
      queryStringParameters: {
        characterId: "1",
      },
    } as any;

    const result = await mergedHandler(event, {} as any, () => {}) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: "Internal Server Error",
    });
  });
});
