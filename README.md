# Dark API

> API RESTful demonstrando **Arquitetura Limpa** (Clean Architecture) com NestJS, Prisma ORM e princípios SOLID

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Endpoints da API](#-endpoints-da-api)
- [Documentação Interativa](#-documentação-interativa)
- [Tratamento de Erros](#-tratamento-de-erros)

## 🎯 Visão Geral

API desenvolvida para demonstrar boas práticas de arquitetura de software, aplicando:

- ✅ **Clean Architecture** (Arquitetura em Camadas)
- ✅ **Princípios SOLID**
- ✅ **Dependency Injection**
- ✅ **Repository Pattern**
- ✅ **DTOs e Validação Automática**
- ✅ **Tratamento Padronizado de Erros**
- ✅ **Documentação com Swagger**
- ✅ **Soft Delete** (Exclusão Lógica com Recuperação)
- ✅ **Autenticação JWT** (JSON Web Token)
- ✅ **Autorização RBAC** (Role-Based Access Control)

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
│   │   ├── database/             # Configuração de banco
│   │   │   └── prisma.service.ts
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
│   │   └── user/                 # Módulo de usuário
│   │       ├── user.controller.ts
│   │       └── user.module.ts
│   │
│   ├── app.module.ts             # Módulo raiz
│   └── main.ts                   # Bootstrap da aplicação
│
├── docs/                         # Documentação
│   └── AUTH_ARCHITECTURE.md      # Arquitetura de autenticação
├── test/                         # Testes E2E
├── .env.example                  # Variáveis de ambiente
├── prisma.config.ts              # Configuração do Prisma
├── package.json
└── tsconfig.json
```

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

### 📋 Exemplos com cURL

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
- Sistema hierárquico: `ADMIN > MODERATOR > USER`
- Mensagens de erro claras (401 Unauthorized, 403 Forbidden)

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
@Get('my-id')
async getMyId(@CurrentUser('userId') userId: string) {
  return { userId };
}
```

## � Documentação Adicional

Para entender em profundidade a arquitetura de autenticação, consulte:

- **[docs/AUTH_ARCHITECTURE.md](docs/AUTH_ARCHITECTURE.md)** - Arquitetura completa do sistema de autenticação
  - Estrutura organizada por camadas
  - Fluxos de autenticação e autorização
  - Sistema de roles detalhado
  - Padrões e boas práticas aplicados

## �🚀 Próximos Passos

- [x] **Implementar soft delete** ✨
- [x] **Implementar autenticação JWT** ✨
- [x] **Sistema de roles (RBAC)** ✨
- [ ] Adicionar refresh tokens
- [ ] Implementar rate limiting
- [ ] Adicionar testes unitários e E2E
- [ ] Implementar paginação
- [ ] Adicionar filtros e ordenação
- [ ] Implementar cache com Redis
- [ ] Adicionar logging estruturado
- [ ] CI/CD com GitHub Actions
- [ ] Containerização com Docker

## 📄 Licença

Este projeto é um exemplo educacional e está sob licença UNLICENSED.

## 👨‍💻 Autor

Desenvolvido para demonstrar boas práticas de arquitetura de software com NestJS e Prisma.

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**
