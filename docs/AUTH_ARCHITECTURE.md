# Estrutura de Autenticação JWT

## 📁 Estrutura Organizada por Camadas

A implementação de autenticação JWT foi organizada seguindo os princípios de Clean Architecture, com separação clara de responsabilidades em cada camada:

```
src/
├── domain/                          # Camada de Domínio (Regras de Negócio)
│   ├── auth/                        # 🔐 Módulo de Autenticação
│   │   ├── auth.repository.interface.ts
│   │   ├── jwt.interface.ts
│   │   └── index.ts
│   └── user/
│       ├── user.entity.ts          # Inclui UserRole enum
│       └── user.constants.ts
│
├── application/                     # Camada de Aplicação (Casos de Uso)
│   ├── auth/                        # 🔐 Serviços e DTOs de Auth
│   │   ├── auth.service.ts
│   │   ├── login.dto.ts
│   │   ├── auth-response.dto.ts
│   │   └── index.ts
│   └── services/
│       └── user.service.ts
│
├── infrastructure/                  # Camada de Infraestrutura (Implementações)
│   ├── auth/                        # 🔐 Estratégias e Guards
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── index.ts
│   ├── database/
│   │   └── prisma.service.ts
│   └── repositories/
│       └── user.repository.ts
│
└── presentation/                    # Camada de Apresentação (Controllers/HTTP)
    ├── auth/                        # 🔐 Controllers e Decorators
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── roles.decorator.ts
    │   ├── public.decorator.ts
    │   ├── current-user.decorator.ts
    │   └── index.ts
    └── user/
        ├── user.controller.ts
        └── user.module.ts
```

## 🎯 Responsabilidades por Camada

### Domain Layer (Domínio)
**Localização:** `src/domain/auth/`

- **auth.repository.interface.ts**: Interface do repositório de autenticação
- **jwt.interface.ts**: Interfaces de tipos JWT (`IJwtPayload`, `IAuthenticatedUser`)
- **Princípio**: Não depende de nenhuma outra camada

### Application Layer (Aplicação)
**Localização:** `src/application/auth/`

- **auth.service.ts**: Lógica de negócio de autenticação
  - `login()`: Autentica usuário e gera token
  - `validateCredentials()`: Valida email/senha
  - `validateUser()`: Valida payload JWT
- **login.dto.ts**: DTO de entrada para login
- **auth-response.dto.ts**: DTO de resposta com token e dados do usuário
- **Princípio**: Depende apenas da camada de domínio

### Infrastructure Layer (Infraestrutura)
**Localização:** `src/infrastructure/auth/`

- **jwt.strategy.ts**: Estratégia Passport JWT
  - Valida token JWT automaticamente
  - Injeta usuário autenticado na request
- **jwt-auth.guard.ts**: Guard global de autenticação
  - Protege rotas automaticamente
  - Permite bypass com decorator `@Public()`
- **roles.guard.ts**: Guard de autorização baseada em roles
  - Verifica permissões do usuário
  - Usado com decorator `@Roles()`
- **Princípio**: Implementa interfaces do domínio

### Presentation Layer (Apresentação)
**Localização:** `src/presentation/auth/`

- **auth.controller.ts**: Endpoint de autenticação
  - `POST /auth/login`: Endpoint de login
- **auth.module.ts**: Módulo NestJS de autenticação
  - Configura JWT e Passport
  - Registra providers e exports
- **Decorators**:
  - `@Public()`: Marca rota como pública (sem autenticação)
  - `@Roles(...)`: Restringe acesso por role
  - `@CurrentUser()`: Injeta usuário autenticado em parâmetros
- **Princípio**: Depende das camadas de aplicação e infraestrutura

## 🔑 Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌─────────────────────┐
│  AuthController     │ (Presentation)
│  @Public()          │
└──────┬──────────────┘
       │
       │ 2. Chama login()
       ▼
┌─────────────────────┐
│  AuthService        │ (Application)
│  - validateCredentials()
│  - Gera JWT token   │
└──────┬──────────────┘
       │
       │ 3. Valida com bcrypt
       ▼
┌─────────────────────┐
│  UserRepository     │ (Infrastructure)
│  findByEmail()      │
└──────┬──────────────┘
       │
       │ 4. Retorna usuário
       ▼
