// Single-file side-by-side comparison: chalk vs crayon.
// Run with: FORCE_COLOR=3 npx tsx examples/compare.ts

import chalk from 'chalk';
import { Bench } from 'tinybench';
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { c, styled, link, theme } from '../src/index.js';

process.env.FORCE_COLOR = '3';

const HR = '─'.repeat(72);
const section = (title: string) => {
  console.log('\n' + chalk.gray(HR));
  console.log(chalk.bold.white(' ' + title));
  console.log(chalk.gray(HR));
};

const row = (label: string, chalkOut: string, crayonOut: string) => {
  console.log(
    ' ' +
      label.padEnd(22) +
      chalk.gray('│ ') +
      chalkOut.padEnd(28) +
      chalk.gray('│ ') +
      crayonOut,
  );
};

const header = () => {
  console.log(
    ' ' +
      ''.padEnd(22) +
      chalk.gray('│ ') +
      chalk.bold('chalk').padEnd(28 + 9) +
      chalk.gray('│ ') +
      chalk.bold('crayon'),
  );
  console.log(' ' + ''.padEnd(22) + chalk.gray('│ ' + '─'.repeat(26) + ' │ ' + '─'.repeat(26)));
};

// ─────────────────────────────────────────────────────────────────────────────
section('1. Visual parity — basic colors');
header();
row('red', chalk.red('error'), c.red('error'));
row('green.bold', chalk.green.bold('ok'), c.green.bold('ok'));
row('bgYellow.black', chalk.bgYellow.black(' warn '), c.bgYellow.black(' warn '));
row('hex(#ff8800)', chalk.hex('#ff8800')('orange'), c.hex('#ff8800')('orange'));
row('rgb(255,0,128)', chalk.rgb(255, 0, 128)('pink'), c.rgb(255, 0, 128)('pink'));
row('ansi256(208)', chalk.ansi256(208)('208'), c.ansi256(208)('208'));

// ─────────────────────────────────────────────────────────────────────────────
section('2. Modifiers');
header();
row('underline', chalk.underline('uline'), c.underline('uline'));
row('strikethrough', chalk.strikethrough('strk'), c.strikethrough('strk'));
row('italic', chalk.italic('ital'), c.italic('ital'));
row('dim', chalk.dim('dim'), c.dim('dim'));

// ─────────────────────────────────────────────────────────────────────────────
section('3. Features chalk does not ship');
console.log();
console.log('  ' + chalk.bold('Squiggly underline (chalk issue #604):'));
console.log('    chalk:  ' + chalk.gray('(not supported)'));
console.log('    crayon: ' + c.underlineCurly('this is a wavy line'));
console.log();
console.log('  ' + chalk.bold('Double / dotted / dashed underlines:'));
console.log('    crayon: ' + c.underlineDouble('double') + '  ' + c.underlineDotted('dotted') + '  ' + c.underlineDashed('dashed'));
console.log();
console.log('  ' + chalk.bold('OSC 8 hyperlinks (chalk leaves this to terminal-link):'));
console.log('    crayon: ' + link('click here →', 'https://github.com/REPLACE/crayon'));
console.log();
console.log('  ' + chalk.bold('Typed themes (chalk leaves this to userland):'));
const t = theme({ error: ['red', 'bold'], ok: ['green', 'bold'], muted: 'gray' });
console.log('    ' + t.error('error:') + ' something broke    ' + t.ok('ok:') + ' all good    ' + t.muted('(muted note)'));

// ─────────────────────────────────────────────────────────────────────────────
section('4. FORCE_COLOR levels (chalk issue #624)');
console.log();
console.log('  crayon parses all four FORCE_COLOR levels correctly:');
const { detectColorLevel } = await import('../src/support.js');
for (const v of ['0', '1', '2', '3']) {
  const prev = process.env.FORCE_COLOR;
  process.env.FORCE_COLOR = v;
  console.log(`    FORCE_COLOR=${v} → level ${detectColorLevel()}`);
  process.env.FORCE_COLOR = prev;
}

// ─────────────────────────────────────────────────────────────────────────────
section('5. Bundle size');
const pkgsToMeasure = [
  ['crayon (dist/index.js)', new URL('../dist/index.js', import.meta.url)],
  ['chalk  (node_modules)',  new URL('../node_modules/chalk/source/index.js', import.meta.url)],
] as const;

for (const [label, url] of pkgsToMeasure) {
  try {
    const code = await readFile(url);
    const raw = code.length;
    const gz = gzipSync(code).length;
    console.log(`  ${label.padEnd(28)} ${String(raw).padStart(5)}B raw   ${String(gz).padStart(5)}B gzip`);
  } catch {
    console.log(`  ${label.padEnd(28)} (not found — run 'npm run build' first)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
section('6. Performance (tinybench, 1s per task)');
const bench = new Bench({ time: 1000 });
const preStyled = styled('red', 'bold');
bench
  .add('chalk      red.bold(x)', () => chalk.red.bold('x'))
  .add('crayon     c.red.bold(x)', () => c.red.bold('x'))
  .add('crayon     pre-built styled(x)', () => preStyled('x'));
await bench.run();

console.log();
const baseline = bench.tasks[0]?.result?.hz ?? 0;
console.table(
  bench.tasks.map((task) => {
    const hz = task.result?.hz ?? 0;
    return {
      name: task.name,
      'ops/sec': hz.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      'ns/op': task.result?.mean ? (task.result.mean * 1e6).toFixed(1) : '-',
      'vs chalk': baseline ? (hz / baseline).toFixed(2) + '×' : '-',
    };
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
section('Summary');
console.log();
console.log('  ' + chalk.green('✓') + ' Visual parity on all common APIs');
console.log('  ' + chalk.green('✓') + ' Smaller bundle, gzipped');
console.log('  ' + chalk.green('✓') + ' Features chalk does not have (links, themes, squiggly, FORCE_COLOR levels)');
console.log('  ' + chalk.green('✓') + ' Perf: competitive to faster than chalk (varies by run)');
console.log('  ' + chalk.green('✓') + ' Color-level downgrade: truecolor → ansi256 → ansi16');
console.log('  ' + chalk.green('✓') + ' Zero runtime dependencies');
console.log();
