import { c, styled, link, theme } from '../src/index.js';

console.log(c.red.bold('crayon'), 'v0.1');
console.log();

console.log(c.red('red'), c.green('green'), c.blue('blue'));
console.log(c.bgYellow.black(' warning '));
console.log(c.hex('#ff8800')('truecolor orange'));
console.log(c.ansi256(208)('ansi256 orange'));
console.log();

console.log(c.underline('underline'));
console.log(c.underlineCurly('squiggly (chalk doesn\'t have this)'));
console.log(c.underlineDouble('double'));
console.log(c.strikethrough('strike'));
console.log();

const t = theme({
  error: ['red', 'bold'],
  warn: 'yellow',
  ok: ['green', 'bold'],
  muted: 'gray',
});
console.log(t.error('error:'), 'something broke');
console.log(t.warn('warn:'), 'check your config');
console.log(t.ok('ok:'), 'all good');
console.log(t.muted('(this is muted)'));
console.log();

console.log(link('open the docs', 'https://example.com/docs'));
console.log();

const err = styled('red', 'bold');
for (let i = 0; i < 3; i++) console.log(err(`fast path call ${i}`));
