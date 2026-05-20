import { styles, type StyleName } from './styles.js';
import { colorLevel } from './support.js';

const ESC = '\x1b';

// Functional API. Mirrors the chainable nesting fix so nested calls survive
// resets correctly.
export function styled(...names: StyleName[]): (s: string) => string {
  const opens: string[] = [];
  const closes: string[] = [];
  for (const name of names) {
    const [o, cl] = styles[name];
    opens.push(`${ESC}[${o}m`);
    closes.push(`${ESC}[${cl}m`);
  }
  const open = opens.join('');
  const close = closes.slice().reverse().join('');
  return (s: string) => {
    if (colorLevel === 0) return s;
    if (s.indexOf(ESC) !== -1 && closes.length > 0) {
      for (let i = 0; i < closes.length; i++) {
        const closeCode = closes[i];
        const openCode = opens[i];
        if (closeCode && openCode) {
          s = s.split(closeCode).join(openCode);
        }
      }
    }
    return open + s + close;
  };
}
