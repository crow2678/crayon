// Local-only web server for visual comparison of crayon vs chalk.
// Runs each library's showcase via `tsx` at startup, captures ANSI stdout,
// and serves three pages that render the output through xterm.js so it
// looks exactly like a real terminal.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');

function runDemo(scriptPath) {
  return new Promise((resolveP, rejectP) => {
    const child = spawn('npx', ['tsx', scriptPath], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, FORCE_COLOR: '3' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('close', (code) => {
      if (code === 0) resolveP(out);
      else rejectP(new Error(`exit ${code}\n${err}`));
    });
  });
}

console.log('Building crayon showcase output...');
const crayonAnsi = await runDemo('examples/showcase.ts');
console.log('Building chalk showcase output...');
const chalkAnsi = await runDemo('examples/web/chalk-demo.ts');

const template = await readFile(join(__dirname, 'page.html'), 'utf8');

const CRAYON_STATS =
  '<strong>2.6 KB</strong> gzip · zero deps · OSC 8 links · curly underline · typed themes · FORCE_COLOR 0-3';
const CHALK_STATS =
  '<strong>2.1 KB</strong> gzip · zero deps · no OSC 8 (separate pkg) · no curly underline · no themes · FORCE_COLOR 0 / 3 only';

function render({ title, terminals }) {
  return template
    .replace(/\{\{TITLE\}\}/g, title)
    .replace('{{TERMINALS_JSON}}', JSON.stringify(terminals));
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let body;
  if (url.pathname === '/') {
    body = render({
      title: 'crayon vs chalk',
      terminals: [
        {
          name: 'crayon',
          tagline: 'this library',
          stats: CRAYON_STATS,
          ansi: crayonAnsi,
          accent: '#ff8800',
        },
        {
          name: 'chalk',
          tagline: 'reference implementation',
          stats: CHALK_STATS,
          ansi: chalkAnsi,
          accent: '#7f8c97',
        },
      ],
    });
  } else if (url.pathname === '/crayon') {
    body = render({
      title: 'crayon',
      terminals: [
        {
          name: 'crayon',
          tagline: 'this library',
          stats: CRAYON_STATS,
          ansi: crayonAnsi,
          accent: '#ff8800',
        },
      ],
    });
  } else if (url.pathname === '/chalk') {
    body = render({
      title: 'chalk',
      terminals: [
        {
          name: 'chalk',
          tagline: 'reference implementation',
          stats: CHALK_STATS,
          ansi: chalkAnsi,
          accent: '#7f8c97',
        },
      ],
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
});

const PORT = Number(process.env.PORT ?? 3737);
server.listen(PORT, () => {
  console.log('');
  console.log(`  Side-by-side:  \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
  console.log(`  crayon only:   \x1b[36mhttp://localhost:${PORT}/crayon\x1b[0m`);
  console.log(`  chalk  only:   \x1b[36mhttp://localhost:${PORT}/chalk\x1b[0m`);
  console.log('');
  console.log('  Ctrl-C to stop.');
});
