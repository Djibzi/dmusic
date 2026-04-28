// Direction B — palette variations
// Each palette is a {bg, bgDark, accent, accent2, ink, inkLight, name} object.
// We rewrite LibraryB / PlayerB / MiniPlayerB to take a `palette` prop
// so we can render multiple colorways from the same component.

const B_PALETTES = {
  hotRetro: { // original
    name: 'Hot Retro',
    bg: '#fbf3e7', bgDark: '#1a1510',
    accent: '#ff5a1f', accent2: '#e8432a',
    ink: '#1a1510', inkLight: '#fbf3e7',
  },
  oceanPop: {
    name: 'Ocean Pop',
    bg: '#eef6f5', bgDark: '#0d1a1f',
    accent: '#0080ff', accent2: '#ff3d8a',
    ink: '#0d1a1f', inkLight: '#eef6f5',
  },
  forestLime: {
    name: 'Forest Lime',
    bg: '#f2efe4', bgDark: '#14180e',
    accent: '#6fc21c', accent2: '#2d7a3a',
    ink: '#14180e', inkLight: '#f2efe4',
  },
  berryCream: {
    name: 'Berry Cream',
    bg: '#f7ecec', bgDark: '#1c0f14',
    accent: '#c22557', accent2: '#7a1e4a',
    ink: '#1c0f14', inkLight: '#f7ecec',
  },
  nightElectric: {
    name: 'Night Electric',
    bg: '#f4f2ec', bgDark: '#0f0f17',
    accent: '#7a4dff', accent2: '#26e0c6',
    ink: '#0f0f17', inkLight: '#f4f2ec',
  },
  sageDune: {
    // Palette 1 — ccd5ae, e9edc9, fefae0, faedcd, d4a373
    name: 'Sage Dune',
    bg: '#fefae0', bgDark: '#2a2416',
    accent: '#d4a373', accent2: '#ccd5ae',
    ink: '#2a2416', inkLight: '#fefae0',
  },
  rosewine: {
    // Palette 2 — f9dbbd, ffa5ab, da627d, a53860, 450920
    name: 'Rosewine',
    bg: '#f9dbbd', bgDark: '#450920',
    accent: '#da627d', accent2: '#a53860',
    ink: '#450920', inkLight: '#f9dbbd',
  },
  caramelWood: {
    // Palette 3 — ffedd8 → 583101, gradient caramel/brun
    name: 'Caramel Wood',
    bg: '#ffedd8', bgDark: '#583101',
    accent: '#a47148', accent2: '#6f4518',
    ink: '#583101', inkLight: '#ffedd8',
  },
  blueprint: {
    // Palette 4 — e3f2fd → 0d47a1, blues en escalier
    name: 'Blueprint',
    bg: '#e3f2fd', bgDark: '#0d47a1',
    accent: '#1976d2', accent2: '#42a5f5',
    ink: '#0d47a1', inkLight: '#e3f2fd',
  },
  crimsonNight: {
    // Palette 5 — 250902, 38040e, 640d14, 800e13, ad2831
    name: 'Crimson Night',
    bg: '#f4e3e3', bgDark: '#250902',
    accent: '#ad2831', accent2: '#800e13',
    ink: '#250902', inkLight: '#f4e3e3',
  },
  violetDusk: {
    // Palette 6 — 3e1f5b, 230b3e, a67fb7, 371c51, 1f1034
    name: 'Violet Dusk',
    bg: '#ece4f3', bgDark: '#1f1034',
    accent: '#a67fb7', accent2: '#3e1f5b',
    ink: '#230b3e', inkLight: '#ece4f3',
  },
  bubblegum: {
    // Palette 7 — ff0a54 → fae0e4, gradient rose
    name: 'Bubblegum',
    bg: '#fae0e4', bgDark: '#3d0514',
    accent: '#ff0a54', accent2: '#ff5c8a',
    ink: '#3d0514', inkLight: '#fae0e4',
  },
};

const BMETA = {
  mono: '"JetBrains Mono", monospace',
  sans: 'Inter, -apple-system, system-ui, sans-serif',
  display: '"Archivo Black", "Arial Black", sans-serif',
};

function ArtworkBT({ size, hue = 30 }) {
  const radius = Math.max(6, size * 0.06);
  return (
    <div style={{
      width: size, height: size, position: 'relative', overflow: 'hidden',
      borderRadius: radius,
      background: `radial-gradient(ellipse at 25% 25%, oklch(0.78 0.2 ${hue}), oklch(0.45 0.22 ${hue + 40}))`,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        position: 'absolute', top: '55%', left: '55%',
        width: size * 0.9, height: size * 0.9, borderRadius: '50%',
        background: `oklch(0.55 0.25 ${hue + 90})`,
        filter: `blur(${size * 0.12}px)`, opacity: 0.75,
      }}/>
      <div style={{
        position: 'absolute', top: '-20%', left: '-20%',
        width: size * 0.7, height: size * 0.7, borderRadius: '50%',
        background: `oklch(0.9 0.15 ${hue - 30})`,
        filter: `blur(${size * 0.14}px)`, opacity: 0.45,
      }}/>
    </div>
  );
}

