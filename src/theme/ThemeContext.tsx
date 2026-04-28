import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PALETTES, Palette, resolve } from './palettes';

type Mode = 'light' | 'dark' | 'system';

type Ctx = {
  palette: Palette;
  paletteKey: Palette['key'];
  setPaletteKey: (k: Palette['key']) => void;
  dark: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  c: ReturnType<typeof resolve>;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteKey, setPaletteKey] = useState<Palette['key']>('crimsonNight');
  const [mode, setMode] = useState<Mode>('system');
  const system = useColorScheme() ?? 'light';
  const dark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const palette = PALETTES[paletteKey];
  const value = useMemo<Ctx>(
    () => ({ palette, paletteKey, setPaletteKey, dark, mode, setMode, c: resolve(palette, dark) }),
    [palette, paletteKey, dark, mode]
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error('useTheme outside ThemeProvider');
  return v;
}
