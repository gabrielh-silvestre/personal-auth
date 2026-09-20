#!/usr/bin/env node
// Recusa escrita e commit enquanto o worktree ativo estiver na main.
// Artefatos operacionais (.omc/, .ignore/) passam: sao git-ignorados.
const { execSync } = require('node:child_process');
const fs = require('node:fs');

const ALLOWED = ['/.omc/', '/.ignore/'];

function block(message) {
  process.stderr.write(`${message}\nBranch atual: main. Use: wt switch -c <nome> -b main\n`);
  process.exit(2);
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.exit(0); // sem payload utilizavel: nao e papel do guard adivinhar
}

let branch;
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch {
  process.exit(0); // fora de um repo git
}

if (branch !== 'main') process.exit(0);

const tool = payload.tool_name;
const input = payload.tool_input || {};

if (tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') {
  const file = input.file_path || '';
  if (ALLOWED.some((prefix) => file.includes(prefix))) process.exit(0);
  block(`Escrita bloqueada em ${file}`);
}

if (tool === 'Bash' && /\bgit\s+commit\b/.test(input.command || '')) {
  block('Commit bloqueado.');
}

process.exit(0);
