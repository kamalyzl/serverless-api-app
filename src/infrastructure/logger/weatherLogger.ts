import logger from "./logger";

export function logWeatherStart(context: object) {
  logger.info("Iniciando llamada a Weather API", context);
}

export function logWeatherSuccess(context: object) {
  logger.info("Llamada a Weather API exitosa", context);
}

export function logWeatherError(context: object) {
  logger.error("Error en llamada a Weather API", context);
} 