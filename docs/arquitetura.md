# Divisão de responsabilidades

Arquitetura prevista: cliente-servidor + API REST + monólito modular em camadas. Uma única aplicação backend implantável, organizada por domínio. Nesta entrega nenhuma camada possui implementação.

Fluxo futuro: frontend → HTTP/JSON → routes → controllers → services → repositories → PostgreSQL.

| Pasta | Responsabilidade futura |
| --- | --- |
| routes | Mapear endpoints e aplicar middlewares; sem SQL ou regras de negócio |
| controllers | Adaptar HTTP e chamar services; sem acessar o banco diretamente |
| services | Executar casos de uso e regras de negócio sem depender de req/res |
| repositories | Concentrar SQL e persistência do módulo |
| validators | Validar formato, tipos e campos de entrada |
| models | Representar dados e invariantes de domínio; não implica ORM |
| middlewares | Autenticação, validação compartilhada e tratamento de erros |
| database/connection | Centralizar conexão PostgreSQL |
| database/migrations | Versionar mudanças do schema quando forem implementadas |
| config | Configurações da aplicação |
| shared | Utilitários compartilhados quando existir necessidade real |

| Módulo | Escopo reservado |
| --- | --- |
| users | Cadastro, perfil, identidade e planos Free/Premium |
| activities | Atividades vinculadas ao usuário |
| content | Vídeos, treinos e filtros; confirmar necessidade do backend |
| reminders | Lembretes e agendamento por dias e horários |
| progress | Histórico de métricas, progresso e metas |
| recommendations | Recomendações baseadas no perfil |

Autenticação, ORM e executor de migrations não foram escolhidos. Não há microserviços, arquitetura hexagonal, API Gateway, filas, Redis, Base44 ou Supabase configurados. As regras RNE-001 a RNE-005 e os requisitos funcionais do documento permanecem pendentes.

As pastas vazias foram reservadas porque o pedido atual é preparar a divisão de diretórios antes de escrever código. Os pontos de entrada app.js e server.js serão criados depois, em backend/src/. O frontend acessará exclusivamente a API, nunca o banco diretamente.
