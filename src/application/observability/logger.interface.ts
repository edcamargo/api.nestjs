import { LoggerService as NestLoggerService } from "@nestjs/common";

/**
 * Interface para o serviço de logging
 * Estende o LoggerService do NestJS e adiciona métodos customizados
 */
export interface ILogger extends NestLoggerService {
  // Métodos padrão do NestJS LoggerService
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;

  // Métodos customizados
  info(message: string, context?: string, meta?: object): void;
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
  ): void;
  logAuth(
    userId: string,
    email: string,
    action: "login" | "logout" | "token_refresh",
  ): void;
  logDatabase(operation: string, table: string, duration: number): void;
  logError(error: Error, context?: string): void;
}

/**
 * Token de injeção para o LoggerService
 */
export const LOGGER = Symbol("LOGGER");
