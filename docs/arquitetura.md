# Arquitetura atual

Cliente-servidor + API REST + monólito modular em camadas. Backend Express/JavaScript ESM, PostgreSQL 17 via pg, sem ORM. Frontend React/Vite/TypeScript ainda reservado.

Fluxo: HTTP/JSON → routes → controllers → services → repositories → PostgreSQL.

| Camada | Responsabilidade |
| --- | --- |
| routes | Endpoints e aplicação de autenticação |
| controllers | Adaptar HTTP, invocar validações e serviços |
| validators | Validar campos, tipos e limites |
| services | Casos de uso, credenciais, sessões e propriedade dos registros |
| repositories | SQL parametrizado e filtro pelo titular |
| models | Representações públicas; sem hash de senha |
| middlewares | Autenticação e erros uniformes |
| database | Pool e migrations transacionais com checksum |
| config/shared | Ambiente e utilitários comuns |

users e activities estão implementados. reminders, progress, content e recommendations pertencem à frente B. Não há microserviços, filas, API Gateway ou serviços Base44/Supabase.

`app.js` compõe módulos e permite `createApp({pool,registerModules})`; `server.js` abre a porta e trata encerramento. Sessões opacas usam tokens aleatórios de 32 bytes; banco armazena digest e expiração. O middleware fornece `req.auth.user` e `req.auth.token`. Dados pessoais são acessados pelo titular da sessão, nunca por userId enviado no corpo.

As migrations numeradas possuem transação, lock para concorrência e checksum. Não alterar SQL já aplicado: criar migration nova. A aplicação não executa migrations automaticamente ao iniciar.
