# Dark API

API para "Dark Cloud Games" — exemplo demonstrando arquitetura em camadas com NestJS, TypeORM e padrão de tratamento de erros.

## Visão geral da arquitetura

Estrutura em camadas:
- presentation: controllers, filtros globais (ex.: AllExceptionsFilter), validação global.
- application: serviços (UserService), DTOs, mappers.
- domain: entidades de domínio, interfaces (IUserRepository), constantes (USER_REPOSITORY).
- infrastructure: implementação do repositório (TypeORM UserRepository), entidades de persistence.

Dependências principais:
- NestJS (framework)
- TypeORM (ORM)
- class-transformer / class-validator (DTOs e transformação)
- @nestjs/swagger (documentação)
- bcryptjs (hash de senhas)
- uuid (identificadores)

Principais conceitos:
- Injeção de dependência via token USER_REPOSITORY para desacoplar implementação do repositório.
- Global ValidationPipe (whitelist + transform) aplicado em main.ts.
- Filtro global AllExceptionsFilter para padronizar o envelope de erro:
  {
    statusCode: number,
    error: {
      message: string | null,
      details: any | null,
      code: string | null
    },
    timestamp: ISOString,
    path: string
  }

## Endpoints (Users)

Base: /api/users

- POST /api/users
  - Cria um usuário.
  - Request body (JSON):
    {
      "name": "João Silva",
      "email": "joao@example.com",
      "password": "senha123"
    }
  - Success (201):
    {
      "id": "uuid-v4",
      "name": "João Silva",
      "email": "joao@example.com",
      "createdAt": "2025-10-28T12:34:56.789Z",
      "updatedAt": "2025-10-28T12:34:56.789Z"
    }
  - Error: email já em uso (409)
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
  - Validation error (400) — exemplo (senha ausente):
    {
      "statusCode": 400,
      "error": {
        "message": "name must be a string",
        "details": [
          "name must be a string",
          "password must be longer than or equal to 6 characters"
        ],
        "code": null
      },
      "timestamp": "2025-10-28T12:34:56.789Z",
      "path": "/api/users"
    }

- GET /api/users
  - Lista usuários.
  - Success (200):
    [
      {
        "id": "uuid-v4",
        "name": "João Silva",
        "email": "joao@example.com",
        "createdAt": "...",
        "updatedAt": "..."
      },
      ...
    ]

- GET /api/users/:id
  - Busca por id.
  - Success (200): objeto user (mesmo formato do POST).
  - Not found (404):
    {
      "statusCode": 404,
      "error": {
        "message": "User not found",
        "details": null,
        "code": null
      },
      "timestamp": "...",
      "path": "/api/users/<id>"
    }

- PUT /api/users/:id
  - Atualiza usuário.
  - Request body (parcial):
    {
      "name": "João M.",
      "email": "novo@example.com",
      "password": "novaSenha123"
    }
  - Success (200): usuário atualizado (mesmo formato do POST).
  - Conflicting email (409) e Not found (404) usam envelope de erro padronizado.

- DELETE /api/users/:id
  - Remove usuário.
  - Success (204) — No Content.
  - Not found (404) retorna envelope de erro padronizado.

Observações sobre delete:
- Serviço chama repo.delete(id) ou repo.remove(entity) ou repo.softDelete(id) (fallbacks). Caso a implementação do repositório não exponha esses métodos, a aplicação lança um erro para ser tratado em desenvolvimento.

## DTOs e Validação
- DTOs definem validações com class-validator (ex.: @IsEmail, @IsString, @MinLength).
- ValidationPipe global remove propriedades não declaradas (whitelist) e transforma tipos.

## Segurança e Senhas
- Senhas são sempre armazenadas como hash via bcryptjs (saltRounds = 10 no serviço).

## Swagger / Documentação interativa
Ao rodar a aplicação, o Swagger UI fica disponível em:
- http://localhost:3000/api

## Como rodar
1. Instalar dependências:
   npm install
2. Configurar base de dados (TypeORM) conforme env/config do projeto.
3. Rodar:
   npm run start
4. Testar via curl ou Postman. Exemplos:
   - Criar:
     curl -i -X POST http://localhost:3000/api/users \
       -H "Content-Type: application/json" \
       -d '{"name":"João","email":"joao@example.com","password":"senha123"}'
   - Atualizar:
     curl -i -X PUT http://localhost:3000/api/users/<id> \
       -H "Content-Type: application/json" \
       -d '{"name":"João Atualizado"}'
   - Deletar:
     curl -i -X DELETE http://localhost:3000/api/users/<id>

## Tratamento de erros (exemplos)
- Erro de validação (400): envelope padronizado com detalhes (array) e mensagem principal.
- Recurso não encontrado (404): envelope padronizado com mensagem.
- Conflito (409): envelope padronizado com mensagem (ex.: email já em uso).
- Erro inesperado (500): envelope padronizado com message (stack não exposta).

## Observações finais
- O projeto usa mappers (ex.: toResponse) para evitar expor campos sensíveis (password).
- Para adicionar novos repositórios, registrar via token e provider no módulo correspondente.
- Qualquer dúvida sobre o fluxo (controller -> service -> repository) ou sobre o envelope de erros, abra uma issue/documentação adicional neste README.
