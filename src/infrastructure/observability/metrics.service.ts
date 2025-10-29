import { Injectable } from '@nestjs/common';
import { metrics } from '@opentelemetry/api';
import { IMetrics } from '../../application/observability';

@Injectable()
export class MetricsService implements IMetrics {
  private meter = metrics.getMeter('api-nestjs');

  // Counters
  private requestCounter = this.meter.createCounter('http_requests_total', {
    description: 'Total HTTP requests',
  });

  private errorCounter = this.meter.createCounter('http_errors_total', {
    description: 'Total HTTP errors',
  });

  // Histograms
  private requestDuration = this.meter.createHistogram('http_request_duration_ms', {
    description: 'HTTP request duration in milliseconds',
  });

  incrementRequestCount(method: string, route: string, statusCode: number) {
    this.requestCounter.add(1, { method, route, status: statusCode.toString() });
  }

  incrementErrorCount(method: string, route: string, statusCode: number) {
    this.errorCounter.add(1, { method, route, status: statusCode.toString() });
  }

  recordRequestDuration(method: string, route: string, duration: number) {
    this.requestDuration.record(duration, { method, route });
  }
}
