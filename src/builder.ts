import { styles, type StyleName } from './styles.js';
import { colorLevel } from './support.js';
import {
  fgFromRgb,
  bgFromRgb,
  fgFromAnsi256,
  bgFromAnsi256,
  hexToRgb,
} from './colors.js';

export type ColorLevel = 0 | 1 | 2 | 3;

export interface CrayonOptions {
  /** Color level (0=none, 1=16, 2=256, 3=truecolor). Defaults to detected. */
  level?: ColorLevel;
}

export type StyleFn = ((str: string) => string) & {
  readonly [K in StyleName]: StyleFn;
} & {
  rgb: (r: number, g: number, b: number) => StyleFn;
  hex: (hex: string) => StyleFn;
  bgRgb: (r: number, g: number, b: number) => StyleFn;
  bgHex: (hex: string) => StyleFn;
  ansi256: (n: number) => StyleFn;
  bgAnsi256: (n: number) => StyleFn;
};

interface BuilderState {
  _opens: readonly string[];
  _closes: readonly string[];
}

const ESC = '\x1b';
const CLOSE_FG = `${ESC}[39m`;
const CLOSE_BG = `${ESC}[49m`;

// One builder tree per level. Cached so repeated Crayon({ level }) calls
// return the same root and share the chainable cache (which builds up as
// styles are accessed).
const instances: Partial<Record<ColorLevel, StyleFn>> = {};

function createCrayon(level: ColorLevel): StyleFn {
  const proto: Record<string, unknown> = Object.create(Function.prototype);

  function make(
    opens: readonly string[],
    closes: readonly string[],
  ): StyleFn {
    const open = opens.join('');
    const close =
      closes.length > 0 ? closes.slice().reverse().join('') : '';

    const fn = ((str: string) => {
      if (level === 0) return str;
      if (str.indexOf(ESC) !== -1 && closes.length > 0) {
        for (let i = 0; i < closes.length; i++) {
          const closeCode = closes[i];
          const openCode = opens[i];
          if (closeCode && openCode) {
            str = str.split(closeCode).join(openCode);
          }
        }
      }
      return open + str + close;
    }) as unknown as StyleFn & BuilderState;

    Object.defineProperty(fn, '_opens', { value: opens });
    Object.defineProperty(fn, '_closes', { value: closes });
    Object.setPrototypeOf(fn, proto);
    return fn;
  }

  for (const name of Object.keys(styles) as StyleName[]) {
    const [o, cl] = styles[name];
    const oc = `${ESC}[${o}m`;
    const cc = `${ESC}[${cl}m`;
    Object.defineProperty(proto, name, {
      get(this: BuilderState) {
        const child = make(
          [...this._opens, oc],
          [...this._closes, cc],
        );
        Object.defineProperty(this, name, { value: child });
        return child;
      },
      configurable: true,
    });
  }

  function defineMethod(
    name: string,
    value: (...args: never[]) => StyleFn,
  ): void {
    Object.defineProperty(proto, name, { value });
  }

  defineMethod('rgb', function (this: BuilderState, r: number, g: number, b: number) {
    return make([...this._opens, fgFromRgb(r, g, b, level)], [...this._closes, CLOSE_FG]);
  } as never);
  defineMethod('hex', function (this: BuilderState, hex: string) {
    const [r, g, b] = hexToRgb(hex);
    return make([...this._opens, fgFromRgb(r, g, b, level)], [...this._closes, CLOSE_FG]);
  } as never);
  defineMethod('bgRgb', function (this: BuilderState, r: number, g: number, b: number) {
    return make([...this._opens, bgFromRgb(r, g, b, level)], [...this._closes, CLOSE_BG]);
  } as never);
  defineMethod('bgHex', function (this: BuilderState, hex: string) {
    const [r, g, b] = hexToRgb(hex);
    return make([...this._opens, bgFromRgb(r, g, b, level)], [...this._closes, CLOSE_BG]);
  } as never);
  defineMethod('ansi256', function (this: BuilderState, n: number) {
    return make([...this._opens, fgFromAnsi256(n, level)], [...this._closes, CLOSE_FG]);
  } as never);
  defineMethod('bgAnsi256', function (this: BuilderState, n: number) {
    return make([...this._opens, bgFromAnsi256(n, level)], [...this._closes, CLOSE_BG]);
  } as never);

  return make([], []);
}

function getCrayon(level: ColorLevel): StyleFn {
  return (instances[level] ??= createCrayon(level));
}

/**
 * Factory for a chainable styler bound to a specific color level.
 * Useful for dual-output (terminal + log file) or testing.
 *
 * @example
 *   const plain = Crayon({ level: 0 });
 *   fs.writeFileSync('log', plain.red.bold('error'));  // plain text
 */
export function Crayon(opts: CrayonOptions = {}): StyleFn {
  return getCrayon(opts.level ?? colorLevel);
}

/** Auto-detected chainable (uses detected color level). */
export const c: StyleFn = getCrayon(colorLevel);
/** Alias of {@link c}. */
export const crayon: StyleFn = c;
