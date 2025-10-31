import { Injectable } from "@nestjs/common";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { ILogger } from "../../application/observability";

@Injectable()
export class LoggerService implements ILogger {
  private logger = logs.getLogger("dark-api", "1.0.0");
  private isOtelEnabled = process.env.OTEL_ENABLED === "true";

  private getSeverity(
    level: "log" | "error" | "warn" | "debug" | "verbose",
  ): SeverityNumber {
    const severityMap = {
      debug: SeverityNumber.DEBUG,
      verbose: SeverityNumber.TRACE,
      log: SeverityNumber.INFO,
      warn: SeverityNumber.WARN,
      error: SeverityNumber.ERROR,
    };
    return severityMap[level] || SeverityNumber.INFO;
  }

  private emit(
    level: "log" | "error" | "warn" | "debug" | "verbose",
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : "";
    const severityText = level.toUpperCase();

    // Console output (sempre ativo para visibilidade)
    const colorMap = {
      log: "\x1b[32m", // verde
      error: "\x1b[31m", // vermelho
      warn: "\x1b[33m", // amarelo
      debug: "\x1b[36m", // ciano
      verbose: "\x1b[35m", // magenta
    };
    const reset = "\x1b[0m";
    const color = colorMap[level] || "";

    console.log(
      `${color}[${timestamp}] [${severityText}]${reset} ${contextStr} ${message}`,
    );

    if (metadata && Object.keys(metadata).length > 0) {
      console.log(`${color}${JSON.stringify(metadata, null, 2)}${reset}`);
    }

    // OpenTelemetry log (se habilitado)
    if (this.isOtelEnabled) {
      const severityNumber = this.getSeverity(level);

      this.logger.emit({
        severityNumber,
        severityText,
        body: message,
        attributes: {
          context: context || "Application",
          ...(metadata || {}),
        },
        timestamp: Date.now(),
      });
    }
  }

  // Implementação da interface NestLoggerService
  log(message: string, context?: string) {
    this.emit("log", message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.emit("error", message, context, { trace });
  }

  warn(message: string, context?: string) {
    this.emit("warn", message, context);
  }

  debug(message: string, context?: string) {
    this.emit("debug", message, context);
  }

  verbose(message: string, context?: string) {
    this.emit("verbose", message, context);
  }

  // Métodos customizados com tipagem forte
  info(message: string, context?: string, meta?: Record<string, unknown>) {
    this.emit("log", message, context, meta);
  }

  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
  ) {
    this.emit(
      "log",
      `${method} ${url} ${statusCode} - ${responseTime}ms`,
      "HTTP",
      {
        type: "http_request",
        method,
        url,
        statusCode,
        responseTime,
      },
    );
  }

  logAuth(
    userId: string,
    email: string,
    action: "login" | "logout" | "token_refresh",
  ) {
    this.emit("log", `User ${action}: ${email}`, "Auth", {
      type: "auth",
      userId,
      email,
      action,
    });
  }

  logDatabase(operation: string, table: string, duration: number) {
    this.emit("debug", `${operation} on ${table} - ${duration}ms`, "Database", {
      type: "database",
      operation,
      table,
      duration,
    });
  }

  logError(error: Error, context?: string) {
    this.emit("error", error.message, context || "Error", {
      type: "error",
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    });
  }
}
