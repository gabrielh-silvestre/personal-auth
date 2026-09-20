# Recuperação de senha sai de escopo

A ADR 0001 já registrava a dívida: um Token de recuperação de senha não tem
Origem possível, porque é emitido sem credencial alguma, a pedido de outro
serviço — sinal de que essa responsabilidade não pertence a este serviço.
Decidimos resolver a dívida agora: este serviço deixa de emitir tokens de
recuperação de senha. Essa responsabilidade migra para o serviço de usuários,
dono natural do segredo que a recuperação de senha manipula.

## Consequences

- `TokenType` perde o valor `'RECOVER_PASSWORD'`; o Propósito de um Token
  passa a ser só acessar ou renovar outro token.
- O endpoint que emitia esses tokens (`GenerateTokenController`/
  `GenerateTokenUseCase`, pattern RMQ `auth.generate_recover_token`) foi
  removido, não blindado — não há mais caminho de código que os substitua
  neste serviço.
- Qualquer publisher externo que ainda dependa de `auth.generate_recover_token`
  quebra; a mudança de contrato precisa ser comunicada ao serviço de usuários
  antes do deploy.
