# Tarefa para o colega - Frente B

## Divisão

Frente A (Luan): API, banco/migrations, autenticação, perfil e atividades. Branch `feat/fase01-base-usuarios-atividades`.

Frente B: lembretes, progresso, conteúdos e recomendações. Priorize lembretes e progresso para esta entrega; os demais podem permanecer pendentes com status correto. Não implemente interface nesta fase.

## Começar

```sh
git fetch origin
git switch -c feat/fase01-lembretes-progresso-conteudos origin/feat/fase01-base-usuarios-atividades
```

Use a nossa base para herdar autenticação e schema. Trabalhe em `backend/src/modules/{reminders,progress,content,recommendations}/`, `backend/test/frente-b.*.test.js`, `docs/frente-b.md` e migrations `002_*.sql` em diante. Não altere migration 001, users, activities ou dependências sem coordenar.

Exporte `registerModules(app,{pool,authenticate})` de `backend/src/modules/register-extra.js`. No merge, Luan importa a função em server.js e passa para `createApp({pool,registerModules})`; ela é chamada antes do 404. Registre routers protegidos usando authenticate. Identidade disponível em `req.auth.user.id`, plano em `req.auth.user.plan`.

## Entregas

1. **Lembretes, RF-006:** POST/GET /api/reminders e PATCH/DELETE /api/reminders/:id. Migration com UUID, user_id FK users, title 1–120, time HH:mm, weekdays (inteiros únicos 0–6, domingo=0, pelo menos um), timezone IANA (padrão America/Sao_Paulo), active boolean e timestamps. Validar dia/hora/fuso e sempre filtrar usuário. Persistir agendamento não significa enviar notificação: envio efetivo fica pendente se não houver executor.
2. **Progresso, RF-007:** GET /api/progress?from=YYYY-MM-DD&to=YYYY-MM-DD, intervalo inclusivo válido até 366 dias, agrupamento diário America/Sao_Paulo. Consultar activities da frente A por user_id e somar water_ml, steps, duration_minutes e calories de exercício. Não duplicar histórico em outra tabela. GET/PUT /api/progress/goals com metas opcionais positivas de passos, água e minutos; progress_goals com user_id único FK e updated_at. Não prescrever metas automaticamente.
3. **Conteúdo, RF-008:** tabela contents, título, categoria, tipo article/video, texto ou URL HTTPS, dificuldade opcional, is_premium e created_at. GET /api/content com filtros/paginação e GET /api/content/:id. Plano verificado no servidor; usuário Free não recebe texto/URL Premium, mesmo se listagem permitir metadados com locked. Sem endpoint público de promoção de plano ou criação de conteúdo. Seed deve ser identificado como demonstração.
4. **Recomendações, RF-005/RNE-004:** GET /api/recommendations usa perfil do titular e regras determinísticas documentadas. Explicar quais campos motivaram cada sugestão. Perfil insuficiente pede preenchimento; não apresentar personalização fictícia, prescrição clínica ou tratamento de condições médicas. Manter pendente se não houver regras verificáveis.

## Contratos e aceite

Seguir docs/api.md, arquitetura em camadas, SQL parametrizado, AppError e validações compartilhadas. Toda tabela pessoal usa FK users(id). Nunca aceitar userId do cliente. Não retornar hash de senha/token. Usar métricas e nomes definidos em migration 001. Testar persistência, entradas inválidas, acesso cruzado, agregação por data/fuso e metas. Documentar endpoints, tabelas, resultados reais dos testes e pendências em docs/frente-b.md.

## Merge

Colega publica a branch e informa commit/testes. Luan faz merge na branch A, conecta register-extra.js, aplica migrations e executa testes com PostgreSQL. Não usar force push nem sobrescrever main. Atualizar status acadêmicos somente após testar a integração. Gerar/revisar PDF completo, remover orientações e enviar por um integrante no Moodle até 07/09/2026 23:59. Publicar código não envia o trabalho no Moodle.
