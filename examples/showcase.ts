// One-page visual showcase of crayon. Run with:
//   npm run demo
// Try also:
//   FORCE_COLOR=2 npm run demo   (256-color downgrade)
//   NO_COLOR=1     npm run demo  (no-color fallbacks)

import { c, link, theme, colorLevel } from '../src/index.js';

const W = 72;
const HR_DOUBLE = '═'.repeat(W);

function section(title: string): void {
  const lead = '── ' + title + ' ';
  console.log();
  console.log(c.gray(lead + '─'.repeat(Math.max(0, W - lead.length))));
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

// ─────────────────────────────────────────────────────── header ──
console.log();
console.log(c.gray(HR_DOUBLE));
console.log(
  '  ' +
    c.bold.rgb(255, 136, 0)('crayon') +
    c.gray(' — terminal styling done right'),
);
console.log(c.gray(HR_DOUBLE));
console.log();
console.log(
  '  ' +
    c.gray('Color level:') +
    ' ' +
    c.bold(String(colorLevel)) +
    c.gray('   ·   Bundle:') +
    ' ' +
    c.bold('2.6 KB gzip') +
    c.gray('   ·   Deps:') +
    ' ' +
    c.bold('zero') +
    c.gray('   ·   Node:') +
    ' ' +
    c.bold(process.version),
);

// ────────────────────────────────────────────────── basic colors ──
section('Basic colors');
console.log(
  '  ' +
    c.black('black') +
    '   ' +
    c.red('red') +
    '   ' +
    c.green('green') +
    '   ' +
    c.yellow('yellow') +
    '   ' +
    c.blue('blue') +
    '   ' +
    c.magenta('magenta') +
    '   ' +
    c.cyan('cyan') +
    '   ' +
    c.white('white') +
    '   ' +
    c.gray('gray'),
);

// ───────────────────────────────────────────────── bright colors ──
section('Bright variants');
console.log(
  '  ' +
    c.redBright('redBright') +
    '   ' +
    c.greenBright('greenBright') +
    '   ' +
    c.yellowBright('yellowBright') +
    '   ' +
    c.blueBright('blueBright') +
    '   ' +
    c.magentaBright('magentaBright') +
    '   ' +
    c.cyanBright('cyanBright'),
);

// ────────────────────────────────────────────────── backgrounds ──
section('Backgrounds');
console.log(
  '  ' +
    c.bgRed.white(' red ') +
    ' ' +
    c.bgGreen.black(' green ') +
    ' ' +
    c.bgYellow.black(' yellow ') +
    ' ' +
    c.bgBlue.white(' blue ') +
    ' ' +
    c.bgMagenta.white(' magenta ') +
    ' ' +
    c.bgCyan.black(' cyan ') +
    ' ' +
    c.bgWhite.black(' white '),
);

// ───────────────────────────────────────────────────── modifiers ──
section('Modifiers');
console.log(
  '  ' +
    c.bold('bold') +
    '   ' +
    c.dim('dim') +
    '   ' +
    c.italic('italic') +
    '   ' +
    c.underline('underline') +
    '   ' +
    c.strikethrough('strikethrough'),
);
console.log(
  '  ' +
    c.inverse(' inverse ') +
    '   ' +
    c.overline('overline') +
    '   ' +
    c.gray('hidden between brackets:') +
    ' [' +
    c.hidden('hidden') +
    ']',
);

// ─────────────────────────────────────────── underline variants ──
section("Underline variants (chalk doesn't ship these)");
console.log(
  '  ' +
    c.underline('regular') +
    '   ' +
    c.underlineDouble('double') +
    '   ' +
    c.underlineCurly('curly / squiggly') +
    '   ' +
    c.underlineDotted('dotted') +
    '   ' +
    c.underlineDashed('dashed'),
);

// ────────────────────────────────────── truecolor (60-step hue) ──
section('Truecolor — 60-step hue rainbow via c.rgb()');
let rainbow = '  ';
for (let i = 0; i < 60; i++) {
  const [r, g, b] = hsl((i / 60) * 360, 75, 55);
  rainbow += c.rgb(r, g, b)('█');
}
console.log(rainbow);

// ────────────────────────────────────────── ansi256 color cube ──
section('256-color cube (6 × 36 = 216 indices)');
for (let row = 0; row < 6; row++) {
  let line = '  ';
  for (let col = 0; col < 36; col++) {
    line += c.ansi256(16 + row * 36 + col)('█');
  }
  console.log(line);
}

// ─────────────────────────────────────────── grayscale gradient ──
section('Grayscale ramp (ansi256 232–255)');
let gray = '  ';
for (let i = 232; i <= 255; i++) gray += c.ansi256(i)('███');
console.log(gray);

// ─────────────────────────────────────────────── hex / brand colors ──
section('Brand hex colors via c.hex()');
console.log(
  '  ' +
    c.hex('#ff8800')('crayon orange') +
    '   ' +
    c.hex('#2563eb')('tailwind blue') +
    '   ' +
    c.hex('#10b981')('emerald') +
    '   ' +
    c.hex('#ec4899')('rose'),
);

// ──────────────────────────────────────────────────────── themes ──
section('Themes (typed)');
const t = theme({
  error: ['red', 'bold'],
  warn: 'yellow',
  ok: ['green', 'bold'],
  info: 'cyan',
  muted: 'gray',
});
console.log('  ' + t.error('error:') + ' something broke');
console.log('  ' + t.warn('warn: ') + ' check your config');
console.log('  ' + t.ok('ok:   ') + ' all systems normal');
console.log('  ' + t.info('info: ') + ' v0.1.0 available');
console.log('  ' + t.muted('  fyi: this is muted'));

// ──────────────────────────────────────────────────── hyperlinks ──
section('Hyperlinks (OSC 8 — Cmd/Ctrl-click in supported terminals)');
console.log(
  '  ' + link('crayon repository', 'https://github.com/REPLACE/crayon'),
);
console.log(
  '  ' +
    link('chalk', 'https://github.com/chalk/chalk') +
    c.gray('  (the inspiration)'),
);

// ────────────────────────────────────────────────────── nesting ──
section('Nested styles — outer color survives inner reset');
const nested = c.red('outer text ' + c.blue('inner blue') + ' still red');
console.log('  ' + nested);
console.log(
  '  ' +
    c.gray('raw: ') +
    c.dim(JSON.stringify(nested).replace(/\\u001b/g, 'ESC')),
);

// ─────────────────────────────────────────── real-world: log lines ──
section('Real-world: log lines');
console.log(
  '  ' +
    c.dim('14:32:01') +
    ' ' +
    c.cyan('[INFO]') +
    ' Server listening on :3000',
);
console.log(
  '  ' +
    c.dim('14:32:04') +
    ' ' +
    c.yellow('[WARN]') +
    ' Deprecated config field: ' +
    c.italic('legacyMode'),
);
console.log(
  '  ' +
    c.dim('14:32:09') +
    ' ' +
    c.red.bold('[ERROR]') +
    ' ' +
    c.red('Connection failed: ECONNREFUSED'),
);

// ────────────────────────────────────────────── real-world: diff ──
section('Real-world: diff');
console.log('  ' + c.dim('--- a/src/index.ts'));
console.log('  ' + c.dim('+++ b/src/index.ts'));
console.log('  ' + c.dim('@@ -42,7 +42,7 @@'));
console.log('  ' + c.red('- export default chalk;'));
console.log('  ' + c.green('+ export { c, crayon };'));

// ─────────────────────────────────────────── real-world: progress ──
section('Real-world: progress bars');
const total = 40;
for (const pct of [12, 38, 64, 87, 100]) {
  const filled = Math.round((pct / 100) * total);
  const bar =
    (pct === 100 ? c.green : c.cyan)('█'.repeat(filled)) +
    c.gray('░'.repeat(total - filled));
  const label = (pct === 100 ? c.green.bold : c.bold)(
    pct.toString().padStart(3) + '%',
  );
  console.log('  ' + bar + ' ' + label);
}

// ──────────────────────────────────────────── real-world: banner ──
section('Real-world: banner');
const title = 'crayon v0.1.0';
const tagline = 'faster · smaller · universal · zero deps';
const inner = Math.max(title.length, tagline.length) + 6;
const pad = (s: string) => s + ' '.repeat(inner - s.length);
console.log('  ' + c.gray('┌' + '─'.repeat(inner) + '┐'));
console.log(
  '  ' + c.gray('│') + '  ' + c.bold.rgb(255, 136, 0)(pad(title).slice(0, inner)) + c.gray('│'),
);
console.log(
  '  ' + c.gray('│') + '  ' + c.gray(pad(tagline).slice(0, inner)) + c.gray('│'),
);
console.log('  ' + c.gray('└' + '─'.repeat(inner) + '┘'));

// ─────────────────────────────────────────────────────── footer ──
console.log();
console.log(c.gray(HR_DOUBLE));
console.log(
  '  ' +
    c.gray('Try:') +
    '  ' +
    c.bold('FORCE_COLOR=2 npm run demo') +
    c.gray('   ·   ') +
    c.bold('NO_COLOR=1 npm run demo'),
);
console.log(c.gray(HR_DOUBLE));
console.log();
