import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Desactiva el uso de transportes (como 'pino-pretty') para evitar workers
  transport: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: undefined, // Elimina campos como pid y hostname del log
});

export default logger;
