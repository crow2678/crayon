import { Bench } from 'tinybench';
import chalk from 'chalk';
import pc from 'picocolors';
import kleur from 'kleur';
import { c, styled } from '../src/index.js';


// Force color on so every library actually emits codes; otherwise piped output
// in CI makes the bench trivially fast for everyone.
process.env.FORCE_COLOR = '3';

const bench = new Bench({ time: 1000 });

bench
  .add('chalk      red.bold', () => chalk.red.bold('hello'))
  .add('picocolors red+bold', () => pc.red(pc.bold('hello')))
  .add('kleur      red().bold', () => kleur.red().bold('hello'))
  .add('crayon     red.bold (chain)', () => c.red.bold('hello'))
  .add('crayon     styled (fn)', () => styled('red', 'bold')('hello'));

const errStyled = styled('red', 'bold');
bench.add('crayon     pre-built styled', () => errStyled('hello'));

await bench.run();
console.table(
  bench.tasks.map((t) => ({
    name: t.name,
    'ops/sec': t.result?.hz.toFixed(0),
    'ns/op': t.result?.mean ? (t.result.mean * 1e6).toFixed(1) : null,
    samples: t.result?.samples.length,
  })),
);
