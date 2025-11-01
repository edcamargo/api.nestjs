# Dark API

> API RESTful demonstrando **Arquitetura Limpa** (Clean Architecture) com NestJS, Prisma ORM e princípios SOLID

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI Pipeline](https://github.com/edcamargo/api.nestjs/actions/workflows/ci.yml/badge.svg)](https://github.com/edcamargo/api.nestjs/actions/workflows/ci.yml)
[![CD - Develop](https://github.com/edcamargo/api.nestjs/actions/workflows/cd-develop.yml/badge.svg)](https://github.com/edcamargo/api.nestjs/actions/workflows/cd-develop.yml)
[![CD - Production](https://github.com/edcamargo/api.nestjs/actions/workflows/cd-main.yml/badge.svg)](https://github.com/edcamargo/api.nestjs/actions/workflows/cd-main.yml)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Sistema RBAC](#-sistema-rbac)
- [Observabilidade](#-observabilidade)
- [Git Flow & CI/CD](#-git-flow--cicd)
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
- ✅ **Git Flow Automatizado** (feature/*, bugfix/*, hotfix/*)
- ✅ **CI/CD Completo** (GitHub Actions)
- ✅ **Auto PR Creation** (develop e main)
- ✅ **Paginação** com metadata
- ✅ **Soft Delete** com recuperação
- ✅ **Documentação Swagger**
- ✅ **Testes Unitários** (83 testes)
- ✅ **Testes E2E** (91 testes em 6 módulos)

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
- **[SQLite](https://www.sqlite.org/)** - Banco de dados (desenvolvimento e testes)
- **[Passport JWT](https://www.passportjs.org/)** - Autenticação
- **[OpenTelemetry](https://opentelemetry.io/)** - Observabilidade
- **[Swagger](https://swagger.io/)** - Documentação API
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD automatizado

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

## 🔄 Git Flow & CI/CD

Este projeto implementa **Git Flow automatizado** com pipelines CI/CD completos.

### 📐 Padrão de Branches

Todas as branches de desenvolvimento devem seguir o padrão:

| Padrão | Uso | Emoji | Exemplo |
|--------|-----|-------|---------|
| `feature/*` | Novas funcionalidades | ✨ | `feature/user-authentication` |
| `bugfix/*` | Correção de bugs | 🐛 | `bugfix/fix-login-error` |
| `hotfix/*` | Correções urgentes | 🚑 | `hotfix/critical-security-patch` |

> ⚠️ **Importante**: Branches que não seguirem o padrão terão o CI bloqueado automaticamente.

### 🚀 Fluxo Automatizado

```
┌─────────────────────────────────────────────────────────────┐
│  1️⃣ DESENVOLVIMENTO                                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ git checkout -b feature/nova-funcionalidade           │  │
│  │ git commit -m "feat: adiciona funcionalidade"         │  │
│  │ git push origin feature/nova-funcionalidade           │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2️⃣ CI PIPELINE (Automático)                                │
│  ✅ Branch Naming Check → Valida padrão feature/*          │
│  ✅ Lint Code → ESLint sem warnings                        │
│  ✅ Unit Tests → 83 testes                                 │
│  ✅ E2E Tests → 91 testes em 6 módulos                     │
│  ✅ Build → Compilação TypeScript                          │
│  ✅ Quality Gate → Verifica se tudo passou                 │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3️⃣ AUTO PR (Se CI passou)                                  │
│  🤖 Cria Pull Request automaticamente                       │
│  📋 Título: "✨ Nova funcionalidade"                        │
│  🏷️ Labels: feature, ready-for-review                      │
│  ✅ Pronto para code review                                 │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4️⃣ CODE REVIEW & MERGE                                     │
│  👀 Revisar código                                          │
│  💬 Discutir mudanças                                       │
│  ✅ Aprovar e fazer merge → develop                         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5️⃣ CD STAGING (Após merge em develop)                      │
│  📦 Build da aplicação                                      │
│  🗄️ Database migrations (SQLite)                            │
│  🚀 Deploy para ambiente de staging                         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6️⃣ AUTO PR TO MAIN (Após staging OK)                       │
│  🎉 Cria PR de Release automaticamente                      │
│  📊 Versão: YYYY.MM.DD-build_number                         │
│  ⚠️ Requer aprovação final                                  │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  7️⃣ CD PRODUCTION (Após merge em main)                      │
│  📦 Build final                                             │
│  🗄️ Database migrations (SQLite)                            │
│  🎯 Create GitHub Release                                   │
│  🚀 Deploy para PRODUÇÃO                                    │
└─────────────────────────────────────────────────────────────┘
```

### ⚡ Pipeline CI/CD

#### 1️⃣ **CI Pipeline** (Automático em todo push)
```yaml
✅ Branch Naming Check   # Valida padrão de nome
✅ Lint Code             # ESLint (0 warnings)
✅ Unit Tests            # 83 testes unitários
✅ E2E Tests             # 91 testes E2E
✅ Build Application     # TypeScript compilation
✅ Quality Gate          # Verifica se tudo passou
```

#### 2️⃣ **Auto PR to Develop** (Após CI passar)
- 🤖 Cria PR automaticamente
- 📋 Descrição detalhada com commits
- 🏷️ Labels automáticas por tipo
- ✨ Emoji baseado no tipo de branch
- ✅ Pronto para code review

#### 3️⃣ **CD - Staging** (Após merge em develop)
```yaml
✅ Build Application
✅ Database Migrations (SQLite)
✅ Deploy to Staging Environment
📊 Environment: Staging (develop branch)
```

#### 4️⃣ **Auto PR to Main** (Após deploy staging OK)
- 🎉 Cria PR de Release automaticamente
- 📊 Inclui últimos 10 commits do develop
- 🎯 Versionamento automático (YYYY.MM.DD-build)
- ⚠️ Requer aprovação para produção
- 🏷️ Label: release

#### 5️⃣ **CD - Production** (Após merge em main)
```yaml
✅ Build Application
✅ Database Migrations (SQLite)
✅ Create GitHub Release (tag versioned)
✅ Deploy to Production Environment
🎉 Production is live!
```

> **💡 Nota sobre SQLite**: O projeto usa SQLite em todos os ambientes por simplicidade. Para produção real, considere migrar para PostgreSQL ou MySQL editando o `schema.prisma` e as variáveis de ambiente nos workflows.

### 🎯 Como Contribuir

#### 1. Criar nova branch
```bash
# Escolha o tipo adequado
git checkout -b feature/minha-funcionalidade
# ou
git checkout -b bugfix/corrigir-bug
# ou
git checkout -b hotfix/correcao-urgente
```

#### 2. Desenvolver e commitar
```bash
# Use Conventional Commits
git add .
git commit -m "feat: adiciona autenticação OAuth"
git push origin feature/minha-funcionalidade
```

**Padrões de commit:**
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `test:` testes
- `refactor:` refatoração
- `chore:` manutenção

#### 3. Aguardar automação
- ⏳ CI roda automaticamente
- ✅ Se passar: PR criado automaticamente
- 📧 Você será notificado

#### 4. Code Review
- 👀 Revise o PR criado
- 💬 Responda comentários
- ✅ Aprove quando pronto

#### 5. Merge e Deploy
- ✨ Merge para `develop` → Deploy staging automático
- 🚀 Merge para `main` → Deploy produção automático

### 📊 Status dos Workflows

Todos os workflows estão configurados e funcionando:

| Workflow | Trigger | Descrição | Status |
|----------|---------|-----------|--------|
| **Branch Naming Check** | Push em qualquer branch | Valida padrão feature/\*, bugfix/\*, hotfix/\* | [![Branch Check](https://github.com/edcamargo/api.nestjs/actions/workflows/branch-naming-check.yml/badge.svg)](https://github.com/edcamargo/api.nestjs/actions/workflows/branch-naming-check.yml) |
| **CI Pipeline** | Push/PR em feature/\*, develop, main | Lint + Unit + E2E + Build | [![CI](https://github.com/edcamargo/api.nestjs/actions/workflows/ci.yml/badge.svg)](https://github.com/edcamargo/api.nestjs/actions/workflows/ci.yml) |
| **Auto PR to Develop** | CI passa em feature/\*, bugfix/\*, hotfix/\* | Cria PR automaticamente | ⚡ Automático |
| **CD - Staging** | Merge em develop | Deploy para staging | [![CD Staging](https://github.com/edcamargo/api.nestjs/actions/workflows/cd-develop.yml/badge.svg)](https://github.com/edcamargo/api.nestjs/actions/workflows/cd-develop.yml) |
| **Auto PR to Main** | Deploy staging concluído | Cria PR de release | ⚡ Automático |
| **CD - Production** | Merge em main | Deploy para produção | [![CD Production](https://github.com/edcamargo/api.nestjs/actions/workflows/cd-main.yml/badge.svg)](https://github.com/edcamargo/api.nestjs/actions/workflows/cd-main.yml) |

**Visualizar todos os workflows**: [Actions](https://github.com/edcamargo/api.nestjs/actions)

### 🛡️ Proteções de Branch

- 🔒 **main**: Protegida, requer PR + aprovação
- 🔒 **develop**: Protegida, requer PR + aprovação  
- ✅ **feature/\***: Livre para desenvolvimento

### 📚 Documentação Completa

Para mais detalhes sobre o Git Flow, consulte: **[docs/GIT_FLOW.md](docs/GIT_FLOW.md)**

## 🔧 Instalação

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

- ✅ **83 testes unitários** passando (100% dos controllers)
- ✅ **91 testes E2E** organizados por módulo
- ✅ **6 controllers** com cobertura completa
- ✅ **6 módulos E2E** testados:
  - Health (3 testes)
  - Auth (6 testes)
  - User (18 testes)
  - Role (18 testes)
  - EnvironmentPermission (18 testes)
  - RoleAssignment (24 testes)
- ✅ Testes de sucesso e cenários de erro
- ✅ Validação de DTOs e responses
- ✅ Mocks e injeção de dependências
- ✅ Testes de autenticação e autorização
- ✅ Testes com SQLite in-memory para isolamento

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

- **[docs/GIT_FLOW.md](docs/GIT_FLOW.md)** - Guia completo de Git Flow e automação
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

