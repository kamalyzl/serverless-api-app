import { main as getHistoryHandler } from "../../../src/presentation/lambdas/getHistoryHandler";
import { GetPlanetWeatherHistoryUseCase } from "../../../src/application/useCases/GetPlanetWeatherHistory";

jest.mock("../../../src/infrastructure/repositories/dynamoPlanetWeatherRepository");
jest.mock("../../../src/application/useCases/GetPlanetWeatherHistory");

describe("getHistoryHandler", () => {
  const mockExecute = jest.fn();

  beforeEach(() => {
    (GetPlanetWeatherHistoryUseCase as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debería devolver 200 con los datos correctamente", async () => {
    const fakeData = {
      items: [{ id: "1", createdAt: "2025-07-20T19:36:11.543Z" }],
      lastEvaluatedKey: { id: "1" },
    };

    mockExecute.mockResolvedValue(fakeData);

    const event = {
      queryStringParameters: {
        limit: "5",
        lastKey: encodeURIComponent(JSON.stringify({ id: "1234" })),
      },
    } as any;

    const result = await getHistoryHandler(event, {} as any, () => { }) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(fakeData);
    expect(mockExecute).toHaveBeenCalledWith(5, { id: "1234" });
  });

  it("debería devolver 200 si no se pasan query params (usa valores por defecto)", async () => {
    const fakeData = { items: [], lastEvaluatedKey: undefined };
    mockExecute.mockResolvedValue(fakeData);

    const event = {
      queryStringParameters: undefined,
    } as any;

    const result = await getHistoryHandler(event, {} as any, () => { }) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(fakeData);
    expect(mockExecute).toHaveBeenCalledWith(10, undefined); // default limit 10
  });

  it("debería manejar errores y devolver 500", async () => {
    mockExecute.mockRejectedValue(new Error("Fallo en DynamoDB"));

    const event = {
      queryStringParameters: {
        limit: "3",
      },
    } as any;

    const result = await getHistoryHandler(event, {} as any, () => { }) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: "Internal Server Error",
    });
  });

  it("debería ignorar un lastKey inválido y continuar", async () => {
    const fakeData = { items: [], lastEvaluatedKey: undefined };
    mockExecute.mockResolvedValue(fakeData);

    const event = {
      queryStringParameters: {
        limit: "3",
        lastKey: "invalid-json",
      },
    } as any;

    const result = await getHistoryHandler(event, {} as any, () => { }) as import("aws-lambda").APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(fakeData);
  });
});