function LibraryBT({ palette, dark = false }) {
  const P = palette;
  const bg = dark ? P.bgDark : P.bg;
  const fg = dark ? P.inkLight : P.ink;
  const card = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,16,0.55)';
  const artHue = parseInt(P.accent.slice(1), 16) % 360;

  const tracks = [
    { t: 'Morning Haze', a: 'Alice Chen', d: '3:42', tag: 'FAV', h: (artHue + 0) % 360 },
    { t: 'Gasoline', a: 'Haim', d: '4:01', tag: 'NEW', h: (artHue + 60) % 360 },
    { t: 'Topaz', a: 'Mk.gee', d: '2:58', tag: '', h: (artHue + 120) % 360 },
    { t: 'Foreign Field', a: 'Beach House', d: '5:22', tag: 'LINK', h: (artHue + 180) % 360 },
    { t: 'Soft Power', a: 'Charli XCX', d: '3:15', tag: 'FAV', h: (artHue + 240) % 360 },
    { t: 'Fade', a: 'Phoebe Bridgers', d: '4:47', tag: '', h: (artHue + 300) % 360 },
  ];

  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 120 }}>
      <div style={{ padding: '56px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: BMETA.display, fontSize: 28, letterSpacing: -0.5, lineHeight: 1 }}>DMUSIC</div>
          <div style={{
            width: 36, height: 36, borderRadius: 999, background: P.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontFamily: BMETA.sans,
          }}>+</div>
        </div>
        <div style={{
          fontFamily: BMETA.display, fontSize: 64, lineHeight: 0.9,
          marginTop: 28, letterSpacing: -2, textTransform: 'uppercase',
        }}>Library.</div>
        <div style={{ fontFamily: BMETA.mono, fontSize: 11, color: muted, marginTop: 8 }}>
          247 tracks · 18.3 hrs · updated 2m ago
        </div>
      </div>

      <div style={{ padding: '8px 20px 16px' }}>
        <div style={{
          background: P.accent, color: '#fff', padding: 16, borderRadius: 18,
          display: 'flex', gap: 14, alignItems: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.35 }}>
            <ArtworkBT size={140} hue={artHue + 120} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <div style={{ fontFamily: BMETA.mono, fontSize: 10, letterSpacing: 2, opacity: 0.9 }}>
              NOW PLAYING
            </div>
            <div style={{ fontFamily: BMETA.display, fontSize: 24, marginTop: 4, lineHeight: 1 }}>
              COPPER BONES
            </div>
            <div style={{ fontFamily: BMETA.sans, fontSize: 13, marginTop: 2, opacity: 0.9 }}>
              Overmono
            </div>
          </div>
          <div style={{
            position: 'relative', zIndex: 1,
            width: 44, height: 44, borderRadius: 999, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ display: 'flex', gap: 3 }}>
              <div style={{ width: 4, height: 14, background: P.accent }}/>
              <div style={{ width: 4, height: 14, background: P.accent }}/>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: BMETA.mono, fontSize: 10, color: muted, letterSpacing: 1.5, padding: '8px 4px',
        }}>
          <span>TRACKS</span><span>A→Z · RECENT · LINK</span>
        </div>
        <div style={{ background: card, borderRadius: 18, overflow: 'hidden',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          {tracks.map((tr, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < tracks.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
            }}>
              <ArtworkBT size={36} hue={tr.h} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: BMETA.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
                  {tr.t}
                </div>
                <div style={{ fontFamily: BMETA.sans, fontSize: 12, color: muted, marginTop: 2 }}>
                  {tr.a}
                </div>
              </div>
              {tr.tag && (
                <div style={{
                  padding: '3px 7px', borderRadius: 4,
                  fontFamily: BMETA.mono, fontSize: 9, letterSpacing: 1,
                  background: tr.tag === 'FAV' ? P.accent2 : tr.tag === 'NEW' ? P.accent : P.ink,
                  color: '#fff',
                }}>{tr.tag}</div>
              )}
              <div style={{ fontFamily: BMETA.mono, fontSize: 11, color: muted, minWidth: 32, textAlign: 'right' }}>
                {tr.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MiniPlayerBT palette={P} dark={dark} />
    </div>
  );
}

function MiniPlayerBT({ palette, dark = false, floating = true }) {
  const P = palette;
  const bg = dark ? 'rgba(255,255,255,0.06)' : '#fff';
  const fg = dark ? P.inkLight : P.ink;
  const artHue = parseInt(P.accent.slice(1), 16) % 360;
  return (
    <div style={{
      position: floating ? 'absolute' : 'relative',
      left: floating ? 12 : 0, right: floating ? 12 : 0,
      bottom: floating ? 34 : 0,
      background: bg, color: fg,
      borderRadius: 20, padding: 8,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: dark ? '0 14px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)'
                      : '0 14px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)',
      backdropFilter: dark ? 'blur(20px)' : 'none',
    }}>
      <ArtworkBT size={44} hue={artHue} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: BMETA.sans, fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>
          Copper Bones
        </div>
        <div style={{ fontFamily: BMETA.mono, fontSize: 10, color: P.accent, letterSpacing: 1, marginTop: 3 }}>
          01:24 ━━━━━━━━○────── 03:21
        </div>
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 999, background: P.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', gap: 3 }}>
          <div style={{ width: 4, height: 14, background: '#fff' }}/>
          <div style={{ width: 4, height: 14, background: '#fff' }}/>
        </div>
      </div>
    </div>
  );
}

function PlayerBT({ palette, dark = false }) {
  const P = palette;
  const bg = dark ? P.bgDark : P.bg;
  const fg = dark ? P.inkLight : P.ink;
  const muted = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,21,16,0.55)';
  const artHue = parseInt(P.accent.slice(1), 16) % 360;

  return (
    <div style={{ background: bg, height: '100%', color: fg, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 60, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: BMETA.sans, fontSize: 18, color: fg,
        }}>⌄</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: BMETA.mono, fontSize: 10, color: muted, letterSpacing: 2 }}>
            FROM LIBRARY
          </div>
          <div style={{ fontFamily: BMETA.sans, fontSize: 13, fontWeight: 600, marginTop: 2 }}>
            Late Night Mix
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: fg,
        }}>⋯</div>
      </div>

      {/* big square cover */}
      <div style={{
        position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)',
      }}>
        <div style={{
          boxShadow: `0 20px 50px ${P.accent}55, 0 4px 12px rgba(0,0,0,0.15)`,
          borderRadius: 20, overflow: 'hidden',
        }}>
          <ArtworkBT size={320} hue={artHue} />
        </div>
        <div style={{
          position: 'absolute', top: -14, right: -14,
          background: P.ink, color: P.inkLight,
          padding: '6px 10px', borderRadius: 4,
          fontFamily: BMETA.mono, fontSize: 10, letterSpacing: 1.5,
          transform: 'rotate(4deg)',
        }}>TRACK 03</div>
      </div>

      <div style={{ position: 'absolute', top: 470, left: 20, right: 20, textAlign: 'center' }}>
        <div style={{
          fontFamily: BMETA.display, fontSize: 40, letterSpacing: -1.5,
          lineHeight: 0.95, textTransform: 'uppercase',
        }}>Copper Bones</div>
        <div style={{ fontFamily: BMETA.sans, fontSize: 16, color: muted, marginTop: 6 }}>
          Overmono — <span style={{ color: P.accent, fontWeight: 600 }}>Good Lies</span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 580, left: 20, right: 20 }}>
        <div style={{
          position: 'relative', height: 6,
          background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: 3,
        }}>
          <div style={{ width: '42%', height: '100%', background: P.accent, borderRadius: 3 }}/>
          <div style={{
            position: 'absolute', left: '42%', top: '50%',
            width: 18, height: 18, borderRadius: 999, background: P.accent,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 2px 6px ${P.accent}77`,
          }}/>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 8,
          fontFamily: BMETA.mono, fontSize: 11, color: muted,
        }}><span>01:24</span><span>03:21</span></div>
      </div>

      <div style={{
        position: 'absolute', bottom: 110, left: 20, right: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={fg} strokeWidth="1.5">
          <path d="M3 5h16M3 11h10M3 17h16" strokeLinecap="round"/>
        </svg>
        <svg width="28" height="22" viewBox="0 0 28 22" fill={fg}>
          <path d="M14 2L0 11l14 9V2zM28 2l-14 9 14 9V2z"/>
        </svg>
        <div style={{
          width: 80, height: 80, borderRadius: 999, background: P.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 10px 30px ${P.accent}66`,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 7, height: 28, background: '#fff', borderRadius: 1 }}/>
            <div style={{ width: 7, height: 28, background: '#fff', borderRadius: 1 }}/>
          </div>
        </div>
        <svg width="28" height="22" viewBox="0 0 28 22" fill={fg}>
          <path d="M14 2l14 9-14 9V2zM0 2l14 9L0 20V2z"/>
        </svg>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={fg} strokeWidth="1.5">
          <path d="M3 5h10M18 2l3 3-3 3M19 5H8M3 17h10M18 14l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

Object.assign(window, { B_PALETTES, LibraryBT, PlayerBT, MiniPlayerBT, ArtworkBT });
