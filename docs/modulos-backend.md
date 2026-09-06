# Módulos Complementares do Backend Smart Health

## Visão geral

Os módulos complementares do backend foram desenvolvidos sobre a base existente do Smart Health, que já contemplava funcionalidades relacionadas a usuários, autenticação, perfil e registro de atividades.

O objetivo desta implementação foi ampliar as funcionalidades do backend do Smart Health utilizando uma arquitetura modular, com separação clara de responsabilidades e organização do código por domínio.

A estrutura adotada separa as responsabilidades entre:

- routes
- controllers
- services
- repositories
- validators
- models

Os módulos complementares implementados foram:

1. Lembretes
2. Progresso
3. Conteúdos
4. Recomendações

Todos os módulos utilizam autenticação e respeitam o isolamento dos dados do usuário autenticado.

---

# 1. Lembretes

O módulo de Lembretes permite que o usuário autenticado crie e gerencie seus próprios agendamentos.

Nesta fase, o backend é responsável pelo armazenamento e gerenciamento dos lembretes. O envio real de notificações não faz parte do escopo atual.

## Endpoints

### POST /api/reminders

Cria um novo lembrete para o usuário autenticado.

### GET /api/reminders

Lista os lembretes pertencentes ao usuário autenticado.

### PATCH /api/reminders/:id

Atualiza um lembrete pertencente ao usuário autenticado.

### DELETE /api/reminders/:id

Exclui um lembrete pertencente ao usuário autenticado.

## Regras implementadas

- Todos os endpoints exigem autenticação.
- Cada usuário pode acessar somente seus próprios lembretes.
- A identidade do usuário é obtida por meio de `req.auth.user.id`.
- Não é aceito `userId` enviado pelo cliente para determinar a propriedade de um lembrete.
- O horário deve seguir o formato `HH:MM`.
- Os dias da semana são representados por valores inteiros entre 0 e 6.
- Dias repetidos não são permitidos.
- O timezone informado deve ser um fuso IANA válido.
- A exclusão de um lembrete retorna HTTP 204.
- O envio real de notificações permanece fora do escopo desta fase.

---

# 2. Progresso

O módulo de Progresso utiliza os registros já existentes na tabela `activities`.

O histórico de atividades não foi duplicado em uma nova tabela. As informações de progresso são obtidas por meio da agregação dos dados registrados pelo próprio usuário.

## Endpoints

### GET /api/progress?from=YYYY-MM-DD&to=YYYY-MM-DD

Retorna as métricas agregadas diariamente dentro do período informado.

### GET /api/progress/goals

Retorna as metas atualmente cadastradas pelo usuário autenticado.

### PUT /api/progress/goals

Cria ou substitui as metas do usuário autenticado.

## Métricas agregadas

As informações consideradas no acompanhamento do progresso incluem:

- consumo de água;
- quantidade de passos;
- duração das atividades;
- calorias relacionadas a exercícios.

## Regras implementadas

- Somente atividades pertencentes ao usuário autenticado são utilizadas.
- O intervalo de datas é inclusivo.
- Datas inválidas retornam HTTP 400.
- Períodos com a data inicial posterior à data final retornam HTTP 400.
- O período máximo permitido é de 366 dias.
- A agregação diária considera o fuso `America/Sao_Paulo`.
- Calorias são contabilizadas como gasto apenas para atividades do tipo exercício.
- Registros de refeição não são considerados gasto calórico.
- Usuários sem atividades no período recebem uma resposta válida com lista vazia.
- Metas são associadas exclusivamente ao usuário autenticado.
- O sistema apenas armazena as metas informadas pelo usuário, sem definir metas médicas automaticamente.

---

# 3. Conteúdos

O módulo de Conteúdos disponibiliza materiais educativos cadastrados previamente no banco de dados.

Os conteúdos podem ser disponibilizados como artigos ou vídeos.

Nesta fase não foi criado endpoint público para cadastro ou alteração de conteúdos.

## Endpoints

### GET /api/content

Lista os conteúdos disponíveis.

A consulta permite filtros e paginação.

Filtros implementados:

- `category`
- `type`
- `difficulty`
- `limit`
- `offset`

### GET /api/content/:id

Retorna um conteúdo específico por identificador.

