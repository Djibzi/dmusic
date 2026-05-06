import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PALETTES, Palette, resolve } from './palettes';
import * as Storage from '@/services/Storage';
import { usePlayerStore } from '@/store/playerStore';
import { setAppIcon, AppIconName } from 'dmusic-activity';

// Colors specifically tuned for the Live Activity glassmorphism. The in-app
// palette uses softer/muted tones (good on UI surfaces); the Live Activity
// needs richer, more saturated tones to read through the glass + against
// arbitrary lock-screen wallpapers.
const LIVE_ACTIVITY_COLORS: Record<Palette['key'], { accent: string; accent2: string; bgGlow: string }> = {
  crimsonNight: {
    accent: '#ad2831',
    accent2: '#800e13',
    bgGlow: '#640d14',
  },
  violetDusk: {
    accent: '#a149e0',
    accent2: '#5c2188',
    bgGlow: '#2d0e4d',
  },
};

export type Mode = 'light' | 'dark' | 'system';

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

const PALETTE_KEY = 'theme.palette';
const MODE_KEY = 'theme.mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteKey, setPaletteKeyState] = useState<Palette['key']>('crimsonNight');
  const [mode, setModeState] = useState<Mode>('system');
  const system = useColorScheme() ?? 'light';
  const dark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const palette = PALETTES[paletteKey];

  // Push Live Activity-tuned colors to playerStore (richer/more saturated than
  // the in-app palette for better readability through glassmorphism).
  useEffect(() => {
    const c = LIVE_ACTIVITY_COLORS[paletteKey];
    usePlayerStore.getState().setAccentColors(c.accent, c.accent2, c.bgGlow);
  }, [paletteKey]);

  // Hydrate from SQLite on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedPalette, savedMode] = await Promise.all([
          Storage.loadSetting(PALETTE_KEY),
          Storage.loadSetting(MODE_KEY),
        ]);
        if (savedPalette && savedPalette in PALETTES) {
          setPaletteKeyState(savedPalette as Palette['key']);
        }
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
          setModeState(savedMode);
        }
      } catch (e) {
        console.warn('[theme] hydrate failed', e);
      }
    })();
  }, []);

  const setPaletteKey = (k: Palette['key']) => {
    setPaletteKeyState(k);
    Storage.saveSetting(PALETTE_KEY, k).catch((e) => console.warn('[theme] save palette', e));
    // Switch home-screen icon. Done in the user-action setter (not a useEffect
    // on paletteKey) so the iOS confirmation alert only fires on a real switch
    // and not on app launch when the saved palette hydrates from SQLite.
    const iconName: AppIconName = k === 'violetDusk' ? 'Violet' : 'Crimson';
    setAppIcon(iconName);
  };

  const setMode = (m: Mode) => {
    setModeState(m);
    Storage.saveSetting(MODE_KEY, m).catch((e) => console.warn('[theme] save mode', e));
  };

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
