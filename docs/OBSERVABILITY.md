# Observabilidade - Guia de Implementação

## 📊 Visão Geral

A camada de observabilidade foi implementada usando **100% OpenTelemetry**, seguindo os padrões da Clean Architecture. Oferece monitoramento completo através de **logs estruturados**, **métricas** e **traces distribuídos** em uma stack unificada e vendor-neutral.

> **✨ Stack Pura OpenTelemetry**: Sem dependências de logging externas (Pino, Winston, etc). Tudo gerenciado pelo OpenTelemetry SDK.

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── infrastructure/
│   ├── observability/          # Camada de infraestrutura
│   │   ├── telemetry.service.ts    # OpenTelemetry SDK
│   │   ├── logger.service.ts       # Pino logger
│   │   ├── metrics.service.ts      # Métricas customizadas
│   │   ├── observability.module.ts # Módulo global
│   │   └── index.ts                # Barrel exports
│   └── database/
│       ├── database.module.ts      # Módulo global do Prisma
│       ├── prisma.service.ts
│       └── index.ts
└── presentation/
    └── observability/          # Camada de apresentação
        ├── logging.interceptor.ts  # Interceptor HTTP
        ├── health.controller.ts    # Health checks
        └── index.ts                # Barrel exports
```

## 🔧 Componentes Implementados

### 1. TelemetryService (OpenTelemetry)

Serviço responsável por inicializar e configurar o OpenTelemetry SDK completo.

**Recursos:**
- Auto-instrumentação HTTP, Express e bibliotecas Node.js
- Exportação de traces via OTLP HTTP
- Exportação de métricas via OTLP HTTP
- **Exportação de logs via OTLP HTTP** (novo!)
- Configuração condicional via variáveis de ambiente
- Ignora health checks nos traces (otimização)

**Uso:**
```typescript
// Habilitado via .env
OTEL_ENABLED=true
```

### 2. LoggerService (OpenTelemetry Logs API)

Logger estruturado usando a **OpenTelemetry Logs API** nativa.

**Recursos:**
- Implementa `NestLoggerService` (compatível com NestJS)
- Console output colorido para desenvolvimento
- Exportação OTLP para produção (quando `OTEL_ENABLED=true`)
- Metadata estruturado em todos os logs
- Níveis: log (INFO), error (ERROR), warn (WARN), debug (DEBUG), verbose (TRACE)
- **Sem dependências externas** (não usa Pino, Winston, etc)

**Uso:**
```typescript
constructor(private readonly logger: LoggerService) {}

this.logger.log('User created', 'UserService');
this.logger.error('Login failed', error.stack, 'AuthService');
this.logger.debug('Processing request', 'HTTP');

// Métodos customizados
this.logger.logRequest('GET', '/api/users', 200, 150);
this.logger.logAuth(user.id, user.email, 'login');
this.logger.logDatabase('SELECT', 'users', 50);
this.logger.logError(error, 'UserService');
```

### 3. MetricsService

Coleta de métricas customizadas da aplicação.

**Métricas disponíveis:**
- `http_requests_total` - Total de requisições HTTP
- `http_errors_total` - Total de erros HTTP
- `http_request_duration_ms` - Duração de requisições

**Uso:**
```typescript
constructor(private readonly metrics: MetricsService) {}

this.metrics.incrementRequestCount('GET', '/api/users', 200);
this.metrics.recordRequestDuration('GET', '/api/users', 150);
```

### 4. LoggingInterceptor

Interceptor global que registra todas as requisições HTTP automaticamente.

**Funcionalidades:**
- Log de entrada de requisições (método, URL, body sanitizado)
- Log de saída com status e duração
- Log de erros com stack trace
- Registro automático de métricas
- Sanitização de campos sensíveis

**Configuração:**
```typescript
// Já configurado globalmente no AppModule
{
  provide: APP_INTERCEPTOR,
  useClass: LoggingInterceptor,
}
```

### 5. HealthController

Endpoints de monitoramento da aplicação.

**Endpoints:**

#### GET /health
Liveness probe - verifica se a aplicação está rodando.

```json
{
  "status": "ok",
  "timestamp": "2025-01-28T21:30:00.000Z",
  "uptime": 123.456
}
```

#### GET /health/ready
Readiness probe - verifica conexão com banco de dados.

```json
{
  "status": "ready",
  "database": "connected",
  "timestamp": "2025-01-28T21:30:00.000Z"
}
```

#### GET /health/metrics
Métricas da aplicação (memória, CPU, uptime).

```json
{
  "uptime": 123.456,
  "memory": {
    "rss": "50MB",
    "heapTotal": "30MB",
    "heapUsed": "20MB"
  },
  "cpu": {
    "user": 123456,
    "system": 78901
  },
  "timestamp": "2025-01-28T21:30:00.000Z"
}
```

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione ao arquivo `.env`:

```bash
# OpenTelemetry Observability
OTEL_ENABLED=false                    # Habilitar/desabilitar OpenTelemetry
SERVICE_NAME=dark-api                 # Nome do serviço

