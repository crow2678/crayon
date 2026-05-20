// SGR codes. Tuple is [open, close]. Open may be a string for sub-parameter
// codes (e.g. underline variants); close is always numeric.
export const styles = {
  reset: [0, 0],

  // modifiers
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  underlineDouble: ['4:2', 24],
  underlineCurly: ['4:3', 24],
  underlineDotted: ['4:4', 24],
  underlineDashed: ['4:5', 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  overline: [53, 55],

  // foreground colors
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],

  // bright foreground colors
  blackBright: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],

  // background colors
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  bgGray: [100, 49],
  bgGrey: [100, 49],

  // bright background colors
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49],
} as const satisfies Record<string, readonly [number | string, number]>;

export type StyleName = keyof typeof styles;
