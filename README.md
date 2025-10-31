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

## 🧪 Scripts

```bash
npm run start:dev      # Desenvolvimento
npm run build          # Build produção
npm run test           # Testes unitários
npm run test:e2e       # Testes E2E
npm run prisma:studio  # GUI do banco
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
