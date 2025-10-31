/**
 * Interface para o serviço de métricas
 */
export interface IMetrics {
  incrementRequestCount(
    method: string,
    route: string,
    statusCode: number,
  ): void;
  incrementErrorCount(method: string, route: string, statusCode: number): void;
  recordRequestDuration(method: string, route: string, duration: number): void;
}

/**
 * Token de injeção para o MetricsService
 */
export const METRICS = Symbol("METRICS");
