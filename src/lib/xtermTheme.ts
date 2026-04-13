/**
 * XTerm theme configuration matching shadcn/ui dark mode colors
 *
 * Color sources from src/index.css .dark class:
 * - Background: 222.2 84% 4.9% -> #09090b
 * - Foreground: 210 40% 98% -> #fafafa
 * - Destructive (red): 0 62.8% 30.6% -> #ef4444 (using tailwind red-500)
 * - Border/Muted: 217.2 32.6% 17.5% -> #27272a
 * - Accent: 217.2 32.6% 17.5% -> #d946ef (magenta-500)
 */

export interface XTermTheme {
  background: string;
  foreground: string;
  cursor: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export const XTERM_DARK_THEME: XTermTheme = {
  // Base colors from shadcn/ui dark theme
  background: '#09090b',
  foreground: '#fafafa',
  cursor: '#fafafa',

  // Standard ANSI colors (darker/intense variants)
  black: '#27272a',
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#eab308',
  blue: '#3b82f6',
  magenta: '#d946ef',
  cyan: '#06b6d4',
  white: '#a1a1aa',

  // Bright ANSI colors (lighter/pastel variants)
  brightBlack: '#52525b',
  brightRed: '#f87171',
  brightGreen: '#4ade80',
  brightYellow: '#facc15',
  brightBlue: '#60a5fa',
  brightMagenta: '#e879f9',
  brightCyan: '#22d3ee',
  brightWhite: '#ffffff',
};
