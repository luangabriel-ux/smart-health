# Smart Health

Projeto Integrador, 6º período, Fase 01. Backend modular Node.js 22.13+, Express 5, JavaScript ESM e PostgreSQL 17 com pg, sem ORM.

## Executar localmente

```powershell
npm.cmd ci
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
npm.cmd run db:up
npm.cmd run db:migrate
npm.cmd run dev
```

Copie exemplos somente se os arquivos .env ainda não existirem. É necessário Docker Desktop ativo ou PostgreSQL separado configurado em DATABASE_URL. API: http://127.0.0.1:3000. `npm.cmd start` inicia sem watch; `db:down` preserva dados.

## Implementação

Cadastro, login/logout, perfil e atividades com persistência e isolamento por usuário. Tokens Bearer de 24 horas são revogáveis; somente o digest SHA-256 fica no banco. Senhas usam scrypt com salt. Cadastro cria plano Free, sem promoção de plano pelo cliente.

Frontend, lembretes, progresso agregado, conteúdo e recomendações ainda não estão implementados nesta branch. React/Vite/TypeScript estão reservados para frontend. Base44 e Supabase não são usados.

## Testes

`npm.cmd test` executa a suíte. O teste de integração exige TEST_DATABASE_URL e cria/remove um schema isolado, sem truncar tabelas da aplicação. Sem essa variável, a integração é explicitamente ignorada.

```powershell
$env:TEST_DATABASE_URL='postgresql://smart_health:smart_health_local@127.0.0.1:5432/smart_health'
npm.cmd test
```

Esta versão se destina à demonstração local. Limitação de tentativas de login, recuperação/verificação de conta, limpeza de sessões expiradas e HTTPS do ambiente publicado são evoluções pendentes.

- [Arquitetura](docs/arquitetura.md)
- [Contrato HTTP](docs/api.md)
- [Tarefa do colega e merge](docs/frente-colega.md)
- [Atualizações da especificação acadêmica](docs/fase01.md)
