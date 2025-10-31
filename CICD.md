# 🚀 CI/CD Pipeline - NestJS API

![CI](https://github.com/edcamargo/api.nestjs/workflows/CI/badge.svg)
![CD Develop](https://github.com/edcamargo/api.nestjs/workflows/CD%20-%20Develop/badge.svg)
![CD Production](https://github.com/edcamargo/api.nestjs/workflows/CD%20-%20Production/badge.svg)

## 📋 Workflows Configurados

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)
Executa automaticamente em **Pull Requests** e **Pushes** para `develop` e `main`:

```yaml
Triggers:
  - pull_request (develop, main)
  - push (develop, main)

Jobs:
  ✅ Lint → ESLint + Prettier
  ✅ Unit Tests → 83 testes unitários
  ✅ E2E Tests → 91 testes end-to-end (com PostgreSQL)
  ✅ Build → Compilação da aplicação
  ✅ Quality Gate → Verificação final
```

### 2. **CD - Develop** (`.github/workflows/cd-develop.yml`)
Deploy automático para **Staging** quando há push na branch `develop`:

```yaml
Trigger:
  - push (develop)

Steps:
  📦 Build da aplicação
  🗄️ Database migrations
  🐳 Docker build & push (tag: staging)
  🚀 Deploy para staging
```

### 3. **CD - Production** (`.github/workflows/cd-main.yml`)
Deploy automático para **Produção** quando há push na branch `main`:

```yaml
Trigger:
  - push (main)

Steps:
  📦 Build da aplicação
  🗄️ Database migrations
  🐳 Docker build & push (tags: latest, versioned)
  🏷️ GitHub Release automático
  🚀 Deploy para production
```

---

## 🔐 Secrets Necessários no GitHub

Configure os seguintes **Secrets** no GitHub (`Settings > Secrets and variables > Actions`):

### Docker Hub
```bash
DOCKER_USERNAME=seu-usuario-dockerhub
DOCKER_TOKEN=seu-token-dockerhub
```

### Database URLs
```bash
STAGING_DATABASE_URL=postgresql://user:pass@host:5432/db_staging
PRODUCTION_DATABASE_URL=postgresql://user:pass@host:5432/db_production
```

### Notificações (Opcional)
```bash
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### AWS (Se usar ECS/ECR)
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

---

## 🌍 Environments do GitHub

Configure os **Environments** em `Settings > Environments`:

### 1. Staging
- **URL**: https://staging.api.edcamargo.dev
- **Protection rules**: Nenhuma (deploy automático)
- **Secrets**: `STAGING_DATABASE_URL`

### 2. Production
- **URL**: https://api.edcamargo.dev
- **Protection rules**: ✅ Require reviewers (recomendado)
- **Secrets**: `PRODUCTION_DATABASE_URL`

---

## 📝 Fluxo de Trabalho Recomendado

### ⚠️ REGRA OBRIGATÓRIA: Branch Protection

**A branch `main` NÃO aceita commits diretos!**

**Fluxo obrigatório:**
```
feature-branch → (PR) → develop → (PR + Review) → main → Production
```

- ✅ **SEMPRE** fazer PR para `develop` primeiro
- ✅ **NUNCA** fazer commit direto em `main`
- ✅ Deploy para produção **SOMENTE** via PR de `develop` → `main`
- ✅ Code review obrigatório para merge em `main`

### Feature Development

```bash
# 1. Criar feature branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade

# 2. Fazer alterações e commits
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 3. Push e criar PR para develop
git push origin feature/nova-funcionalidade
```

**No GitHub:**
- Criar Pull Request: `feature/nova-funcionalidade` → `develop`
- CI roda automaticamente:
  - ✅ Lint
  - ✅ Unit Tests (83 testes)
  - ✅ E2E Tests (91 testes)
  - ✅ Build
- Após aprovação e merge → **Deploy automático para Staging**

### Release para Produção

⚠️ **Atenção**: `main` só recebe código via Pull Request!

```bash
# 1. Garantir que develop está atualizado
git checkout develop
git pull origin develop

# 2. No GitHub, criar Pull Request: develop → main
#    - Code review OBRIGATÓRIO
#    - CI deve passar (testes + build)
#    - Aprovação de reviewers necessária

# 3. Após aprovação e merge em main:
#    ✅ CD roda automaticamente
#    ✅ Deploy para Production
#    ✅ GitHub Release criada (tag: YYYY.MM.DD-run_number)
#    ✅ Docker tags: latest, SHA, versioned
```

**⛔ NUNCA faça:**
```bash
# ❌ ERRADO - Commit direto em main
git checkout main
git commit -m "alguma coisa"
git push origin main  # ❌ Será rejeitado por branch protection!
```

---

## 🐳 Docker

### Build Local
```bash
docker build -t nestjs-api:latest .
```

### Run Local
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=your-secret \
  -e NODE_ENV=production \
  nestjs-api:latest
```

### Docker Compose (Desenvolvimento)
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar serviços
docker-compose down

# Reconstruir
docker-compose up --build
```

**Serviços disponíveis:**
- API: http://localhost:3000
- PostgreSQL: localhost:5432
- PgAdmin: http://localhost:5050

---

## 🧪 Testes

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:cov
```

### Watch Mode
```bash
npm run test:watch
```

---

## 📊 Status dos Testes

### Unit Tests
- **Total**: 83 testes
- **Coverage**: Controllers, Services, Mappers
- **Duração**: ~1s

### E2E Tests
- **Total**: 91 testes
- **Coverage**: 6 módulos (Auth, User, Role, EnvironmentPermission, RoleAssignment, Health)
- **Duração**: ~1.7s

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run start:dev          # Inicia em modo watch
npm run lint               # Roda ESLint
npm run format             # Formata código
npm run format:check       # Verifica formatação
```

### Prisma
```bash
npm run prisma:generate    # Gera Prisma Client
npm run prisma:migrate     # Cria migration
npm run prisma:studio      # Abre Prisma Studio
npx prisma db seed         # Popula banco de dados
```

### Build
```bash
npm run build              # Build para produção
npm run start:prod         # Inicia versão de produção
```

---

## 📦 Estrutura de Deployment

### Staging (Develop Branch)
```
Push to develop
    ↓
GitHub Actions CI
    ↓
✅ All tests pass
    ↓
GitHub Actions CD
    ↓
Build Docker Image (staging tag)
    ↓
Deploy to Staging Environment
```

### Production (Main Branch)
```
Merge PR to main
    ↓
GitHub Actions CI
    ↓
✅ All tests pass
    ↓
GitHub Actions CD
    ↓
Build Docker Image (latest + version tags)
    ↓
Create GitHub Release
    ↓
Deploy to Production Environment
```

---

## 🎯 Próximos Passos

1. ✅ Configurar Secrets no GitHub
2. ✅ Configurar Environments (staging, production)
3. ✅ Criar branch `develop` se não existir
4. ✅ Fazer primeiro PR para testar CI
5. ✅ Configurar servidor de destino para deploy
6. ⚙️ Ajustar deployment conforme infraestrutura (AWS, GCP, Azure, etc.)
7. 📢 Configurar notificações Slack (opcional)

---

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

**Todos os PRs devem passar pelo CI antes de serem merged!**

---

## 📄 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

---

## 👨‍💻 Autor

**Eduardo Camargo**
- GitHub: [@edcamargo](https://github.com/edcamargo)
- Repository: [api.nestjs](https://github.com/edcamargo/api.nestjs)
