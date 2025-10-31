import { Global, Module } from "@nestjs/common";
import { TelemetryService } from "./telemetry.service";
import { LoggerService } from "./logger.service";
import { MetricsService } from "./metrics.service";
import { LOGGER, METRICS, TELEMETRY } from "../../application/observability";

@Global()
@Module({
  providers: [
    TelemetryService,
    LoggerService,
    MetricsService,
    {
      provide: LOGGER,
      useClass: LoggerService,
    },
    {
      provide: METRICS,
      useClass: MetricsService,
    },
    {
      provide: TELEMETRY,
      useClass: TelemetryService,
    },
  ],
  exports: [
    LOGGER,
    METRICS,
    TELEMETRY,
    TelemetryService,
    LoggerService,
    MetricsService,
  ],
})
export class ObservabilityModule {}
