import logger from "./logger";

export function logSwapiStart(context: object) {
  logger.info("Iniciando llamada a SWAPI", context);
}

export function logSwapiSuccess(context: object) {
  logger.info("Llamada a SWAPI exitosa", context);
}

export function logSwapiError(context: object) {
  logger.error("Error en llamada a SWAPI", context);
}
