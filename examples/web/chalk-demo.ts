// chalk version of showcase.ts — matched feature-for-feature where possible.
// Sections that chalk cannot do are explicitly marked "(not supported)" so
// the side-by-side comparison is honest.

import chalk from 'chalk';

const W = 72;
const HR_DOUBLE = '═'.repeat(W);

function section(title: string): void {
  const lead = '── ' + title + ' ';
  console.log();
  console.log(chalk.gray(lead + '─'.repeat(Math.max(0, W - lead.length))));
}

function hsl(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ];
}

// header
console.log();
console.log(chalk.gray(HR_DOUBLE));
console.log(
  '  ' +
    chalk.bold.rgb(255, 136, 0)('chalk') +
    chalk.gray(' — the reference Node.js terminal styling library'),
);
console.log(chalk.gray(HR_DOUBLE));
console.log();
console.log(
  '  ' +
    chalk.gray('Version:') +
    ' ' +
    chalk.bold('5.6.2') +
    chalk.gray('   ·   Bundle:') +
    ' ' +
    chalk.bold('2.1 KB gzip') +
    chalk.gray('   ·   Deps:') +
    ' ' +
    chalk.bold('zero') +
    chalk.gray('   ·   Node:') +
    ' ' +
    chalk.bold(process.version),
);

section('Basic colors');
console.log(
  '  ' +
    chalk.black('black') +
    '   ' +
    chalk.red('red') +
    '   ' +
    chalk.green('green') +
    '   ' +
    chalk.yellow('yellow') +
    '   ' +
    chalk.blue('blue') +
    '   ' +
    chalk.magenta('magenta') +
    '   ' +
    chalk.cyan('cyan') +
    '   ' +
    chalk.white('white') +
    '   ' +
    chalk.gray('gray'),
);

section('Bright variants');
console.log(
  '  ' +
    chalk.redBright('redBright') +
    '   ' +
    chalk.greenBright('greenBright') +
    '   ' +
    chalk.yellowBright('yellowBright') +
    '   ' +
    chalk.blueBright('blueBright') +
    '   ' +
    chalk.magentaBright('magentaBright') +
    '   ' +
    chalk.cyanBright('cyanBright'),
);

section('Backgrounds');
console.log(
  '  ' +
    chalk.bgRed.white(' red ') +
    ' ' +
    chalk.bgGreen.black(' green ') +
    ' ' +
    chalk.bgYellow.black(' yellow ') +
    ' ' +
    chalk.bgBlue.white(' blue ') +
    ' ' +
    chalk.bgMagenta.white(' magenta ') +
    ' ' +
    chalk.bgCyan.black(' cyan ') +
    ' ' +
    chalk.bgWhite.black(' white '),
);

section('Modifiers');
console.log(
  '  ' +
    chalk.bold('bold') +
    '   ' +
    chalk.dim('dim') +
    '   ' +
    chalk.italic('italic') +
    '   ' +
    chalk.underline('underline') +
    '   ' +
    chalk.strikethrough('strikethrough'),
);
console.log(
  '  ' +
    chalk.inverse(' inverse ') +
    '   ' +
    chalk.gray('(no overline)') +
    '   ' +
    chalk.gray('hidden between brackets:') +
    ' [' +
    chalk.hidden('hidden') +
    ']',
);

section('Underline variants — chalk ships only one');
console.log(
  '  ' +
    chalk.underline('regular') +
    '   ' +
    chalk.gray('(double / curly / dotted / dashed: not supported)'),
);

section('Truecolor — 60-step hue rainbow via chalk.rgb()');
let rainbow = '  ';
for (let i = 0; i < 60; i++) {
  const [r, g, b] = hsl((i / 60) * 360, 75, 55);
  rainbow += chalk.rgb(r, g, b)('█');
}
console.log(rainbow);

section('256-color cube (6 × 36 = 216 indices)');
for (let row = 0; row < 6; row++) {
  let line = '  ';
  for (let col = 0; col < 36; col++) {
    line += chalk.ansi256(16 + row * 36 + col)('█');
  }
  console.log(line);
}

