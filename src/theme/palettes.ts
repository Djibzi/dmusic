export type Palette = {
  key: 'crimsonNight' | 'violetDusk';
  name: string;
  bg: string;
  bgDark: string;
  surface: string;
  surfaceDark: string;
  accent: string;
  accent2: string;
  accent3: string;
  ink: string;
  inkLight: string;
  muted: string;
  mutedDark: string;
  artHues: number[];
};

export const PALETTES: Record<Palette['key'], Palette> = {
  crimsonNight: {
    key: 'crimsonNight',
    name: 'Crimson Night',
    bg: '#f4e3e3',
    bgDark: '#1a0503',
    surface: '#ffffff',
    surfaceDark: '#2a0a0a',
    accent: '#ad2831',
    accent2: '#800e13',
    accent3: '#640d14',
    ink: '#250902',
    inkLight: '#f4e3e3',
    muted: 'rgba(37,9,2,0.55)',
    mutedDark: 'rgba(244,227,227,0.55)',
    artHues: [12, 355, 20, 340, 5, 30],
  },
  violetDusk: {
    key: 'violetDusk',
    name: 'Violet Dusk',
    bg: '#ece4f3',
    bgDark: '#170828',
    surface: '#ffffff',
    surfaceDark: '#2a154a',
    accent: '#a67fb7',
    accent2: '#3e1f5b',
    accent3: '#230b3e',
    ink: '#1f1034',
    inkLight: '#ece4f3',
    muted: 'rgba(31,16,52,0.55)',
    mutedDark: 'rgba(236,228,243,0.6)',
    artHues: [290, 270, 310, 250, 330, 285],
  },
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolve(p: Palette, dark: boolean) {
  return {
    bg: dark ? p.bgDark : p.bg,
    fg: dark ? p.inkLight : p.ink,
    surface: dark ? p.surfaceDark : p.surface,
    muted: dark ? p.mutedDark : p.muted,
    hairline: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    chipBorder: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
    softFill: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    softFillAlt: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
    // Derived from palette so dark-mode overlays are purple in violetDusk, red in crimsonNight, etc.
    overlay: dark ? hexToRgba(p.bgDark, 0.7) : 'rgba(255,255,255,0.7)',
    miniOverlay: dark ? hexToRgba(p.surfaceDark, 0.75) : 'rgba(255,255,255,0.82)',
  };
}
