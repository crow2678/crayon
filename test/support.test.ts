import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectColorLevel } from '../src/index.js';

// detectColorLevel reads process.env and process.argv live, so each test can
// stub them and call directly. Snapshot/restore wraps the mutation safely.
let savedEnv: Record<string, string | undefined>;
let savedArgv: string[];

const KEYS = [
  'NO_COLOR', 'FORCE_COLOR', 'TERM', 'COLORTERM', 'TERM_PROGRAM',
  'WT_SESSION', 'CI', 'GITHUB_ACTIONS', 'GITLAB_CI', 'BUILDKITE',
  'CIRCLECI', 'ConEmuANSI',
];

beforeEach(() => {
  savedEnv = {};
  for (const k of KEYS) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
  savedArgv = process.argv;
  process.argv = ['node', 'test'];
});

afterEach(() => {
  for (const k of KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  process.argv = savedArgv;
});

describe('detectColorLevel — env precedence', () => {
  it('NO_COLOR forces 0 regardless of other signals', () => {
    process.env.NO_COLOR = '1';
    process.env.FORCE_COLOR = '3';
    process.env.COLORTERM = 'truecolor';
    expect(detectColorLevel({ isTTY: true })).toBe(0);
  });

  it('FORCE_COLOR=0..3 maps cleanly', () => {
    for (const [val, expected] of [['0', 0], ['1', 1], ['2', 2], ['3', 3]] as const) {
      process.env.FORCE_COLOR = val;
      expect(detectColorLevel({ isTTY: true })).toBe(expected);
    }
  });
});

describe('detectColorLevel — CLI flags', () => {
  it('--no-color forces 0', () => {
    process.argv = ['node', 'test', '--no-color'];
    process.env.FORCE_COLOR = '3';
    expect(detectColorLevel({ isTTY: true })).toBe(0);
  });

  it('--color enables level 1', () => {
    process.argv = ['node', 'test', '--color'];
    expect(detectColorLevel({ isTTY: true })).toBe(1);
  });

  it('--color=256 enables level 2', () => {
    process.argv = ['node', 'test', '--color=256'];
    expect(detectColorLevel({ isTTY: true })).toBe(2);
  });

  it('--color=truecolor enables level 3', () => {
    process.argv = ['node', 'test', '--color=truecolor'];
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('--color=16m enables level 3', () => {
    process.argv = ['node', 'test', '--color=16m'];
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('CLI flag overrides FORCE_COLOR', () => {
    process.argv = ['node', 'test', '--color=256'];
    process.env.FORCE_COLOR = '1';
    expect(detectColorLevel({ isTTY: true })).toBe(2);
  });
});

describe('detectColorLevel — terminal detection', () => {
  it('Windows Terminal (WT_SESSION) → truecolor', () => {
    process.env.WT_SESSION = 'abc-def';
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('iTerm.app → truecolor', () => {
    process.env.TERM_PROGRAM = 'iTerm.app';
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('VS Code → truecolor', () => {
    process.env.TERM_PROGRAM = 'vscode';
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('Ghostty → truecolor', () => {
    process.env.TERM_PROGRAM = 'ghostty';
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('Apple Terminal → 256-color', () => {
    process.env.TERM_PROGRAM = 'Apple_Terminal';
    expect(detectColorLevel({ isTTY: true })).toBe(2);
  });

  it('xterm-256color → 256-color', () => {
    process.env.TERM = 'xterm-256color';
    expect(detectColorLevel({ isTTY: true })).toBe(2);
  });

  it('TERM=dumb → 0', () => {
    process.env.TERM = 'dumb';
    expect(detectColorLevel({ isTTY: true })).toBe(0);
  });

  it('non-TTY stdout → 0', () => {
    expect(detectColorLevel({ isTTY: false })).toBe(0);
  });
});

describe('detectColorLevel — CI detection', () => {
  it('GitHub Actions → truecolor', () => {
    process.env.CI = 'true';
    process.env.GITHUB_ACTIONS = 'true';
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('GitLab CI → truecolor', () => {
    process.env.CI = 'true';
    process.env.GITLAB_CI = 'true';
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('Buildkite → truecolor', () => {
    process.env.CI = 'true';
    process.env.BUILDKITE = 'true';
    expect(detectColorLevel({ isTTY: true })).toBe(3);
  });

  it('CircleCI (unknown CI) → 1', () => {
    process.env.CI = 'true';
    process.env.CIRCLECI = 'true';
    expect(detectColorLevel({ isTTY: true })).toBe(1);
  });

  it('Generic CI=true (no specific provider) → 1', () => {
    process.env.CI = 'true';
    expect(detectColorLevel({ isTTY: true })).toBe(1);
  });
});
