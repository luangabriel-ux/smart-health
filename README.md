# Smart Health

Novo projeto do PI organizado conforme a especificação de arquitetura modular, versão 1.0 de setembro de 2026. Esta etapa contém **somente pastas e configuração do ambiente**.

Não há código de aplicação, telas, API, endpoints, autenticação, modelos, SQL, migrations ou testes implementados. Os arquivos `.gitkeep` são marcadores vazios para o Git preservar os diretórios.

## Ambiente previsto

- Node.js 22.13+ e npm 10+.
- Frontend: React + Vite + TypeScript.
- Backend: Node.js + Express, JavaScript ESM.
- Persistência: PostgreSQL 17 e driver pg, sem ORM.
- npm workspaces para frontend e backend, com um único package-lock.json.

O campo `private: true` dos package.json impede publicação acidental no npm; não define a visibilidade do repositório no GitHub.

## Preparação local

Na raiz do projeto:

```powershell
npm.cmd ci
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Copie os exemplos somente se os arquivos .env ainda não existirem. Não sobrescreva configurações locais já ajustadas. As dependências estão declaradas e travadas no lockfile para a implementação futura.

Se quiser preparar o PostgreSQL local, abra o Docker Desktop e execute:

```powershell
npm.cmd run db:up
```

`npm.cmd run db:down` para os containers e preserva o volume de dados. Também é possível usar PostgreSQL instalado separadamente; nesse caso, configure DATABASE_URL em backend/.env. O Compose só configura o banco, sem tabelas de negócio.

As credenciais dos exemplos são apenas de desenvolvimento local. O banco é publicado em 127.0.0.1. Mantenha o .env raiz e DATABASE_URL do backend sincronizados se alterar usuário, senha, banco ou porta. As variáveis POSTGRES_* inicializam somente um volume novo; não alteram a senha de um banco já existente. Nunca exponha DATABASE_URL no frontend.

Não existem comandos dev, start, build ou test nesta etapa, pois ainda não há aplicação. app.js, server.js, index.html e demais arquivos de execução serão criados quando começar a implementação.

## Pastas

```text
smart-health/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── users/
│       │   ├── activities/
│       │   ├── content/
│       │   ├── reminders/
│       │   ├── progress/
│       │   └── recommendations/
│       ├── middlewares/
│       │   ├── authentication/
│       │   ├── validation/
│       │   └── error-handling/
│       ├── database/
│       │   ├── connection/
│       │   └── migrations/
│       ├── config/
│       └── shared/
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── styles/
├── docs/
├── compose.yaml
└── package.json
```

Cada um dos seis módulos possui: `routes/`, `controllers/`, `services/`, `repositories/`, `validators/` e `models/`.

Consulte [a divisão de responsabilidades](docs/arquitetura.md). A nova autenticação e o modelo de dados serão definidos em etapas futuras. O repositório antigo é independente deste projeto e não é necessário para instalá-lo.
