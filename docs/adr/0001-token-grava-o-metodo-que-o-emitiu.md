# Token grava o método que o emitiu

**Status: proposta — não implementada.** Não existe campo `origin` em `Token`,
`IToken` ou `TokenFactory`. Com a saída da recuperação de senha do escopo do
serviço (ver [ADR 0002](0002-recuperacao-de-senha-sai-de-escopo.md)), sobram
login e refresh como Métodos de Autenticação, o que reduz muito o valor de
rastrear Origem em eixo separado do Propósito. Reavaliar quando um terceiro
método entrar no Catálogo.

O serviço passa a suportar vários métodos de autenticação, e o modelo atual do Token só registra para que ele serve (acessar, renovar, recuperar senha) — não de onde ele veio. Decidimos que o Token grava também a sua Origem, em campo separado do Propósito, porque sem isso não há como auditar tokens por método, aplicar prazos diferentes por método, nem revogar em massa os tokens de um método que foi desligado.

## Considered Options

- **Origem apenas na porta de entrada**: o método decidiria se o token nasce e desapareceria em seguida, mantendo o agregado como está. Rejeitado: desligar um método deixaria seus tokens vivos e indistinguíveis, sem resposta para "e os que ele já emitiu?".
- **Origem substituindo o Propósito**: distinguir tokens só pelo método. Rejeitado: são perguntas diferentes — dois tokens de acesso emitidos por métodos distintos continuam servindo para a mesma coisa.

## Consequences

- O Propósito (`TokenType` no código, hoje `'ACCESS' | 'REFRESH'`) continua existindo; a Origem seria um eixo novo e independente.
- Token de recuperação de senha não tinha Origem possível: era emitido sem credencial alguma, a pedido de outro serviço. Essa contradição expôs que a responsabilidade não pertencia a este serviço — dívida desde resolvida pela [ADR 0002](0002-recuperacao-de-senha-sai-de-escopo.md), que removeu a recuperação de senha do escopo.
