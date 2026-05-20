// Remove ANSI escape sequences from a string. Useful for measuring visible
// length, writing styled output to a non-ANSI sink, or string comparisons in
// tests.
//
// Covers CSI, OSC (with BEL or ST terminators), single-char escapes.
// Pattern modeled on chalk-org's ansi-regex@6.

const PATTERN =
  '[\\u001b\\u009b][[\\]()#;?]*' +
  '(?:' +
    '(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?' +
    '(?:\\u0007|\\u001b\\u005c|\\u009c)' +
    ')' +
    '|' +
    '(?:(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~])' +
  ')';

const ANSI_REGEX = new RegExp(PATTERN, 'g');

export function stripAnsi(str: string): string {
  return str.replace(ANSI_REGEX, '');
}
