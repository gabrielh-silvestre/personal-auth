# Autenticação

Este serviço autentica sujeitos por métodos diversos e emite tokens que provam essa autenticação. Ele não decide o que um sujeito pode fazer, e não guarda segredo cujo dono natural é outro domínio.

Os termos aparecem em português com o identificador correspondente em inglês, que é o usado no código.

## Language

### O token

**Token**:
Prova emitida por este serviço de que um Sujeito foi autenticado, válida por tempo limitado e revogável.
_Avoid_: sessão, ticket, credencial de acesso

**Sujeito** (`subject`):
Quem um Token identifica. Pode ser uma pessoa ou um serviço.
_Avoid_: usuário, user, conta, identidade, principal

**Propósito** (`purpose`):
Para que um Token serve: acessar ou renovar outro token.
_Avoid_: tipo de token, categoria

**Origem** (`origin`):
O Método de Autenticação que emitiu um Token. Fica gravada no Token, separada do Propósito.
_Avoid_: fonte, provedor, emissor

### A autenticação

**Método de Autenticação** (`authentication method`):
A forma pela qual um Sujeito prova quem é antes de um Token nascer.
_Avoid_: estratégia, strategy, provedor, fluxo de login

**Catálogo** (`catalog`):
O conjunto de Métodos de Autenticação habilitados. Nenhum Token nasce fora dele.
_Avoid_: registro, lista de provedores, configuração de auth

**Credencial** (`credential`):
O material que um Sujeito apresenta para provar quem é.
_Avoid_: login, senha, chave

**Segredo** (`secret`):
A contraparte guardada contra a qual uma Credencial é conferida. Pertence a este serviço apenas quando nasce do próprio ato de autenticar.
_Avoid_: hash, chave privada, salt

**Verificador Externo** (`external verifier`):
O serviço dono de um Segredo que este serviço não possui, e a quem a conferência da Credencial é delegada.
_Avoid_: serviço de usuários, provedor de identidade
