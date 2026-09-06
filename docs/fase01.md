# Atualizações para a especificação - Fase 01 / 6º período

Texto de apoio para incorporar ao documento completo. Revisar após o merge do colega antes de gerar o PDF. O documento antigo registra outra versão e não comprova funcionalidades nesta base.

## Parte 00 - Histórico

Versão proposta 2.0; 6º período; Fase 01; 06/09/2026. Início do backend modular com cadastro, autenticação, perfil e atividades em PostgreSQL. Atualização das regras, requisitos, modelagem, arquitetura e planejamento. Segunda frente ainda pendente.

## Parte 02 - Planejamento

A nova base começou apenas com pastas e configurações. A frente A implementa HTTP, persistência, usuários e atividades; as interfaces descritas no 5º período não foram transferidas. Objetivos: consolidar serviços e regras, isolamento dos dados, integrar módulos em branches e demonstrar persistência real.

| Prazo | Trabalho | Estado |
| --- | --- | --- |
| 06/09/2026 | Base, usuários, atividades e contratos | Frente A implementada; ver resultados de testes |
| Até 07/09/2026 | Frente B prioritária, merge, testes e revisão do PDF | Pendente, depende do colega |
| 07/09/2026 23:59 | Envio no Moodle | Pendente |
| Após Fase 01 | Completar módulos e integrar frontend | Planejado; confirmar próximas datas no AVA |

## Parte 13 - Regras de negócio

| ID | Implementação |
| --- | --- |
| RNE-001 | Cadastro valida nome, e-mail e senha |
| RNE-002 | E-mail normalizado e UNIQUE no PostgreSQL; conflito 409 |
| RNE-003 | Atividade recebe titular da sessão; FK e filtro no SQL |
| RNE-004 | Recomendações pelo perfil pendentes na frente B |
| RNE-005 | Sessão obrigatória nos endpoints internos; cadastro/login e health/ready públicos |

Decisões de implementação: senha 8–128 caracteres, sessão de 24 horas, plano inicial Free, métricas compatíveis com o tipo e data não futura. Limites de métricas são técnicos, não orientações médicas.

## Parte 14 - Requisitos funcionais

Adota-se a tabela RF-001 a RF-008 da seção 14. A numeração RF01 a RF10 das telas antigas tem outros significados; deve ser corrigida ao revisar o documento. RF-007 recebe o título Acompanhamento do Progresso, conforme seu detalhamento.

| ID | Requisito | Estado da frente A |
| --- | --- | --- |
| RF-001 | Cadastro | Implementado no backend |
| RF-002 | Autenticação | Implementado, incluindo logout |
| RF-003 | Perfil de saúde | Implementado: idade, peso, altura, objetivos textuais e condições médicas |
| RF-004 | Atividades | Implementado: exercício, água, refeição, hábito |
| RF-005 | Recomendações | Pendente, frente B |
| RF-006 | Lembretes/notificações | Pendente, frente B |
| RF-007 | Progresso | Parcial: histórico disponível; agregações/metas pendentes |
| RF-008 | Conteúdo educativo | Pendente, frente B |

Implementado no backend não significa interface ou integração concluída. Não transferir status antigos automaticamente.

## Parte 18 - Dados e modelagem

Migration 001 cria users (UUID, nome, e-mail único, password_hash, plano, perfil e timestamps), sessions (token_hash, user_id, expires_at) e activities (UUID, user_id, tipo, descrição, instante e métricas). Relações users 1:N sessions e users 1:N activities com FK e ON DELETE CASCADE. Não há endpoint de exclusão de conta. Schema_migrations armazena versão, checksum e data de aplicação.

Datas usam timestamptz; peso/altura numeric; métricas inteiras e CHECK constraints asseguram limites e compatibilidade de tipo. Índice por usuário e instante atende histórico. SQL parametrizado evita concatenação de entradas. Senhas usam scrypt e tokens persistem somente como digest. Tabelas dos módulos da frente B ainda não existem.

## Parte 20 - Arquitetura

Cliente-servidor, API REST e monólito modular: routes → controllers → services → repositories → PostgreSQL. Validators conferem entrada; models representam respostas; middlewares centralizam autenticação e erros. Frontend previsto React/Vite/TypeScript não acessa banco diretamente. Não há Base44, Supabase ou microserviços na nova base.

## Parte 21 - Tecnologias

Node.js 22.13+, Express 5, JavaScript ESM, PostgreSQL 17, pg, crypto do Node (scrypt, randomBytes, SHA-256), node:test, npm workspaces, Docker Compose e Git/GitHub. Dependências exatas constam no lockfile. Frontend React/Vite/TypeScript apenas preparado.

## Parte 22.2 - Implementação backend

server.js carrega configuração e inicia app.js com pool de conexões. Users implementa cadastro validado com hash scrypt e e-mail único, login com token aleatório de 32 bytes, sessão com expiração, logout revogável e atualização de perfil. O middleware fornece a identidade autenticada e impede acesso sem sessão válida.

Activities implementa criação, listagem paginada, consulta e exclusão. Identidade vem da sessão; toda consulta pessoal filtra pelo titular. O serviço retorna 404 para registro ausente ou alheio. O banco garante integridade com FK, UNIQUE e CHECK. Migrations transacionais usam lock e checksum; erros HTTP são padronizados sem revelar SQL ou credenciais.

Os módulos do colega usam ponto de integração registerModules para preservar a separação por domínio. A implementação atual não inclui frontend, notificações efetivas, cobrança Premium ou recomendações. Limitação de tentativas de login, recuperação/verificação de conta e HTTPS do ambiente publicado são evoluções pendentes; demonstração atual é local.

## Evidência de testes - 06/09/2026

Executado `npm test` com TEST_DATABASE_URL em PostgreSQL 17 real, container temporário isolado: 4 testes aprovados, 0 falhas, 0 ignorados. A integração HTTP verificou migrations reaplicáveis, cadastro, duplicidade de e-mail, senha incorreta, perfil, bloqueio de promoção de plano, gravação no banco, listagem, isolamento entre duas contas, exclusão, logout e expiração de sessão. Testes adicionais cobriram validação de dados e salt/verificação de senha. A primeira tentativa de integração foi impedida por porta reservada do Windows; após trocar a porta, a suíte completa passou. `git diff --check` também passou. Não foram testados módulos da frente B ou interface.

## Antes do envio

Incorporar os textos nas seções do documento completo; atualizar repositório e organização do código; preservar conteúdo histórico identificando o período; remover orientações ainda presentes, inclusive nas páginas 5–8; corrigir sumário e numeração; revisar estados após merge; gerar e inspecionar PDF. Não registrar testes ou módulos como concluídos sem evidência. Este Markdown não substitui o PDF exigido pelo Moodle.
