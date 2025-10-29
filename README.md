# Dark API

> API RESTful demonstrando **Arquitetura Limpa** (Clean Architecture) com NestJS, Prisma ORM e princípios SOLID

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-000000?style=flat&logo=opentelemetry&logoColor=white)](https://opentelemetry.io/)
[![Clean Architecture](https://img.shields.io/badge/Clean_Architecture-00ADD8?style=flat&logo=architecture&logoColor=white)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
[![SOLID](https://img.shields.io/badge/SOLID-FF6B6B?style=flat&logo=solid&logoColor=white)](https://en.wikipedia.org/wiki/SOLID)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Observabilidade](#-observabilidade)
- [Instalação](#-instalação)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Endpoints da API](#-endpoints-da-api)
- [Documentação Interativa](#-documentação-interativa)
- [Tratamento de Erros](#-tratamento-de-erros)

## 🎯 Visão Geral

API desenvolvida para demonstrar boas práticas de arquitetura de software, aplicando:

- ✅ **Clean Architecture** (Arquitetura em Camadas)
- ✅ **Princípios SOLID**
- ✅ **Dependency Injection com Tokens**
- ✅ **Repository Pattern**
- ✅ **DTOs e Validação Automática**
- ✅ **Tratamento Padronizado de Erros**
- ✅ **Documentação com Swagger**
- ✅ **Soft Delete** (Exclusão Lógica com Recuperação)
- ✅ **Autenticação JWT** (JSON Web Token)
- ✅ **Autorização RBAC** (Role-Based Access Control)
- ✅ **Observabilidade** (Logs, Métricas e Traces com OpenTelemetry)
- ✅ **Interface Segregation** (Dependency Inversion Principle)

### 🌟 Destaques da Arquitetura

#### 🏗️ Clean Architecture com Observabilidade
```
Application Layer (Interfaces)  →  Define contratos (ILogger, IMetrics)
         ↓
Infrastructure Layer (Implementações) → OpenTelemetry SDK
         ↓
Presentation Layer (HTTP) → Controllers com logging automático
```

#### 🔐 Segurança Robusta
- JWT com expiração configurável
- Hash bcrypt para senhas
- RBAC com 3 níveis (USER, MODERATOR, ADMIN)
- Guards globais + decorators customizados

#### 📊 Observabilidade Completa
- **Logs**: Console colorido + OpenTelemetry Logs API
- **Métricas**: Contadores e histogramas customizados
- **Traces**: Auto-instrumentação distribuída
- **Health Checks**: Liveness, Readiness, Metrics

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas bem definida:

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER                  │
│  Controllers, Filters, Interceptors         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         APPLICATION LAYER                   │
│  Services, DTOs, Mappers                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         DOMAIN LAYER                        │
│  Entities, Interfaces, Constants            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         INFRASTRUCTURE LAYER                │
│  Repositories, Database, Prisma             │
└─────────────────────────────────────────────┘
```

### 📂 Camadas

- **Presentation**: Controllers, filtros globais (AllExceptionsFilter), interceptors (ResponseInterceptor)
- **Application**: Serviços de aplicação (UserService), DTOs, Mappers
- **Domain**: Entidades de domínio, Interfaces (IUserRepository), Constantes
- **Infrastructure**: Implementação dos repositórios, Prisma Service, Schema e Migrations

### 🔑 Princípios Aplicados

- **Injeção de Dependência**: Token `USER_REPOSITORY` desacopla a implementação do repositório
- **Validação Global**: `ValidationPipe` com whitelist e transform habilitados
- **Padronização de Respostas**: Todas as respostas encapsuladas em `{ data: ... }`
- **Tratamento de Erros**: Filtro global para envelope de erro padronizado

## 🛠️ Tecnologias

### Core
- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[Prisma](https://www.prisma.io/)** - ORM moderno para TypeScript
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[SQLite](https://www.sqlite.org/)** - Banco de dados SQL leve

### Bibliotecas Principais
- **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)** - Documentação OpenAPI/Swagger
- **[@nestjs/jwt](https://docs.nestjs.com/security/authentication)** - Autenticação JWT
- **[@nestjs/passport](https://docs.nestjs.com/security/authentication)** - Estratégias de autenticação
- **[passport-jwt](http://www.passportjs.org/packages/passport-jwt/)** - Estratégia JWT para Passport
- **[class-validator](https://github.com/typestack/class-validator)** - Validação de DTOs
- **[class-transformer](https://github.com/typestack/class-transformer)** - Transformação de objetos
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hash de senhas
- **[uuid](https://github.com/uuidjs/uuid)** - Geração de UUIDs

## 📁 Estrutura do Projeto

```
api.nestjs/
├── src/
│   ├── application/              # Camada de Aplicação
│   │   ├── auth/                 # 🔐 Módulo de autenticação
│   │   │   ├── auth.service.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── auth-response.dto.ts
│   │   │   └── index.ts
│   │   ├── dtos/                 # Data Transfer Objects
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   ├── mappers/              # Transformadores de dados
│   │   │   └── user.mapper.ts
│   │   └── services/             # Lógica de negócio
│   │       └── user.service.ts
│   │
│   ├── domain/                   # Camada de Domínio
│   │   ├── auth/                 # 🔐 Interfaces de autenticação
│   │   │   ├── auth.repository.interface.ts
│   │   │   ├── jwt.interface.ts
│   │   │   └── index.ts
│   │   ├── interfaces/           # Contratos/Abstrações
│   │   │   └── user.repository.ts
│   │   └── user/                 # Entidade de domínio
│   │       ├── user.entity.ts    # Inclui UserRole enum
│   │       └── user.constants.ts
│   │
│   ├── infrastructure/           # Camada de Infraestrutura
│   │   ├── auth/                 # 🔐 Estratégias e Guards
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── index.ts
│   │   ├── database/             # 💾 Configuração de banco
│   │   │   ├── database.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── index.ts
│   │   ├── observability/        # 📊 Telemetria e Monitoramento
│   │   │   ├── telemetry.service.ts
│   │   │   ├── logger.service.ts
│   │   │   ├── metrics.service.ts
│   │   │   ├── observability.module.ts
│   │   │   └── index.ts
│   │   ├── prisma/               # Prisma ORM
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── dev.db
│   │   └── repositories/         # Implementação dos repositórios
│   │       └── user.repository.ts
│   │
│   ├── presentation/             # Camada de Apresentação
│   │   ├── auth/                 # 🔐 Controllers e Decorators
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── index.ts
│   │   ├── filters/              # Filtros e Interceptors
│   │   │   ├── all-exceptions.filter.ts
│   │   │   └── response.interceptor.ts
│   │   ├── observability/        # 📊 Health Checks e Logging
│   │   │   ├── health.controller.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── index.ts
│   │   └── user/                 # Módulo de usuário
│   │       ├── user.controller.ts
│   │       └── user.module.ts
│   │
│   ├── app.module.ts             # Módulo raiz
│   └── main.ts                   # Bootstrap da aplicação
│
├── docs/                         # Documentação
│   ├── AUTH_ARCHITECTURE.md      # Arquitetura de autenticação
│   └── OBSERVABILITY.md          # Guia de observabilidade
├── observability/                # Stack de monitoramento (opcional)
│   ├── prometheus.yml
│   └── README.md
├── test/                         # Testes E2E
├── .env.example                  # Variáveis de ambiente
├── docker-compose.observability.yml  # Stack Jaeger/Prometheus/Grafana
├── prisma.config.ts              # Configuração do Prisma
├── package.json
└── tsconfig.json
```

## 📊 Observabilidade

A aplicação implementa uma **camada completa de observabilidade** seguindo os princípios de **Clean Architecture** com **OpenTelemetry** para logs, métricas e traces distribuídos.

### 🏗️ Arquitetura de Observabilidade

```
src/
├── application/observability/       # 🔷 INTERFACES (Contratos)
│   ├── logger.interface.ts              → ILogger + LOGGER token
│   ├── metrics.interface.ts             → IMetrics + METRICS token
│   ├── telemetry.interface.ts           → ITelemetry + TELEMETRY token
│   └── index.ts
│
├── infrastructure/observability/    # 🔧 IMPLEMENTAÇÕES (OpenTelemetry)
│   ├── observability.module.ts          → Módulo global com DI tokens
│   ├── logger.service.ts                → implements ILogger
│   ├── metrics.service.ts               → implements IMetrics
│   ├── telemetry.service.ts             → implements ITelemetry
│   └── index.ts
│
└── presentation/observability/      # 📡 HTTP Layer
    ├── health.controller.ts             → Health checks
    ├── logging.interceptor.ts           → HTTP request/response logging
    └── index.ts
```

### ✨ Recursos Disponíveis

#### 1. 📝 Logs Estruturados (OpenTelemetry Logs API)
- **Console colorido** com timestamps (sempre ativo para desenvolvimento)
- **OpenTelemetry logs** exportados via OTLP (quando `OTEL_ENABLED=true`)
- **Sanitização automática** de dados sensíveis (password, token, secret)
- **Níveis configuráveis**: error, warn, info, debug, verbose
- **Contexto rico**: cada log possui contexto (HTTP, Auth, Database, etc)

**Exemplo de log:**
```
[2025-10-29T01:19:30.525Z] [LOG] [HTTP] Incoming request: GET /health
[2025-10-29T01:19:30.526Z] [LOG] [HTTP] Response: GET /health 200 - 1ms
```

#### 2. 📈 Métricas (OpenTelemetry Metrics API)
- `http_requests_total` - Contador total de requisições HTTP
- `http_errors_total` - Contador de erros HTTP
- `http_request_duration_ms` - Histograma de latência de requisições

**Labels automáticos:**
- `method` - Método HTTP (GET, POST, PUT, DELETE)
- `route` - Rota acessada
- `status` - Status code da resposta

#### 3. 🔍 Traces Distribuídos (OpenTelemetry Tracing)
- **Auto-instrumentação** para HTTP, Express, Prisma e bibliotecas Node.js
- **Exportação OTLP** para Jaeger, Grafana Cloud, Tempo, DataDog, etc
- **Context propagation** automático entre serviços
- **Ignorar health checks** (configurável)

#### 4. 🏥 Health Checks

| Endpoint | Descrição | Autenticação |
|----------|-----------|--------------|
| `GET /health` | Liveness probe (aplicação rodando) | Público |
| `GET /health/ready` | Readiness probe (banco conectado) | Público |
| `GET /health/metrics` | Métricas do sistema (memória, CPU, uptime) | Público |

**Exemplo de resposta:**
```json
{
  "data": {
    "status": "ok",
    "timestamp": "2025-10-29T01:19:30.525Z",
    "uptime": 5.080140125
  }
}
```

### 🚀 Configuração Rápida

#### 1. **Configurar variáveis de ambiente** (`.env`):

```bash
# Habilitar OpenTelemetry (opcional, padrão: desabilitado)
OTEL_ENABLED=true

# Service name para telemetria
SERVICE_NAME=dark-api

# Endpoints OTLP (opcional, padrão: localhost:4318)
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://localhost:4318/v1/logs
```

#### 2. **(Opcional) Iniciar stack de visualização**:

```bash
# Subir Jaeger, Prometheus e Grafana
docker-compose -f docker-compose.observability.yml up -d
```

#### 3. **Acessar interfaces**:

- 🔍 **Jaeger** (Traces): http://localhost:16686
- 📊 **Prometheus** (Métricas): http://localhost:9090
- 📈 **Grafana** (Dashboards): http://localhost:3001 (admin/admin)

### 💡 Uso em Código

#### Injeção de Dependências com Tokens

```typescript
import { Inject, Injectable } from '@nestjs/common';
import type { ILogger, IMetrics } from '../../application/observability';
import { LOGGER, METRICS } from '../../application/observability';

@Injectable()
export class UserService {
  constructor(
    @Inject(LOGGER) private readonly logger: ILogger,
    @Inject(METRICS) private readonly metrics: IMetrics,
  ) {}

  async createUser(data: CreateUserDto) {
    // Log estruturado
    this.logger.info('Creating user', 'UserService', { 
      email: data.email 
    });

    const user = await this.repository.create(data);

    // Log com contexto
    this.logger.info('User created successfully', 'UserService', { 
      userId: user.id 
    });

    // Métrica customizada
    this.metrics.incrementCounter('users_created_total', 1);

    return user;
  }
}
```

#### Métodos Disponíveis

**ILogger:**
```typescript
// Métodos padrão do NestJS
logger.log(message, context?)
logger.error(message, trace?, context?)
logger.warn(message, context?)
logger.debug(message, context?)
logger.verbose(message, context?)

// Métodos customizados
logger.info(message, context?, metadata?)
logger.logRequest(method, url, statusCode, responseTime)
logger.logAuth(userId, email, action)
logger.logDatabase(operation, table, duration)
logger.logError(error, context?)
```

**IMetrics:**
```typescript
metrics.incrementRequestCount(method, route, statusCode)
metrics.incrementErrorCount(method, route, statusCode)
metrics.recordRequestDuration(method, route, duration)
```

**ITelemetry:**
```typescript
await telemetry.shutdown() // Desligar SDK gracefully
```

### 🎯 Princípios de Design

#### Clean Architecture
- ✅ **Application Layer**: Interfaces puras (contratos)
- ✅ **Infrastructure Layer**: Implementações com OpenTelemetry
- ✅ **Dependency Inversion**: Código depende de abstrações, não implementações

#### SOLID
- ✅ **Single Responsibility**: Cada serviço tem uma responsabilidade clara
- ✅ **Open/Closed**: Fácil adicionar novas implementações (CloudWatch, Datadog)
- ✅ **Liskov Substitution**: Interfaces substituíveis
- ✅ **Interface Segregation**: Interfaces focadas e coesas
- ✅ **Dependency Inversion**: Tokens de injeção desacoplam implementações

#### Testabilidade
```typescript
// Testes com mocks ficam simples
const mockLogger: ILogger = {
  log: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  // ... outros métodos
};

const module = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: LOGGER, useValue: mockLogger },
  ],
}).compile();
```

### 📊 Logs Automáticos

A aplicação possui um **LoggingInterceptor** global que captura automaticamente:

- ✅ Todas as requisições HTTP (método, URL, corpo)
- ✅ Todas as respostas (status code, tempo de resposta)
- ✅ Todos os erros (stack trace, contexto)
- ✅ Métricas de cada request (contadores e histogramas)

**Exemplo de saída:**
```
[2025-10-29T01:19:30.525Z] [LOG] [HTTP] Incoming request: GET /api/users
{
  "body": {}
}
[2025-10-29T01:19:30.530Z] [LOG] [HTTP] Response: GET /api/users 200 - 5ms
```

### 🔧 Customização

#### Adicionar Novo Logger Provider

```typescript
// 1. Criar implementação (infrastructure/observability/)
@Injectable()
export class CloudWatchLogger implements ILogger {
  log(message: string, context?: string) {
    // Implementação customizada
  }
  // ... outros métodos
}

// 2. Registrar no ObservabilityModule
{
  provide: LOGGER,
  useClass: CloudWatchLogger, // Trocar implementação
}
```

#### Adicionar Novas Métricas

```typescript
// Adicionar na interface (application/observability/metrics.interface.ts)
export interface IMetrics {
  // ... métricas existentes
  recordDatabaseQueryDuration(query: string, duration: number): void;
}

// Implementar (infrastructure/observability/metrics.service.ts)
@Injectable()
export class MetricsService implements IMetrics {
  private dbQueryDuration = this.meter.createHistogram('db_query_duration_ms');

  recordDatabaseQueryDuration(query: string, duration: number) {
    this.dbQueryDuration.record(duration, { query });
  }
}
```

### � Documentação Completa

Para detalhes completos sobre observabilidade, incluindo:
- Configuração do Docker Compose
- Integração com Jaeger, Prometheus e Grafana
- Dashboards customizados
- Troubleshooting
- Boas práticas

**📖 Consulte**: [docs/OBSERVABILITY.md](docs/OBSERVABILITY.md)

## 🚀 Instalação

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Passos

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd api.nestjs
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env
   
   # Configure as variáveis (especialmente JWT_SECRET)
   # DATABASE_URL="file:./dev.db"
   # JWT_SECRET="your-secret-key-change-in-production"
   ```

4. **Execute as migrations do Prisma**
   ```bash
   npm run prisma:migrate
   ```

5. **Gere o Prisma Client**
   ```bash
   npm run prisma:generate
   ```

6. **Inicie a aplicação**
   ```bash
   # Modo desenvolvimento (com watch)
   npm run start:dev
   
   # Modo produção
   npm run build
   npm run start:prod
   ```

A aplicação estará disponível em: **http://localhost:3000**

## 📜 Scripts Disponíveis

### Aplicação
```bash
npm run start          # Inicia a aplicação
npm run start:dev      # Inicia em modo desenvolvimento (watch)
npm run start:debug    # Inicia em modo debug
npm run start:prod     # Inicia em modo produção
npm run build          # Compila o projeto
```

### Prisma
```bash
npm run prisma:generate  # Gera o Prisma Client
npm run prisma:migrate   # Executa migrations
npm run prisma:studio    # Abre o Prisma Studio (GUI)
```

### Qualidade de Código
```bash
npm run lint           # Executa o linter
npm run format         # Formata o código com Prettier
npm run test           # Executa testes unitários
npm run test:e2e       # Executa testes E2E
npm run test:cov       # Gera relatório de cobertura
```

## 🔌 Endpoints da API

### 🔐 Autenticação

Base URL: `http://localhost:3000/auth`

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-v4",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2025-10-28T12:34:56.789Z",
      "updatedAt": "2025-10-28T12:34:56.789Z"
    }
  }
}
```

**Erro - Credenciais Inválidas (401):**
```json
{
  "statusCode": 401,
  "error": {
    "message": "Invalid credentials",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/auth/login"
}
```

### 👤 Usuários

Base URL: `http://localhost:3000/api/users`

> **📌 Nota:** A maioria dos endpoints requer autenticação JWT. Inclua o header:
> `Authorization: Bearer <seu-token-jwt>`

### 📝 Criar Usuário
**🔓 Rota Pública** (não requer autenticação)

```http
POST /api/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "USER"
}
```

> **Roles disponíveis:** `USER` (padrão), `MODERATOR`, `ADMIN`

**Resposta de Sucesso (201):**
```json
{
  "data": {
    "id": "uuid-v4",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "USER",
    "createdAt": "2025-10-28T12:34:56.789Z",
    "updatedAt": "2025-10-28T12:34:56.789Z"
  }
}
```

**Erro - Email já em uso (409):**
```json
{
  "statusCode": 409,
  "error": {
    "message": "Email already in use",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/api/users"
}
```

### 📋 Listar Usuários
**🔒 Requer:** `ADMIN` ou `MODERATOR`

```http
GET /api/users
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "uuid-v4",
      "name": "João Silva",
      "email": "joao@example.com",
      "createdAt": "2025-10-28T12:34:56.789Z",
      "updatedAt": "2025-10-28T12:34:56.789Z"
    }
  ]
}
```

### 🔍 Buscar Usuário por ID
**🔐 Requer:** Autenticação (qualquer usuário autenticado)

```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "data": {
    "id": "uuid-v4",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "USER",
    "createdAt": "2025-10-28T12:34:56.789Z",
    "updatedAt": "2025-10-28T12:34:56.789Z"
  }
}
```

**Erro - Usuário não encontrado (404):**
```json
{
  "statusCode": 404,
  "error": {
    "message": "User not found",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/api/users/<id>"
}
```

### ✏️ Atualizar Usuário
**🔐 Requer:** Autenticação (qualquer usuário autenticado)

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "João M. Silva",
  "email": "novo@example.com",
  "password": "novaSenha123",
  "role": "MODERATOR"
}
```

**Resposta de Sucesso (200):**
```json
{
  "data": {
    "id": "uuid-v4",
    "name": "João M. Silva",
    "email": "novo@example.com",
    "role": "MODERATOR",
    "createdAt": "2025-10-28T12:34:56.789Z",
    "updatedAt": "2025-10-28T14:20:10.123Z"
  }
}
```

### 🗑️ Soft Delete (Exclusão Lógica)

O sistema implementa **soft delete**, permitindo recuperar usuários deletados.

#### Deletar Usuário (Soft Delete)
**🔐 Requer:** Autenticação (qualquer usuário autenticado)

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

**Resposta de Sucesso (204):** No Content

> O usuário é marcado como deletado (`deletedAt` preenchido) mas permanece no banco de dados.

#### Deletar Permanentemente (Hard Delete)
**🔒 Requer:** `ADMIN` apenas

```http
DELETE /api/users/:id/hard
Authorization: Bearer <token>
```

**Resposta de Sucesso (204):** No Content

> ⚠️ **ATENÇÃO**: Esta operação remove o usuário permanentemente do banco de dados e não pode ser desfeita!
> 
> **Erro - Sem Permissão (403):**
> ```json
> {
>   "statusCode": 403,
>   "error": {
>     "message": "You do not have permission to access this resource",
>     "details": null,
>     "code": null
>   },
>   "timestamp": "2025-10-28T15:30:00.000Z",
>   "path": "/api/users/<id>/hard"
> }
> ```

#### Restaurar Usuário Deletado
**🔒 Requer:** `ADMIN` apenas

```http
POST /api/users/:id/restore
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "data": {
    "id": "uuid-v4",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "USER",
    "createdAt": "2025-10-28T12:34:56.789Z",
    "updatedAt": "2025-10-28T14:20:10.123Z"
  }
}
```

**Erro - Usuário não está deletado (409):**
```json
{
  "statusCode": 409,
  "error": {
    "message": "User is not deleted",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T15:30:00.000Z",
  "path": "/api/users/<id>/restore"
}
```

#### Listar Incluindo Usuários Deletados
**🔒 Requer:** `ADMIN` ou `MODERATOR`

```http
GET /api/users?includeDeleted=true
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "uuid-v4",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "USER",
      "createdAt": "2025-10-28T12:34:56.789Z",
      "updatedAt": "2025-10-28T12:34:56.789Z"
    }
  ]
}
```

## 🔑 Sistema de Roles (RBAC)

A API implementa controle de acesso baseado em roles (RBAC):

### Roles Disponíveis

| Role | Descrição | Permissões |
|------|-----------|-----------|
| **ADMIN** | Administrador | Acesso total, incluindo hard delete e restore |
| **MODERATOR** | Moderador | Pode listar usuários e ver deletados |
| **USER** | Usuário comum | Acesso básico aos próprios recursos |

### Matriz de Permissões

| Endpoint | Public | USER | MODERATOR | ADMIN |
|----------|--------|------|-----------|-------|
| `POST /auth/login` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/users` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/users` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/users/:id` | ❌ | ✅ | ✅ | ✅ |
| `PUT /api/users/:id` | ❌ | ✅ | ✅ | ✅ |
| `DELETE /api/users/:id` | ❌ | ✅ | ✅ | ✅ |
| `DELETE /api/users/:id/hard` | ❌ | ❌ | ❌ | ✅ |
| `POST /api/users/:id/restore` | ❌ | ❌ | ❌ | ✅ |

