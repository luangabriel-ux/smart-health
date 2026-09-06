# Contrato da API

Base `/api`; JSON camelCase, UUID, datas ISO com fuso; sucesso `{data:...}`, erro `{error:{code,message}}`. Logout e exclusão retornam 204 sem corpo. Bearer no cabeçalho Authorization. Campos desconhecidos são rejeitados.

| Método | Caminho | Dados |
| --- | --- | --- |
| POST | /auth/register | name, email, password; público; retorna perfil 201 |
| POST | /auth/login | email, password; público; retorna accessToken, tokenType, expiresAt, user |
| POST | /auth/logout | Autenticado; revoga sessão atual |
| GET | /users/me | Perfil do titular |
| PATCH | /users/me | name, age, weightKg, heightCm, healthGoals, medicalConditions |
| POST | /activities | type, description, occurredAt e métricas compatíveis |
| GET | /activities?limit=20&offset=0 | Lista do titular; máximo 100; inclui pagination |
| GET | /activities/:id | Atividade do titular |
| DELETE | /activities/:id | Exclusão do titular |

`/health` confirma processo e `/ready` testa conexão com banco; ambos públicos, fora de `/api`.

Nome até 120 caracteres, e-mail até 254 normalizado, senha 8–128. Perfil: idade inteira 1–120, peso 0,01–500 kg, altura 0,01–300 cm, objetivos textuais até 1000 e condições médicas até 2000. Null limpa opcionais. Plano e e-mail não são editáveis por PATCH.

Atividade: tipo exercise/water/meal/habit, descrição 1–500, data não futura com fuso. Água exige waterMl inteiro 1–20000. Somente exercício aceita durationMinutes 1–1440, steps 0–200000 e calories 0–30000, opcionais e inteiros. Calorias são gasto informado de exercício, não consumo alimentar. Limites são técnicos, não recomendações de saúde. Valores ausentes não significam medição zero.

O servidor gera id, userId e createdAt. Entrada inválida retorna 400; sessão inválida 401; e-mail duplicado 409; atividade inexistente ou alheia 404.

## Demonstração PowerShell

```powershell
$base='http://127.0.0.1:3000/api'
$cadastro=@{name='Demo';email='demo@example.com';password='SenhaDemo123!'} | ConvertTo-Json
Invoke-RestMethod "$base/auth/register" -Method Post -ContentType 'application/json' -Body $cadastro
$login=@{email='demo@example.com';password='SenhaDemo123!'} | ConvertTo-Json
$sessao=Invoke-RestMethod "$base/auth/login" -Method Post -ContentType 'application/json' -Body $login
$headers=@{Authorization="Bearer $($sessao.data.accessToken)"}
$atividade=@{type='water';description='Água';waterMl=250;occurredAt=(Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')} | ConvertTo-Json
Invoke-RestMethod "$base/activities" -Method Post -Headers $headers -ContentType 'application/json' -Body $atividade
Invoke-RestMethod "$base/activities" -Headers $headers
```
