# Token grava o método que o emitiu

**Status:** Proposta — não implementada. O campo `origin` não existe em `Token`/`IToken`/`TokenFactory`.
Não implementar: sem recuperação de senha (removida, ver ADR 0002), os únicos Métodos de Autenticação
restantes são login e refresh, o que reduz bastante o valor de rastrear Origem separada de Propósito.

O serviço passa a suportar vários métodos de autenticação, e o modelo atual do Token só registra para que ele serve (acessar, renovar, recuperar senha) — não de onde ele veio. Decidimos que o Token grava também a sua Origem, em campo separado do Propósito, porque sem isso não há como auditar tokens por método, aplicar prazos diferentes por método, nem revogar em massa os tokens de um método que foi desligado.

## Considered Options

- **Origem apenas na porta de entrada**: o método decidiria se o token nasce e desapareceria em seguida, mantendo o agregado como está. Rejeitado: desligar um método deixaria seus tokens vivos e indistinguíveis, sem resposta para "e os que ele já emitiu?".
- **Origem substituindo o Propósito**: distinguir tokens só pelo método. Rejeitado: são perguntas diferentes — dois tokens de acesso emitidos por métodos distintos continuam servindo para a mesma coisa.

## Consequences

- O Propósito (`TokenType` no código, hoje `'ACCESS' | 'RECOVER_PASSWORD' | 'REFRESH'`) continua existindo; a Origem é um eixo novo e independente.
- Token de recuperação de senha não se aplica mais: a responsabilidade foi removida deste serviço (ver ADR 0002).
