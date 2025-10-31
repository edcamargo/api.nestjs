import { Injectable, OnModuleInit } from "@nestjs/common";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { ITelemetry } from "../../application/observability";
import type { IAuthenticatedUser } from "../../domain/auth";

interface RequestWithUser {
  url?: string;
  user?: IAuthenticatedUser;
}

@Injectable()
export class TelemetryService implements OnModuleInit, ITelemetry {
  private sdk: NodeSDK;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.OTEL_ENABLED === "true";

    if (!this.isEnabled) {
      console.log(
        "⚠️  [OpenTelemetry] Disabled - Set OTEL_ENABLED=true to enable",
      );
      return;
    }

    const traceExporter = new OTLPTraceExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
        "http://localhost:4318/v1/traces",
    });

    const metricReader = new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url:
          process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
          "http://localhost:4318/v1/metrics",
      }),
      exportIntervalMillis: 60000, // 1 minuto
    });

    const logExporter = new OTLPLogExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ||
        "http://localhost:4318/v1/logs",
    });

    this.sdk = new NodeSDK({
      serviceName: process.env.SERVICE_NAME || "dark-api",
      traceExporter,
      metricReader,
      logRecordProcessor: new BatchLogRecordProcessor(logExporter),
      instrumentations: [
        getNodeAutoInstrumentations({
          "@opentelemetry/instrumentation-fs": { enabled: false },
          "@opentelemetry/instrumentation-http": {
            ignoreIncomingRequestHook: (request: RequestWithUser) => {
              // Ignorar health checks dos traces
              const url: string = request.url || "";
              return url.includes("/health");
            },
          },
        }),
      ],
    });
  }

  onModuleInit() {
    if (this.isEnabled && this.sdk) {
      this.sdk.start();
      console.log("✓ [OpenTelemetry] SDK initialized successfully");
    }
  }

  async shutdown() {
    if (this.isEnabled && this.sdk) {
      await this.sdk.shutdown();
      console.log("✓ [OpenTelemetry] SDK shutdown successfully");
    }
  }
}