# OTLP Endpoints (Collector ou backend direto)
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://localhost:4318/v1/logs
```

### Modos de Operação

**Desenvolvimento (sem stack externa):**
```bash
OTEL_ENABLED=false
```
- Logs coloridos aparecem apenas no console
- Sem exportação para backends
- Ideal para desenvolvimento local

**Produção (com stack ou cloud):**
```bash
OTEL_ENABLED=true
```
- Logs no console + exportação OTLP
- Traces, metrics e logs enviados para collector/backend
- Ideal para ambientes produtivos

## 🐳 Stack de Observabilidade (Opcional)

Para visualização local completa, use o Docker Compose fornecido:

```bash
docker-compose -f docker-compose.observability.yml up -d
```

### Componentes do Stack:

1. **Jaeger** (Traces)
   - UI: http://localhost:16686
   - Coleta traces distribuídos
   - Visualização de latência e dependências

2. **Prometheus** (Métricas)
   - UI: http://localhost:9090
   - Coleta métricas do endpoint /health/metrics
   - Armazenamento de séries temporais

3. **Grafana** (Dashboards)
   - UI: http://localhost:3001
   - Login: admin/admin
   - Dashboards customizáveis
   - Integração com Prometheus e Jaeger

### Após iniciar o stack:

1. Configure `.env`:
```bash
OTEL_ENABLED=true
```

2. Reinicie a aplicação:
```bash
npm run start:dev
```

3. Acesse as UIs:
   - Jaeger: http://localhost:16686
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001

## 📈 Monitoramento em Produção

### Kubernetes

Use os health checks nos deployments:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Exportadores OTLP

Configure os exportadores para seu backend de observabilidade:

- **Jaeger**: http://jaeger-collector:4318
- **Grafana Cloud**: Configure endpoint e auth token
- **DataDog**: Use agente OTLP
- **New Relic**: Configure OTLP endpoint

## 🎯 Melhores Práticas

### 1. Logs Estruturados

```typescript
// ✅ Bom - contexto rico
this.logger.info('User action', 'UserService', {
  userId: user.id,
  action: 'update',
  fields: ['email', 'name']
});

// ❌ Ruim - string sem contexto
this.logger.info(`User ${user.id} updated`);
```

### 2. Sanitização de Dados

O `LoggingInterceptor` automaticamente sanitiza:
- password
- token
- secret

Para adicionar mais campos:

```typescript
// src/presentation/observability/logging.interceptor.ts
const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
```

### 3. Métricas Customizadas

```typescript
// Criar métricas específicas do negócio
const loginAttempts = this.meter.createCounter('login_attempts_total');
loginAttempts.add(1, { success: 'true' });
```

### 4. Traces Customizados

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('user-service');
const span = tracer.startSpan('processUser');

try {
  // ... lógica
  span.setStatus({ code: SpanStatusCode.OK });
} catch (error) {
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
} finally {
  span.end();
}
```

## 🔍 Troubleshooting

### Logs não aparecem

Verifique `LOG_LEVEL` no `.env`:
```bash
LOG_LEVEL=debug
```

### Traces não aparecem no Jaeger

1. Verifique se `OTEL_ENABLED=true`
2. Confirme que Jaeger está rodando: `docker ps`
3. Teste endpoint OTLP: `curl http://localhost:4318/v1/traces`

### Métricas vazias

O endpoint `/health/metrics` mostra apenas métricas da aplicação Node.js.
Para métricas OpenTelemetry, configure um exporter Prometheus.

## 📚 Recursos Adicionais

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Pino Logger](https://getpino.io/)
- [Jaeger UI](https://www.jaegertracing.io/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

## ✅ Checklist de Implementação

- [x] TelemetryService (OpenTelemetry)
- [x] LoggerService (Pino)
- [x] MetricsService (métricas customizadas)
- [x] LoggingInterceptor (logs HTTP automáticos)
- [x] HealthController (3 endpoints)
- [x] DatabaseModule (Prisma global)
- [x] ObservabilityModule (global)
- [x] Variáveis de ambiente configuradas
- [x] Docker Compose stack (opcional)
- [x] Documentação completa
