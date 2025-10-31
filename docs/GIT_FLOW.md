# Git Flow - Padrão de Branches

Este projeto segue o **Git Flow** com automação de Pull Requests.

## 📋 Estrutura de Branches

### Branches Principais

- **`main`** - Produção
  - Código estável em produção
  - Deploy automático para produção
  - Protegida contra push direto
  
- **`develop`** - Desenvolvimento
  - Código estável em desenvolvimento
  - Deploy automático para staging
  - Integração de features

### Branches de Trabalho

Todas as branches de trabalho devem seguir o padrão:

#### ✨ Features (Novas funcionalidades)
```
feature/<nome-da-funcionalidade>
```
**Exemplos:**
- `feature/user-authentication`
- `feature/payment-integration`
- `feature/admin-dashboard`

**Quando usar:** Para desenvolver novas funcionalidades

---

#### 🐛 Bugfixes (Correção de bugs)
```
bugfix/<descricao-do-bug>
```
**Exemplos:**
- `bugfix/fix-login-error`
- `bugfix/correct-email-validation`
- `bugfix/resolve-database-timeout`

**Quando usar:** Para corrigir bugs encontrados em desenvolvimento

---

#### 🚑 Hotfixes (Correções urgentes)
```
hotfix/<descricao-urgente>
```
**Exemplos:**
- `hotfix/critical-security-patch`
- `hotfix/fix-payment-failure`
- `hotfix/restore-user-access`

**Quando usar:** Para correções urgentes em produção

---

## 🔄 Fluxo de Trabalho Automatizado

### 1️⃣ Criar uma nova branch
```bash
# Feature
git checkout -b feature/minha-funcionalidade

# Bugfix
git checkout -b bugfix/corrigir-erro

# Hotfix
git checkout -b hotfix/correcao-urgente
```

### 2️⃣ Desenvolver e commitar
```bash
git add .
git commit -m "feat: adiciona autenticação de usuário"
git push origin feature/minha-funcionalidade
```

### 3️⃣ CI/CD Automático

Após o push:

1. **CI Pipeline** executa automaticamente:
   - ✅ Lint
   - ✅ Unit Tests
   - ✅ E2E Tests
   - ✅ Build

2. **Auto PR** é criado automaticamente se CI passar:
   - 🤖 Pull Request para `develop`
   - 📋 Descrição automática
   - 🏷️ Labels apropriadas
   - ✅ Pronto para review

### 4️⃣ Code Review e Merge

1. Revisar o PR criado automaticamente
2. Aprovar as mudanças
3. Fazer merge para `develop`

### 5️⃣ Deploy Staging Automático

Após merge em `develop`:

1. **CD - Develop** executa:
   - ✅ Build
   - ✅ Migrations
   - ✅ Deploy para Staging

2. **Auto PR para Production** é criado:
   - 🚀 Pull Request `develop` → `main`
   - 📊 Release notes automáticas
   - 🎯 Pronto para deploy em produção

### 6️⃣ Deploy Production

1. Revisar PR de release
2. Aprovar para produção
3. Merge para `main`
4. Deploy automático em produção

---

## 🎯 Resumo do Fluxo

```
feature/nova-funcionalidade
        ↓
    (push + CI)
        ↓
   Auto PR → develop
        ↓
   (code review)
        ↓
    Merge to develop
        ↓
  Deploy to Staging
        ↓
   Auto PR → main
        ↓
   (final review)
        ↓
    Merge to main
        ↓
  Deploy to Production 🚀
```

---

## ⚠️ Regras Importantes

### ✅ Permitido
- Criar branches com padrões: `feature/*`, `bugfix/*`, `hotfix/*`
- Push em branches de trabalho
- Merge via Pull Request

### ❌ Não Permitido
- Push direto em `main`
- Push direto em `develop`
- Branches sem padrão (ex: `teste`, `minha-branch`)

---

## 🛠️ Comandos Úteis

### Criar nova feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/minha-feature
```

### Atualizar branch com develop
```bash
git checkout develop
git pull origin develop
git checkout feature/minha-feature
git merge develop
```

### Deletar branch após merge
```bash
git branch -d feature/minha-feature
git push origin --delete feature/minha-feature
```

---

## 📚 Convenções de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` manutenção

**Exemplos:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login timeout issue"
git commit -m "docs: update API documentation"
```

---

## 🔍 Validação Automática

O projeto possui um workflow que valida automaticamente o nome das branches:

- ✅ Aceita: `feature/*`, `bugfix/*`, `hotfix/*`, `develop`, `main`
- ❌ Rejeita: Qualquer outro padrão

Se você criar uma branch com nome inválido, o CI falhará com instruções.

---

## 📞 Suporte

Dúvidas sobre o Git Flow? Consulte a equipe ou abra uma issue!
