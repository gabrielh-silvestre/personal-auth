# Processo de release

Git Flow completo. `main` guarda o que está em produção, `dev` integra o que vai
para a próxima versão, e uma branch `release/x.y.z` estabiliza a versão antes de
ela chegar na `main`.

Nenhum merge acontece localmente: todo merge é um Pull Request no GitHub. Isso
evita o `wt merge`, que integra a branch atual no alvo e pode reescrever ou
remover a de origem — não é equivalente ao `git merge`.

## Branches

| Branch | Vive | Nasce de | Termina em |
|---|---|---|---|
| `main` | permanente | — | — |
| `dev` | permanente | — | — |
| `feat/*`, `fix/*`, `chore/*`, `refactor/*` | temporária | `dev` | PR para `dev` |
| `release/x.y.z` | temporária | `dev` | PR para `main` **e** PR para `dev` |
| `hotfix/x.y.z` | temporária | `main` | PR para `main` **e** PR para `dev` |

Worktrees e branches passam pelo Worktrunk, nunca pelo `git` direto:

```bash
wt switch -c feat/basic-auth -b dev     # cria branch + worktree
wt list                                  # o que está aberto
wt remove feat/basic-auth                # remove worktree e branch já mergeada
wt remove --force feat/basic-auth -D     # worktree sujo / branch não mergeada
```

## Versionamento

A fonte da verdade é o `version` do `package.json`; a tag deriva dele.

O tipo do bump sai dos Conventional Commits acumulados desde a última tag:

| Commits desde a última tag | Bump |
|---|---|
| algum `BREAKING CHANGE` (ou `!` no tipo) | major |
| algum `feat` | minor |
| só `fix`, `chore`, `docs`, `refactor`, `test` | patch |

A tag leva o prefixo `v`, que é o padrão do `npm version` (`v0.0.2`).

**Estado atual:** `package.json` em `0.0.1`, nenhuma tag publicada. A próxima
release é **`0.0.2`**.

## Fluxo de feature

1. `wt switch -c feat/<slug> -b dev`
2. Commits em Conventional Commits (subject só, sem corpo — o hook rejeita).
3. PR de `feat/<slug>` para `dev`. O `pullRequest.yml` roda `npm run test`.
4. Merge do PR, e `wt remove feat/<slug>`.

## Fluxo de release

1. `wt switch -c release/0.0.2 -b dev`
2. Bump sem tag, porque a tag só nasce depois do merge:
   ```bash
   npm version 0.0.2 --no-git-tag-version
   ```
3. `git commit -am "chore: release 0.0.2"`
4. Só correções entram na branch de release. Funcionalidade nova continua indo
   para `dev` e fica para a próxima versão — é justamente isso que a branch de
   release compra.
5. PR de `release/0.0.2` para **`main`**. O `main.yml` roda `test:cov` +
   SonarCloud; o check `Coverage` precisa passar. Merge.
6. Tag no commit de merge, na `main`:
   ```bash
   git fetch origin main
   git tag -a v0.0.2 origin/main -m "0.0.2"
   git push origin v0.0.2
   ```
7. Release no GitHub, com as notas geradas a partir dos PRs incluídos:
   ```bash
   gh release create v0.0.2 --generate-notes
   ```
8. PR de `release/0.0.2` para **`dev`**, levando o bump e as correções de volta.
   Sem esse passo a `dev` fica atrás da `main`.
9. `wt remove release/0.0.2`

## Fluxo de hotfix

Mesmo desenho, mas a branch nasce da `main` porque a `dev` pode conter trabalho
que ainda não pode ir para produção.

1. `wt switch -c hotfix/0.0.3 -b main`
2. Corrige, `npm version 0.0.3 --no-git-tag-version`, commit.
3. PR para `main` → merge → tag `v0.0.3` → release no GitHub.
4. PR de `hotfix/0.0.3` para `dev`.
5. `wt remove hotfix/0.0.3`

## O que o CI faz em cada ponto

| Evento | Workflow | Roda |
|---|---|---|
| PR para `dev` | `pullRequest.yml` | `npm run test` |
| PR para `main` | `main.yml` | `test:cov` + SonarCloud |

O check `Coverage` (job do `main.yml`) é obrigatório para mergear na `main`.

## Proteções que sustentam isso

- **GitHub**: `main` exige PR e o check `Coverage` verde; push direto bloqueado.
  Admin tem bypass, para resolver emergência pelo dashboard.
- **`.husky/pre-commit`**: rejeita qualquer commit feito na `main`.
  Escape deliberado: `git commit --no-verify`.
- **`.claude/hooks/no-main-edits.cjs`**: recusa escrita e commit do agente
  enquanto o worktree estiver na `main`.

Detalhes e o raciocínio por trás delas estão na seção `## Branches` do
[CLAUDE.md](../CLAUDE.md).
