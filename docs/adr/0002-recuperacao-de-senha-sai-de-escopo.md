# Recuperação de senha sai do escopo deste serviço

Este serviço emitia um token de recuperação de senha sob o pattern RMQ
`auth.generate_recover_token`. Decidimos remover essa responsabilidade inteira:
ela pertence ao serviço dono das credenciais, não ao emissor de tokens.

A decisão resolve a dívida que a [ADR 0001](0001-token-grava-o-metodo-que-o-emitiu.md)
já havia registrado sem resolver: um token de recuperação nascia **sem
Credencial alguma**, a pedido de outro serviço, e por isso não tinha Origem
possível — contradizia o próprio modelo de um serviço cuja função é provar que
um Sujeito foi autenticado.

O que precipitou a remoção foi um defeito, não só a modelagem: o handler não
tinha guard, nunca verificava se o `userId` existia, e devolvia o JWT de
recuperação cru na resposta RPC — sem passar por e-mail nem por qualquer canal
separado. Qualquer publisher com acesso à fila `AUTH` obtinha um token de
recuperação válido para qualquer `userId`, e o `.env.example` documentava as
credenciais padrão do broker (`guest`/`guest`). Blindar o endpoint manteria no
serviço uma responsabilidade que ele não deveria ter.

## Considered Options

- **Validar o `userId` contra o Verificador Externo e manter a emissão.**
  Rejeitado: fecha o buraco imediato e mantém o problema de modelagem — o
  serviço continuaria emitindo token sem Credencial.
- **Emitir o token e publicá-lo na fila de e-mail em vez de devolvê-lo.**
  Rejeitado: é a correção certa para quem é dono do fluxo, e este serviço não é.
  Exigiria também um consumidor de e-mail que não existe.

## Consequences

- O pattern `auth.generate_recover_token` deixa de existir. **Quebra qualquer
  publisher que ainda o use** — a mudança de contrato precisa ser comunicada ao
  serviço de usuários antes do deploy.
- O Propósito (`TokenType`) passa a ser `'ACCESS' | 'REFRESH'`.
- A fila MAIL sai do módulo, junto com `RABBITMQ_MAIL_QUEUE` e
  `RECOVER_PASSWORD_TOKEN_EXPIRE_TIME`.
- Recuperação de senha passa a depender de o serviço de usuários implementá-la,
  com o seu próprio mecanismo de token de uso único.
