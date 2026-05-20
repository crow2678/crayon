import { styled } from './styled.js';
import type { StyleName } from './styles.js';

type ThemeValue = StyleName | readonly StyleName[];
type ThemeSpec = Record<string, ThemeValue>;

export interface ThemeOptions {
  /**
   * Style to use for keys not present in the spec. When set, looking up an
   * unknown key on the returned theme returns this styler instead of
   * `undefined`. Useful for dynamic categories (e.g. unknown log levels).
   *
   * @example
   *   const levels = theme(
   *     { info: 'cyan', error: ['red', 'bold'] },
   *     { default: 'gray' },
   *   );
   *   levels.error('boom');    // typed entry — bold red
   *   levels['unknown']('hi'); // fallback — gray
   */
  default?: ThemeValue;
}

type Built<T> = { [K in keyof T]: (s: string) => string };
type BuiltWithDefault<T> = Built<T> & Record<string, (s: string) => string>;

export function theme<T extends ThemeSpec>(
  spec: T,
  opts?: ThemeOptions,
): BuiltWithDefault<T> {
  const out: Built<T> = {} as Built<T>;
  for (const key of Object.keys(spec) as (keyof T)[]) {
    const v = spec[key];
    out[key] = Array.isArray(v)
      ? styled(...(v as StyleName[]))
      : styled(v as StyleName);
  }
  if (opts?.default === undefined) {
    return out as BuiltWithDefault<T>;
  }

  const fallback = Array.isArray(opts.default)
    ? styled(...(opts.default as StyleName[]))
    : styled(opts.default as StyleName);

  // Proxy fills in any missing string-key access with the fallback styler.
  return new Proxy(out, {
    get(target, prop) {
      if (typeof prop === 'symbol' || prop in target) {
        return Reflect.get(target, prop);
      }
      return fallback;
    },
    has(target, prop) {
      if (typeof prop === 'symbol') return Reflect.has(target, prop);
      return true;
    },
  }) as BuiltWithDefault<T>;
}
