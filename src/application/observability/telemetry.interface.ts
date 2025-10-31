/**
 * Interface para o serviço de telemetria
 */
export interface ITelemetry {
  shutdown(): Promise<void>;
}

/**
 * Token de injeção para o TelemetryService
 */
export const TELEMETRY = Symbol("TELEMETRY");