### � Gerenciamento de Roles

#### Criar Primeiro Administrador

Para criar o primeiro usuário ADMIN, você pode:

**Opção 1: Criar via API (primeiro usuário)**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Principal",
    "email": "admin@example.com",
    "password": "senha-segura-admin",
    "role": "ADMIN"
  }'
```

**Opção 2: Atualizar role diretamente no banco de dados**
```bash
# Via SQLite CLI
sqlite3 src/infrastructure/prisma/dev.db "UPDATE users SET role='ADMIN' WHERE email='seu-email@example.com';"
```

**Opção 3: Via Prisma Studio**
```bash
npm run prisma:studio
# Acesse http://localhost:5555
# Edite o campo 'role' do usuário para 'ADMIN'
```

#### Promover Usuário Existente

```bash
# Requer estar autenticado
TOKEN="seu-token-admin"

curl -X PUT http://localhost:3000/api/users/<user-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "MODERATOR"}'
```

#### Validação de Roles

O sistema valida automaticamente que os roles sejam um dos valores permitidos:
- ✅ `ADMIN` - Administrador total
- ✅ `MODERATOR` - Moderador  
- ✅ `USER` - Usuário padrão
- ❌ Qualquer outro valor será rejeitado com erro de validação

### �📋 Exemplos com cURL

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Criar usuário:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "role": "USER"
  }'
```

