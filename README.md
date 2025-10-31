# Dark API

> API RESTful demonstrando **Arquitetura Limpa** (Clean Architecture) com NestJS, Prisma ORM e princípios SOLID

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Sistema RBAC](#-sistema-rbac)
- [Observabilidade](#-observabilidade)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Documentação Interativa](#-documentação-interativa)

## 🎯 Visão Geral

API desenvolvida para demonstrar boas práticas de arquitetura de software:

- ✅ **Clean Architecture** (4 camadas)
- ✅ **Princípios SOLID**
- ✅ **Dependency Injection com Tokens**
- ✅ **Repository Pattern**
- ✅ **Autenticação JWT + RBAC completo**
- ✅ **Sistema RBAC** (Roles, Permissions, Assignments)
- ✅ **Observabilidade** (OpenTelemetry)
- ✅ **Paginação** com metadata
- ✅ **Soft Delete** com recuperação
- ✅ **Documentação Swagger**
- ✅ **Testes Unitários** (83 testes)
- ✅ **Testes E2E** (87 testes em 6 módulos)

## 🏗️ Arquitetura

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

## 🛠️ Tecnologias

- **[NestJS](https://nestjs.com/)** - Framework Node.js
- **[Prisma](https://www.prisma.io/)** - ORM TypeScript
- **[Passport JWT](https://www.passportjs.org/)** - Autenticação
- **[OpenTelemetry](https://opentelemetry.io/)** - Observabilidade
- **[Swagger](https://swagger.io/)** - Documentação API

## 🎭 Sistema RBAC

### Entidades

- **User**: Usuários com roles (ADMIN/MODERATOR/USER)
- **Role**: Papéis com áreas de acesso
- **EnvironmentPermission**: Permissões por ambiente (@DEV, @PROD)
- **RoleAssignment**: Atribuições de roles e permissões a usuários

### Validações de Integridade

- ✅ Valida que roles e permissões existem antes de atribuir
- ✅ Impede exclusão de roles/permissões em uso
- ✅ Valida datas (startDate <= endDate)
- ✅ Auditoria (quem concedeu a permissão)

### Endpoints RBAC

**Roles:**
- `POST /roles` - Criar (ADMIN)
- `GET /roles` - Listar (ADMIN/MODERATOR)
- `GET /roles/:id` - Buscar
- `DELETE /roles/:id` - Soft delete (ADMIN)
- `DELETE /roles/:id/hard` - Hard delete (ADMIN)

**Environment Permissions:**
- `POST /environment-permissions` - Criar (ADMIN)
- `GET /environment-permissions` - Listar (ADMIN/MODERATOR)
- Similar CRUD operations

**Role Assignments:**
- `POST /role-assignments` - Criar (ADMIN)
- `GET /role-assignments/user/:userId` - Buscar por usuário
- Similar CRUD operations

## 📊 Observabilidade

### Recursos

- **Logs**: Console + OpenTelemetry
- **Métricas**: HTTP requests, errors, latency
- **Traces**: Distributed tracing
- **Health Checks**: `/health`, `/health/ready`, `/health/metrics`

### Uso

```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject(LOGGER) private readonly logger: ILogger,
    @Inject(METRICS) private readonly metrics: IMetrics,
  ) {}

  async create(data: CreateUserDto) {
    this.logger.info('Creating user', 'UserService');
    this.metrics.incrementCounter('users_created', 1);
    // ...
  }
}
```

**📖 Mais detalhes**: [docs/OBSERVABILITY.md](docs/OBSERVABILITY.md)

## �� Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis
cp .env.example .env

# 3. Executar migrations
npm run prisma:migrate

# 4. Gerar Prisma Client
npm run prisma:generate

# 5. Iniciar aplicação
npm run start:dev
```

Acesse: **http://localhost:3000**

## ⚙️ Variáveis de Ambiente

```bash
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Application
PORT=3000

# OpenTelemetry (opcional)
OTEL_ENABLED=false
SERVICE_NAME="dark-api"

# Pagination
DEFAULT_PER_PAGE=10
MAX_PER_PAGE=100
```

## 🔌 Endpoints da API

### Autenticação

**Login**
```http
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Usuários

**Criar (Público)**
```http
POST /api/users
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Listar (ADMIN/MODERATOR)**
```http
GET /api/users?page=1&perPage=10&includeDeleted=false
Authorization: Bearer <token>
```

**Resposta paginada:**
```json
{
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "perPage": 10,
    "totalPages": 5
  }
}
```

### Matriz de Permissões

| Endpoint | Public | USER | MODERATOR | ADMIN |
|----------|--------|------|-----------|-------|
| `POST /auth/login` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/users` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/users` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/users/:id` | ❌ | ✅ | ✅ | ✅ |
| `DELETE /api/users/:id/hard` | ❌ | ❌ | ❌ | ✅ |

## 📖 Documentação Interativa

**Swagger UI:** [http://localhost:3000/api](http://localhost:3000/api)

### Como usar autenticação:

1. Faça login via `POST /auth/login`
2. Copie o `accessToken`
3. Clique em **"Authorize"** 🔒 no Swagger
4. Cole o token (sem "Bearer")
5. ✅ Pronto! Endpoints protegidos funcionarão

## 🧪 Testes

### Estrutura de Testes

O projeto possui cobertura completa de testes unitários e E2E organizados por módulo:

```
test/
├── e2e/
│   ├── health/
│   │   └── health.e2e-spec.ts             # Testes E2E de health checks (3 testes)
│   ├── auth/
│   │   └── auth.e2e-spec.ts               # Testes E2E de autenticação (6 testes)
│   ├── user/
│   │   └── user.e2e-spec.ts               # Testes E2E de usuários (18 testes)
│   ├── role/
│   │   └── role.e2e-spec.ts               # Testes E2E de roles (18 testes)
│   ├── environment-permission/
│   │   └── environment-permission.e2e-spec.ts  # Testes E2E de permissões (18 testes)
│   └── role-assignment/
│       └── role-assignment.e2e-spec.ts    # Testes E2E de atribuições (24 testes)
├── unit/
│   └── presentation/
│       ├── auth/
│       │   └── auth.controller.spec.ts    # AuthController (4 testes)
│       ├── user/
│       │   └── user.controller.spec.ts    # UserController (16 testes)
│       ├── role/
│       │   └── role.controller.spec.ts    # RoleController (20 testes)
│       ├── environment-permission/
│       │   └── environment-permission.controller.spec.ts  # (20 testes)
│       ├── role-assignment/
│       │   └── role-assignment.controller.spec.ts  # (18 testes)
│       └── observability/
│           └── health.controller.spec.ts  # HealthController (13 testes)
├── jest-e2e.json                          # Configuração Jest E2E
└── jest-unit.json                         # Configuração Jest Unit
```

### Executar Testes

```bash
# Todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes E2E
npm run test:e2e

# Testes com cobertura
npm run test:cov

# Testes em modo watch
npm run test:watch
```

### Cobertura de Testes

- ✅ **83 testes unitários** passando
- ✅ **63+ testes E2E** organizados por módulo
- ✅ **6 controllers** com cobertura completa
- ✅ **6 módulos E2E** testados (Health, Auth, User, Role, EnvironmentPermission, RoleAssignment)
- ✅ Testes de sucesso e cenários de erro
- ✅ Validação de DTOs e responses
- ✅ Mocks e injeção de dependências
- ✅ Testes de autenticação e autorização

### Padrões Utilizados

- **Jest** para framework de testes
- **Supertest** para testes E2E
- **Mocking** com `jest.Mocked<T>` para type safety
- **Testes isolados** sem dependências externas
- **Assertions** focadas em comportamento, não implementação

## 🛠️ Scripts Disponíveis

```bash
npm run start:dev      # Desenvolvimento com hot-reload
npm run build          # Build para produção
npm run test           # Testes unitários
npm run test:unit      # Apenas testes unitários
npm run test:e2e       # Testes end-to-end
npm run test:cov       # Testes com cobertura
npm run prisma:studio  # GUI do banco de dados
npm run prisma:migrate # Executar migrations
npm run lint           # Verificar código
npm run format         # Formatar código
```

## 📚 Documentação Adicional

- **[docs/AUTH_ARCHITECTURE.md](docs/AUTH_ARCHITECTURE.md)** - Arquitetura de autenticação
- **[docs/OBSERVABILITY.md](docs/OBSERVABILITY.md)** - Guia de observabilidade

## 🔒 Segurança

- ✅ JWT com expiração configurável
- ✅ Hash bcrypt para senhas (10 salt rounds)
- ✅ RBAC com 3 níveis
- ✅ Guards globais
- ✅ Validação rigorosa de DTOs
- ✅ Tokens assinados e verificados

## 📄 Licença

Projeto educacional - UNLICENSED

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**