┌─────────────────────┐
│  AuthService        │
│  Assina JWT         │
└──────┬──────────────┘
       │
       │ 5. Retorna token + user
       ▼
┌─────────────────────┐
│  Cliente            │
│  Armazena token     │
└─────────────────────┘
```

## 🛡️ Fluxo de Autorização (Request Protegida)

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ 1. GET /api/users
       │    Authorization: Bearer <token>
       ▼
┌─────────────────────┐
│  JwtAuthGuard       │ (Global Guard)
│  - Extrai token     │
│  - Verifica @Public │
└──────┬──────────────┘
       │
       │ 2. Token válido?
       ▼
┌─────────────────────┐
│  JwtStrategy        │ (Infrastructure)
│  - Decodifica token │
│  - Valida usuário   │
└──────┬──────────────┘
       │
       │ 3. Injeta user na request
       ▼
┌─────────────────────┐
│  RolesGuard         │ (Verificação de Roles)
│  - Verifica @Roles  │
│  - Compara com      │
│    user.role        │
└──────┬──────────────┘
       │
       │ 4. Autorizado?
       ▼
┌─────────────────────┐
│  UserController     │
│  Executa ação       │
└─────────────────────┘
```

## 🎭 Sistema de Roles

### Enum de Roles
```typescript
export enum UserRole {
  ADMIN = 'ADMIN',         // Acesso total
  MODERATOR = 'MODERATOR', // Acesso moderado
  USER = 'USER',           // Acesso básico
}
```

### Proteção de Rotas por Role

```typescript
@Controller('api/users')
@UseGuards(RolesGuard)
export class UserController {
  
  @Public()  // ✅ Qualquer pessoa pode criar conta
  @Post()
  create(@Body() dto: CreateUserDto) { ... }
  
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)  // 🔒 Apenas Admin/Moderator
  @Get()
  findAll() { ... }
  
  @Get(':id')  // 🔐 Apenas autenticado
  findById(@Param('id') id: string) { ... }
  
  @Roles(UserRole.ADMIN)  // 🔒 Apenas Admin
  @Delete(':id/hard')
  hardDelete(@Param('id') id: string) { ... }
}
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
```

### AuthModule (Configuração JWT)
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  signOptions: {
    expiresIn: '24h',
  },
})
```

### AppModule (Guard Global)
```typescript
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,  // Todas as rotas protegidas por padrão
}
```

## 📝 Uso dos Decorators

### @Public()
Marca uma rota como pública (sem necessidade de autenticação):
```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### @Roles()
Restringe acesso por roles:
```typescript
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Get()
async findAll() {
  return this.userService.findAll();
}
```

### @CurrentUser()
Injeta dados do usuário autenticado:
```typescript
@Get('profile')
async getProfile(@CurrentUser() user: IAuthenticatedUser) {
  return user;
}

// Ou apenas um campo específico:
@Get('my-data')
async getMyData(@CurrentUser('userId') userId: string) {
  return this.service.findById(userId);
}
```

## 🧪 Testando a API

### 1. Criar usuário (público)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Resposta:
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2025-10-28T...",
      "updatedAt": "2025-10-28T..."
    }
  }
}
```

### 3. Acessar rota protegida
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📊 Swagger UI

Acesse: **http://localhost:3000/api**

- Use o botão **"Authorize"** no topo
- Cole o token JWT
- Teste os endpoints protegidos

## ✅ Benefícios da Estrutura

1. **Separação de Responsabilidades**: Cada camada tem um propósito claro
2. **Reutilizabilidade**: Barril exports (`index.ts`) facilitam imports
3. **Manutenibilidade**: Fácil localizar e modificar código relacionado
4. **Testabilidade**: Camadas isoladas facilitam testes unitários
5. **Escalabilidade**: Fácil adicionar novos recursos de auth
6. **Clean Code**: Código elegante, claro e bem organizado
7. **SOLID**: Princípios de design seguidos rigorosamente

## 🎨 Padrões Aplicados

- **Dependency Injection**: Services injetados via constructor
- **Repository Pattern**: Abstração de acesso a dados
- **Strategy Pattern**: Passport JWT Strategy
- **Decorator Pattern**: Custom decorators (@Public, @Roles, @CurrentUser)
- **Guard Pattern**: JwtAuthGuard e RolesGuard
- **DTO Pattern**: Validação e transformação de dados