**Listar usuários (requer ADMIN/MODERATOR):**
```bash
# Primeiro, pegue o token do login
TOKEN="seu-token-jwt-aqui"

curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

**Listar incluindo deletados (requer ADMIN/MODERATOR):**
```bash
curl "http://localhost:3000/api/users?includeDeleted=true" \
  -H "Authorization: Bearer $TOKEN"
```

**Buscar por ID (requer autenticação):**
```bash
curl http://localhost:3000/api/users/<id> \
  -H "Authorization: Bearer $TOKEN"
```

**Atualizar (requer autenticação):**
```bash
curl -X PUT http://localhost:3000/api/users/<id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "João Atualizado"}'
```

**Soft Delete (requer autenticação):**
```bash
curl -X DELETE http://localhost:3000/api/users/<id> \
  -H "Authorization: Bearer $TOKEN"
```

**Restaurar (requer ADMIN):**
```bash
curl -X POST http://localhost:3000/api/users/<id>/restore \
  -H "Authorization: Bearer $TOKEN"
```

**Hard Delete (requer ADMIN):**
```bash
curl -X DELETE http://localhost:3000/api/users/<id>/hard \
  -H "Authorization: Bearer $TOKEN"
```

## 📖 Documentação Interativa

A aplicação disponibiliza documentação interativa via **Swagger UI**, onde você pode testar todos os endpoints diretamente pelo navegador.

**Acesse:** [http://localhost:3000/api](http://localhost:3000/api)

### Recursos do Swagger
- ✅ Documentação completa de todos os endpoints
- ✅ Esquemas de request/response
- ✅ Teste interativo de APIs
- ✅ Validações e exemplos de uso
- ✅ **Autenticação Bearer JWT integrada**

### Como Usar Autenticação no Swagger

1. Acesse [http://localhost:3000/api](http://localhost:3000/api)
2. Faça login via endpoint `POST /auth/login`
3. Copie o `accessToken` da resposta
4. Clique no botão **"Authorize"** 🔒 no topo da página
5. Cole o token no campo (sem o prefixo "Bearer")
6. Clique em **"Authorize"** e depois **"Close"**
7. Agora você pode testar endpoints protegidos! ✅

## ⚠️ Tratamento de Erros

A aplicação utiliza um sistema de tratamento de erros padronizado através do `AllExceptionsFilter`.

### Envelope de Erro Padrão
```json
{
  "statusCode": number,
  "error": {
    "message": string | null,
    "details": any | null,
    "code": string | null
  },
  "timestamp": "ISO-8601",
  "path": string
}
```

### Tipos de Erro

**Validação (400):**
```json
{
  "statusCode": 400,
  "error": {
    "message": "Validation failed",
    "details": [
      "email must be an email",
      "password must be longer than or equal to 6 characters"
    ],
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/api/users"
}
```

**Não Encontrado (404):**
```json
{
  "statusCode": 404,
  "error": {
    "message": "User not found",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/api/users/<id>"
}
```

**Conflito (409):**
```json
{
  "statusCode": 409,
  "error": {
    "message": "Email already in use",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/api/users"
}
```

**Não Autorizado (401):**
```json
{
  "statusCode": 401,
  "error": {
    "message": "Unauthorized",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/api/users"
}
```

**Sem Permissão (403):**
```json
{
  "statusCode": 403,
  "error": {
    "message": "You do not have permission to access this resource",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/api/users"
}
```

**Erro Interno (500):**
```json
{
  "statusCode": 500,
  "error": {
    "message": "Internal server error",
    "details": null,
    "code": null
  },
  "timestamp": "2025-10-28T12:34:56.789Z",
  "path": "/api/users"
}
```

## 🔒 Segurança

### Autenticação JWT
- **Token JWT** gerado no login com expiração de 24 horas
- Tokens assinados com `JWT_SECRET` (configure no `.env`)
- **Passport JWT Strategy** para validação automática
- **Guard Global**: todas as rotas protegidas por padrão
- Decorator `@Public()` para rotas públicas (login, registro)

### Autorização RBAC
- **RolesGuard** valida permissões baseadas em roles
- Decorator `@Roles()` define roles permitidas por endpoint
- Sistema hierárquico de permissões por role
- Validação automática do role do usuário em cada request
- Mensagens de erro claras (401 Unauthorized, 403 Forbidden)
- **Granularidade de acesso**:
  - `ADMIN`: Acesso total, incluindo operações destrutivas
  - `MODERATOR`: Acesso a listagens e visualizações completas
  - `USER`: Acesso básico aos próprios recursos
- Proteção contra escalação de privilégios
- Roles validados no DTO com `@IsIn()` decorator

### Hash de Senhas
- Todas as senhas são criptografadas usando **bcryptjs**
- Salt rounds: 10
- Senhas **nunca** são retornadas nas respostas da API
- Comparação segura usando `bcrypt.compare()`

### Validação de Dados
- DTOs com validação rigorosa via **class-validator**
- Whitelist habilitada: propriedades não declaradas são removidas automaticamente
- Transform habilitado: tipos são convertidos automaticamente
- Validação de email, senha (mínimo 6 caracteres), roles

### Proteções Implementadas
- ✅ **Token Expiration**: Tokens expiram em 24h
- ✅ **Password Hashing**: Senhas nunca em texto puro
- ✅ **Role Validation**: Autorização granular por endpoint
- ✅ **Input Validation**: Validação rigorosa de DTOs
- ✅ **Error Handling**: Mensagens de erro padronizadas
- ✅ **JWT Signature**: Tokens assinados e verificados

### 🛡️ Boas Práticas de Segurança

#### Produção
1. **JWT_SECRET**: Sempre use uma chave forte e aleatória em produção
   ```bash
   # Gere uma chave segura:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Roles**: Princípio do menor privilégio
   - Novos usuários sempre começam com role `USER`
   - Promoções de role devem ser auditadas
   - Evite criar múltiplos usuários `ADMIN` sem necessidade

3. **Token**: Configure tempo de expiração adequado
   - Desenvolvimento: 24h (configurado)
   - Produção: Considere 1-2h com refresh token

4. **HTTPS**: Sempre use HTTPS em produção para proteger tokens em trânsito

5. **Rate Limiting**: Implemente para prevenir brute force em `/auth/login`

#### Desenvolvimento
- ✅ Use `.env` para configurações sensíveis
- ✅ Nunca commite `.env` no Git (já está no `.gitignore`)
- ✅ Use `.env.example` como template
- ✅ Passwords de teste devem ser diferentes das de produção

## 🗄️ Banco de Dados - Prisma

### Configuração

O projeto utiliza **Prisma ORM** com SQLite em desenvolvimento.

**Estrutura:**
```
src/infrastructure/prisma/
├── schema.prisma          # Schema do banco de dados
├── migrations/            # Histórico de migrations
│   └── 20251028110605_init/
└── dev.db                # Banco de dados SQLite
```

### Schema do Usuário

```prisma
model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  password  String
  role      String    @default("USER")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}
```

### Histórico de Migrations

O projeto possui as seguintes migrations aplicadas:

1. **20251028110605_init**
   - Criação inicial da tabela `users`
   - Campos: id, name, email, password, timestamps

2. **20251028114403_add_soft_delete** 
   - Adição do campo `deletedAt` (nullable)
   - Suporte para soft delete

3. **20251028121837_add_user_role**
   - Adição do campo `role` com default `'USER'`
   - Suporte para sistema RBAC
   - Usuários existentes receberam automaticamente role `'USER'`

### Comandos Prisma

```bash
# Gerar Prisma Client
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name <nome-da-migration>

# Aplicar migrations
npx prisma migrate deploy

# Abrir Prisma Studio (GUI para visualizar dados)
npx prisma studio

# Reset do banco de dados (CUIDADO!)
npx prisma migrate reset
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:cov

# Modo watch
npm run test:watch
```

## 📝 DTOs e Validação

### LoginDto
```typescript
{
  email: string;     // @IsEmail(), @IsNotEmpty()
  password: string;  // @IsString(), @MinLength(6), @IsNotEmpty()
}
```

### AuthResponseDto
```typescript
{
  accessToken: string;
  user: UserResponseDto;
}
```

### CreateUserDto
```typescript
{
  name: string;      // @IsString(), @MinLength(2)
  email: string;     // @IsEmail()
  password: string;  // @IsString(), @MinLength(6)
  role?: UserRole;   // @IsIn(['ADMIN', 'USER', 'MODERATOR']), @IsOptional()
}
```

### UpdateUserDto
```typescript
{
  name?: string;     // @IsString(), @MinLength(2), @IsOptional()
  email?: string;    // @IsEmail(), @IsOptional()
  password?: string; // @IsString(), @MinLength(6), @IsOptional()
  role?: UserRole;   // @IsIn(['ADMIN', 'USER', 'MODERATOR']), @IsOptional()
}
```

### UserResponseDto
```typescript
{
  id: string;
  name: string;
  email: string;
  role: UserRole;    // 'ADMIN' | 'USER' | 'MODERATOR'
  createdAt: Date;
  updatedAt: Date;
  // password é EXCLUÍDO através do mapper
}
```

## 🎯 Padrões e Boas Práticas

### Repository Pattern
- Interface `IUserRepository` define o contrato
- Implementação concreta em `infrastructure/repositories`
- Injeção via token `USER_REPOSITORY`

### Mappers
- `UserMapper.toResponse()` transforma entidades em DTOs
- Remove campos sensíveis (password)
- Garante consistência nas respostas

### Dependency Injection
```typescript
// UserModule
providers: [
  PrismaService,
  UserService,
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
  },
]
```

### Global Pipes, Filters e Guards
```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({ 
  whitelist: true, 
  transform: true 
}));
app.useGlobalFilters(new AllExceptionsFilter());
app.useGlobalInterceptors(new ResponseInterceptor());

// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, // Guard global de autenticação
  },
]
```

### Custom Decorators

**@Public()** - Marca rota como pública:
```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

**@Roles()** - Restringe por roles:
```typescript
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Get()
async findAll() {
  return this.userService.findAll();
}
```

**@CurrentUser()** - Injeta usuário autenticado:
```typescript
@Get('profile')
async getProfile(@CurrentUser() user: IAuthenticatedUser) {
  return user;
}

// Ou apenas um campo:
// Ou apenas um campo:
@Get('my-id')
async getMyId(@CurrentUser('userId') userId: string) {
  return { userId };
}
```

## 🚀 Guia Rápido de Uso

### Cenário 1: Primeiro Acesso (Setup Inicial)

```bash
# 1. Criar primeiro usuário administrador
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Principal",
    "email": "admin@empresa.com",
    "password": "Admin@123",
    "role": "ADMIN"
  }'

# 2. Fazer login e obter token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "Admin@123"
  }'

# 3. Copie o accessToken retornado
TOKEN="seu-token-jwt-aqui"

# 4. Teste o acesso administrativo
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### Cenário 2: Criar Moderador

```bash
# 1. Admin cria um novo moderador
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Moderador",
    "email": "moderador@empresa.com",
    "password": "Mod@123",
    "role": "MODERATOR"
  }'

# 2. Moderador faz login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "moderador@empresa.com",
    "password": "Mod@123"
  }'

# 3. Moderador pode listar usuários mas não deletar permanentemente
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN_MODERATOR"
```

### Cenário 3: Usuário Comum (Registro Público)

```bash
# 1. Criar conta (não precisa de autenticação)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
# Role será automaticamente 'USER'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'

# 3. Usuário pode acessar seus próprios dados
TOKEN_USER="token-do-usuario"
curl http://localhost:3000/api/users/<seu-id> \
  -H "Authorization: Bearer $TOKEN_USER"
```

### Cenário 4: Testes no Swagger

1. Inicie o servidor: `npm run start:dev`
2. Acesse: http://localhost:3000/api
3. No Swagger UI:
   - Execute `POST /auth/login`
   - Copie o `accessToken` da resposta
   - Clique no botão **"Authorize"** 🔒 no topo
   - Cole o token (sem prefixo "Bearer")
   - Clique em "Authorize" e depois "Close"
   - Agora todos os endpoints protegidos funcionarão!

## 📚 Documentação Adicional

Para entender em profundidade as arquiteturas implementadas:

- **[docs/AUTH_ARCHITECTURE.md](docs/AUTH_ARCHITECTURE.md)** - Arquitetura completa do sistema de autenticação
  - Estrutura organizada por camadas
  - Fluxos de autenticação e autorização
  - Sistema de roles detalhado
  - Padrões e boas práticas aplicados

- **[docs/OBSERVABILITY.md](docs/OBSERVABILITY.md)** - Arquitetura completa de observabilidade
  - OpenTelemetry (Logs, Métricas, Traces)
  - Configuração Docker Compose
  - Integração com Jaeger, Prometheus, Grafana
  - Clean Architecture aplicada
  - Padrões SOLID e DI com tokens

- **[docs/OBSERVABILITY_INTERFACES.md](docs/OBSERVABILITY_INTERFACES.md)** - Refatoração com interfaces
  - Interface segregation pattern
  - Dependency Inversion Principle
  - Testabilidade e mocks
  - Exemplos práticos

## 🚀 Próximos Passos

### ✅ Funcionalidades Implementadas
- [x] **Clean Architecture em 4 camadas** ✨
- [x] **Soft delete com recuperação** ✨
- [x] **Autenticação JWT** ✨
- [x] **Sistema de roles (RBAC)** ✨
- [x] **Observabilidade completa (OpenTelemetry)** ✨
  - [x] Logs estruturados com contexto
  - [x] Métricas (HTTP requests, errors, latency)
  - [x] Traces distribuídos
  - [x] Health checks (liveness, readiness, metrics)
- [x] **Arquitetura de observabilidade com interfaces** ✨
- [x] **Dependency Injection com tokens (SOLID)** ✨
- [x] **Documentação Swagger integrada** ✨
- [x] **Tratamento global de erros** ✨
- [x] **Validação automática de DTOs** ✨

### 🎯 Melhorias Planejadas
- [ ] **Refresh tokens** para renovação de JWT
- [ ] **Rate limiting** com @nestjs/throttler
- [ ] **Testes unitários** completos (>80% coverage)
- [ ] **Testes E2E** com autenticação
- [ ] **Paginação** com cursor ou offset
- [ ] **Filtros e ordenação** avançados
- [ ] **Cache Redis** para performance
- [ ] **Audit log** de ações críticas
- [ ] **CI/CD** com GitHub Actions
- [ ] **Docker** para containerização
- [ ] **Kubernetes** manifests
- [ ] **Database migrations** versionadas
- [ ] **Backup automatizado** do banco
- [ ] **Monitoramento APM** (Application Performance Monitoring)

## 📄 Licença

Este projeto é um exemplo educacional e está sob licença UNLICENSED.

## 👨‍💻 Autor

Desenvolvido para demonstrar boas práticas de arquitetura de software com NestJS e Prisma.

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**