section('Grayscale ramp (ansi256 232–255)');
let gray = '  ';
for (let i = 232; i <= 255; i++) gray += chalk.ansi256(i)('███');
console.log(gray);

section('Brand hex colors via chalk.hex()');
console.log(
  '  ' +
    chalk.hex('#ff8800')('crayon orange') +
    '   ' +
    chalk.hex('#2563eb')('tailwind blue') +
    '   ' +
    chalk.hex('#10b981')('emerald') +
    '   ' +
    chalk.hex('#ec4899')('rose'),
);

section('Themes — chalk has none; users write helpers manually');
const error = (s: string) => chalk.red.bold(s);
const warn = (s: string) => chalk.yellow(s);
const ok = (s: string) => chalk.green.bold(s);
const info = (s: string) => chalk.cyan(s);
const muted = (s: string) => chalk.gray(s);
console.log('  ' + error('error:') + ' something broke');
console.log('  ' + warn('warn: ') + ' check your config');
console.log('  ' + ok('ok:   ') + ' all systems normal');
console.log('  ' + info('info: ') + ' v0.1.0 available');
console.log('  ' + muted('  fyi: this is muted'));

section('Hyperlinks — chalk leaves OSC 8 to the terminal-link package');
console.log(
  '  ' + 'chalk repository: ' + chalk.cyan('https://github.com/chalk/chalk'),
);
console.log(
  '  ' +
    chalk.gray('(in crayon: link("label", "url") emits clickable OSC 8)'),
);

section('Nested styles — outer color survives inner reset');
const nested = chalk.red('outer text ' + chalk.blue('inner blue') + ' still red');
console.log('  ' + nested);
console.log(
  '  ' +
    chalk.gray('raw: ') +
    chalk.dim(JSON.stringify(nested).replace(/\\u001b/g, 'ESC')),
);

section('Real-world: log lines');
console.log(
  '  ' +
    chalk.dim('14:32:01') +
    ' ' +
    chalk.cyan('[INFO]') +
    ' Server listening on :3000',
);
console.log(
  '  ' +
    chalk.dim('14:32:04') +
    ' ' +
    chalk.yellow('[WARN]') +
    ' Deprecated config field: ' +
    chalk.italic('legacyMode'),
);
console.log(
  '  ' +
    chalk.dim('14:32:09') +
    ' ' +
    chalk.red.bold('[ERROR]') +
    ' ' +
    chalk.red('Connection failed: ECONNREFUSED'),
);

section('Real-world: diff');
console.log('  ' + chalk.dim('--- a/src/index.ts'));
console.log('  ' + chalk.dim('+++ b/src/index.ts'));
console.log('  ' + chalk.dim('@@ -42,7 +42,7 @@'));
console.log('  ' + chalk.red('- export default chalk;'));
console.log('  ' + chalk.green('+ export { c, crayon };'));

section('Real-world: progress bars');
const total = 40;
for (const pct of [12, 38, 64, 87, 100]) {
  const filled = Math.round((pct / 100) * total);
  const bar =
    (pct === 100 ? chalk.green : chalk.cyan)('█'.repeat(filled)) +
    chalk.gray('░'.repeat(total - filled));
  const label = (pct === 100 ? chalk.green.bold : chalk.bold)(
    pct.toString().padStart(3) + '%',
  );
  console.log('  ' + bar + ' ' + label);
}

section('Real-world: banner');
const title = 'chalk v5.6.2';
const tagline = 'the canonical terminal styling library';
const inner = Math.max(title.length, tagline.length) + 6;
const pad = (s: string) => s + ' '.repeat(inner - s.length);
console.log('  ' + chalk.gray('┌' + '─'.repeat(inner) + '┐'));
console.log(
  '  ' +
    chalk.gray('│') +
    '  ' +
    chalk.bold.rgb(255, 136, 0)(pad(title).slice(0, inner)) +
    chalk.gray('│'),
);
console.log(
  '  ' +
    chalk.gray('│') +
    '  ' +
    chalk.gray(pad(tagline).slice(0, inner)) +
    chalk.gray('│'),
);
console.log('  ' + chalk.gray('└' + '─'.repeat(inner) + '┘'));

console.log();
console.log(chalk.gray(HR_DOUBLE));
console.log();