## Tipos de conteúdo

Os tipos atualmente suportados são:

### article

Utiliza conteúdo textual armazenado no banco de dados.

### video

Utiliza uma URL HTTPS para acesso ao conteúdo.

## Controle Free e Premium

O módulo implementa diferenciação entre conteúdos gratuitos e Premium.

Conteúdos Premium podem aparecer na listagem para usuários do plano Free, permitindo a visualização de seus metadados.

Entretanto, informações protegidas não são disponibilizadas para essas contas.

Quando um usuário Free acessa um conteúdo Premium:

- `locked` recebe `true`;
- `textContent` recebe `null`;
- `url` recebe `null`.

Usuários Premium recebem o conteúdo completo.

Não existe endpoint público para promover usuários para o plano Premium.

Também não existe endpoint público para cadastro de novos conteúdos nesta fase.

---

# 4. Recomendações

O módulo de Recomendações utiliza informações registradas no perfil do usuário para apresentar sugestões relacionadas ao acompanhamento de seus objetivos.

As recomendações seguem regras determinísticas definidas no backend.

## Endpoint

### GET /api/recommendations

Retorna recomendações baseadas nas informações do perfil do usuário autenticado.

## Informações consideradas

Entre as informações utilizadas estão:

- idade;
- peso;
- altura;
- objetivos de saúde.

## Funcionamento

O backend analisa os objetivos registrados no perfil e seleciona recomendações de acompanhamento relacionadas às informações disponíveis.

Exemplos:

- objetivos relacionados à hidratação podem gerar uma recomendação de acompanhamento da hidratação;
- objetivos relacionados à atividade física podem gerar uma recomendação de acompanhamento das atividades;
- objetivos relacionados à rotina, descanso ou bem-estar podem gerar uma recomendação de acompanhamento da rotina;
- objetivos relacionados ao peso podem gerar uma recomendação de acompanhamento da evolução registrada.

Cada recomendação informa quais informações do perfil contribuíram para sua geração por meio do campo `basedOn`.

Isso torna o comportamento mais transparente e permite identificar a origem de cada recomendação apresentada.

## Perfil incompleto

Caso os dados necessários do perfil ainda não estejam preenchidos, o sistema não tenta gerar recomendações personalizadas com informações incompletas.

Nesse cenário, a resposta informa:

- status `profile_incomplete`;
- campos que ainda precisam ser preenchidos;
- orientação para completar o perfil;
- lista de recomendações vazia.

## Condições médicas

O sistema não utiliza condições médicas para gerar diagnósticos ou prescrições.

O Smart Health não prescreve:

- tratamentos;
- dietas;
- medicamentos;
- exercícios clínicos;
- condutas médicas.

Quando existe uma condição de saúde registrada no perfil, o backend apresenta apenas um aviso informativo, sem gerar prescrição baseada nessa condição.

---

# 5. Banco de dados

A implementação utilizou PostgreSQL como banco de dados relacional.

Novas migrations foram adicionadas sem alterar a migration inicial pertencente à base já existente do projeto.

## Migration 002

A migration `002_reminders_progress.sql` adiciona as estruturas necessárias para:

- lembretes;
- metas de progresso.

Entre as estruturas criadas estão as tabelas:

- `reminders`
- `progress_goals`

## Migration 003

A migration `003_contents.sql` adiciona a estrutura necessária para o módulo de conteúdos.

Tabela criada:

- `contents`

A migration inicial da base existente não foi alterada.

---

# 6. Integração dos módulos

Os módulos complementares são registrados na aplicação por meio do arquivo:

`backend/src/modules/register-extra.js`

Esse arquivo recebe:

- aplicação Express;
- pool de conexão com PostgreSQL;
- middleware de autenticação.

Os módulos são então conectados às seguintes rotas:

- `/api/reminders`
- `/api/progress`
- `/api/content`
- `/api/recommendations`

O arquivo funciona como ponto central de integração dos módulos adicionais com a aplicação principal.

---

# 7. Arquitetura do backend

A implementação segue uma arquitetura modular organizada por funcionalidade.

A estrutura principal dos módulos segue o seguinte padrão:

```text
modules/
├── reminders/
├── progress/
├── content/
└── recommendations/
