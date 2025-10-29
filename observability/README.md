# Observability Stack

Este diretório contém configurações para o stack completo de observabilidade usando **OpenTelemetry**.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│         Dark API (NestJS)               │
│  ┌───────────────────────────────────┐  │
│  │   OpenTelemetry SDK (NodeSDK)    │  │
│  ├───────────────────────────────────┤  │
│  │ • Traces (auto-instrumentação)   │  │
│  │ • Metrics (custom + auto)         │  │
│  │ • Logs (structured logging)       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼ OTLP/HTTP (porta 4318)
        ┌───────────────────────┐
        │  OTEL Collector       │
        │  (otel-collector)     │
        └───────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   ┌─────────┐           ┌──────────┐
   │ Jaeger  │           │Prometheus│
   │(Traces) │           │(Metrics) │
   └─────────┘           └──────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
              ┌──────────┐
              │ Grafana  │
              │(Dashboards)
              └──────────┘
```

## 📦 Componentes

### 1. **OpenTelemetry Collector**
- Recebe traces, metrics e logs via OTLP
- Processa e exporta para backends
- Portas: 4318 (HTTP), 4317 (gRPC)

### 2. **Jaeger**
- Visualização de traces distribuídos
- UI intuitiva para análise de latência
- Porta: 16686

### 3. **Prometheus**
- Armazenamento de métricas
- Queries com PromQL
- Porta: 9090

### 4. **Grafana**
- Dashboards customizáveis
- Integração com Prometheus e Jaeger
- Porta: 3001

## 🚀 Como Usar

### 1. Iniciar Stack

```bash
docker-compose -f docker-compose.observability.yml up -d
```

### 2. Configurar Aplicação

Edite o arquivo `.env`:

```bash
OTEL_ENABLED=true
SERVICE_NAME=dark-api
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://localhost:4318/v1/logs
```

### 3. Iniciar Aplicação

```bash
npm run start:dev
```

### 4. Acessar Interfaces

- **Jaeger UI**: http://localhost:16686
  - Visualize traces das requisições
  - Analise latência e dependências
  - Identifique gargalos

- **Prometheus**: http://localhost:9090
  - Execute queries PromQL
  - Visualize métricas em tempo real
  - Configure alertas

- **Grafana**: http://localhost:3001
  - Login: admin/admin
  - Crie dashboards personalizados
  - Integre com Prometheus e Jaeger

## 📊 Configurando Grafana

### 1. Adicionar Data Sources

**Prometheus:**
1. Configuration → Data Sources → Add data source
2. Selecione "Prometheus"
3. URL: `http://prometheus:9090`
4. Save & Test

**Jaeger:**
1. Configuration → Data Sources → Add data source
2. Selecione "Jaeger"
3. URL: `http://jaeger:16686`
4. Save & Test

### 2. Importar Dashboards

Dashboards recomendados para importar:
- **Node.js Application Monitoring**: Dashboard ID 11159
- **OpenTelemetry APM**: Dashboard ID 19419
- **Jaeger Tracing**: Dashboard ID 10001

## 🔍 Testando

### 1. Gerar Tráfego

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Listar usuários (com token)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Visualizar no Jaeger

1. Acesse http://localhost:16686
2. Selecione "dark-api" no Service
3. Clique em "Find Traces"
4. Veja os traces das requisições

### 3. Visualizar Métricas

1. Acesse http://localhost:9090
2. Execute query: `dark_api_http_requests_total`
3. Visualize gráfico de requisições

## 🛠️ Troubleshooting

### Collector não recebe dados

```bash
# Verificar logs do collector
docker logs dark-api-otel-collector

# Testar endpoint OTLP
curl -v http://localhost:4318/v1/traces
```

### Jaeger sem traces

1. Verifique se `OTEL_ENABLED=true` no `.env`
2. Confirme que o collector está rodando
3. Verifique logs da aplicação

### Prometheus sem métricas

```bash
# Verificar targets no Prometheus
# http://localhost:9090/targets

# Verificar se collector está expondo métricas
curl http://localhost:8889/metrics
```

## 🧹 Limpeza

### Parar stack

```bash
docker-compose -f docker-compose.observability.yml down
```

### Remover volumes (dados persistidos)

```bash
docker-compose -f docker-compose.observability.yml down -v
```

## 📚 Recursos

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OTEL Collector Config](https://opentelemetry.io/docs/collector/configuration/)
