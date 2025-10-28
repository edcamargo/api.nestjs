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
- **[class-validator](https://github.com/typestack/class-validator)** - Validação de DTOs
- **[class-transformer](https://github.com/typestack/class-transformer)** - Transformação de objetos
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hash de senhas
- **[uuid](https://github.com/uuidjs/uuid)** - Geração de UUIDs

## 📁 Estrutura do Projeto

```
api.nestjs/
├── src/
│   ├── application/              # Camada de Aplicação
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
│   │   ├── interfaces/           # Contratos/Abstrações
│   │   │   └── user.repository.ts
│   │   └── user/                 # Entidade de domínio
│   │       ├── user.entity.ts
│   │       └── user.constants.ts
│   │
│   ├── infrastructure/           # Camada de Infraestrutura
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
├── test/                         # Testes E2E
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
   # O arquivo .env já está configurado com SQLite
   # DATABASE_URL="file:./dev.db"
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

Base URL: `http://localhost:3000/api/users`

### 📝 Criar Usuário
```http
POST /api/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (201):**
```json
{
  "data": {
    "id": "uuid-v4",
    "name": "João Silva",
    "email": "joao@example.com",
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
```http
GET /api/users
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
```http
GET /api/users/:id
```

**Resposta de Sucesso (200):**
```json
{
  "data": {
    "id": "uuid-v4",
    "name": "João Silva",
    "email": "joao@example.com",
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
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "João M. Silva",
  "email": "novo@example.com",
  "password": "novaSenha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "data": {
    "id": "uuid-v4",
    "name": "João M. Silva",
    "email": "novo@example.com",
    "createdAt": "2025-10-28T12:34:56.789Z",
    "updatedAt": "2025-10-28T14:20:10.123Z"
  }
}
```

### 🗑️ Soft Delete (Exclusão Lógica)

O sistema implementa **soft delete**, permitindo recuperar usuários deletados.

#### Deletar Usuário (Soft Delete)
```http
DELETE /api/users/:id
```

**Resposta de Sucesso (204):** No Content

> O usuário é marcado como deletado (`deletedAt` preenchido) mas permanece no banco de dados.

#### Deletar Permanentemente (Hard Delete)
```http
DELETE /api/users/:id/hard
```

**Resposta de Sucesso (204):** No Content

> ⚠️ **ATENÇÃO**: Esta operação remove o usuário permanentemente do banco de dados e não pode ser desfeita!

#### Restaurar Usuário Deletado
```http
POST /api/users/:id/restore
```

**Resposta de Sucesso (200):**
```json
{
  "data": {
    "id": "uuid-v4",
    "name": "João Silva",
    "email": "joao@example.com",
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
```http
GET /api/users?includeDeleted=true
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

### 📋 Exemplos com cURL

**Criar usuário:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Listar usuários (apenas ativos):**
```bash
curl http://localhost:3000/api/users
```

**Listar incluindo deletados:**
```bash
curl "http://localhost:3000/api/users?includeDeleted=true"
```

**Buscar por ID:**
```bash
curl http://localhost:3000/api/users/<id>
```

**Atualizar:**
```bash
curl -X PUT http://localhost:3000/api/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"name": "João Atualizado"}'
```

**Soft Delete:**
```bash
curl -X DELETE http://localhost:3000/api/users/<id>
```

**Restaurar:**
```bash
curl -X POST http://localhost:3000/api/users/<id>/restore
```

**Hard Delete:**
```bash
curl -X DELETE http://localhost:3000/api/users/<id>/hard
```

## 📖 Documentação Interativa

A aplicação disponibiliza documentação interativa via **Swagger UI**, onde você pode testar todos os endpoints diretamente pelo navegador.

**Acesse:** [http://localhost:3000/api](http://localhost:3000/api)

### Recursos do Swagger
- ✅ Documentação completa de todos os endpoints
- ✅ Esquemas de request/response
- ✅ Teste interativo de APIs
- ✅ Validações e exemplos de uso

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

### Hash de Senhas
- Todas as senhas são criptografadas usando **bcryptjs**
- Salt rounds: 10
- Senhas **nunca** são retornadas nas respostas da API

### Validação de Dados
- DTOs com validação rigorosa via **class-validator**
- Whitelist habilitada: propriedades não declaradas são removidas automaticamente
- Transform habilitado: tipos são convertidos automaticamente

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

### CreateUserDto
```typescript
{
  name: string;      // @IsString(), @MinLength(2)
  email: string;     // @IsEmail()
  password: string;  // @IsString(), @MinLength(6)
}
```

### UpdateUserDto
```typescript
{
  name?: string;     // @IsString(), @MinLength(2), @IsOptional()
  email?: string;    // @IsEmail(), @IsOptional()
  password?: string; // @IsString(), @MinLength(6), @IsOptional()
}
```

### UserResponseDto
```typescript
{
  id: string;
  name: string;
  email: string;
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

### Global Pipes e Filters
```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({ 
  whitelist: true, 
  transform: true 
}));
app.useGlobalFilters(new AllExceptionsFilter());
app.useGlobalInterceptors(new ResponseInterceptor());
```

## 🚀 Próximos Passos

- [x] **Implementar soft delete** ✨
- [ ] Implementar autenticação JWT
- [ ] Adicionar testes unitários e E2E
- [ ] Implementar paginação
- [ ] Adicionar filtros e ordenação
- [ ] Adicionar rate limiting
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
