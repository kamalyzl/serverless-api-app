import logger from "./logger";

export function logAggregatorError(message: string, context: object, error: unknown) {
  logger.error(message, {
    ...context,
    error: error instanceof Error ? error.message : 'Error desconocido',
    stack: error instanceof Error ? error.stack : undefined,
    service: 'planet-weather-aggregator'
  });
}
