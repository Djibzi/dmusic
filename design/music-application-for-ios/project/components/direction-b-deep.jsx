// Direction B — Deep dive on Crimson Night + Violet Dusk
// Full screen suite: Library, Player (detailed with lyrics/queue tabs), Links screen,
// Mini-player, plus secondary states (Now-playing peeking, paste URL modal).

const BD_PALETTES = {
  crimsonNight: {
    name: 'Crimson Night',
    bg: '#f4e3e3', bgDark: '#1a0503',
    surface: '#ffffff', surfaceDark: '#2a0a0a',
    accent: '#ad2831', accent2: '#800e13', accent3: '#640d14',
    ink: '#250902', inkLight: '#f4e3e3',
    muted: 'rgba(37,9,2,0.55)', mutedDark: 'rgba(244,227,227,0.55)',
    artHues: [12, 355, 20, 340, 5, 30],
  },
  violetDusk: {
    name: 'Violet Dusk',
    bg: '#ece4f3', bgDark: '#170828',
    surface: '#ffffff', surfaceDark: '#2a154a',
    accent: '#a67fb7', accent2: '#3e1f5b', accent3: '#230b3e',
    ink: '#1f1034', inkLight: '#ece4f3',
    muted: 'rgba(31,16,52,0.55)', mutedDark: 'rgba(236,228,243,0.6)',
    artHues: [290, 270, 310, 250, 330, 285],
  },
};

const BD = {
  mono: '"JetBrains Mono", monospace',
  sans: 'Inter, -apple-system, system-ui, sans-serif',
  display: '"Archivo Black", "Arial Black", sans-serif',
  serif: '"Instrument Serif", serif',
};

// ---------- Artwork ----------
function Artwork({ size, hue, palette, variant = 0 }) {
  const radius = Math.max(6, size * 0.06);
  const P = palette;
  const variants = [
    { gradStart: [0.78, 0.2], gradEnd: [0.35, 0.22], blob: 0.55 },
    { gradStart: [0.68, 0.22], gradEnd: [0.3, 0.2], blob: 0.6 },
    { gradStart: [0.82, 0.17], gradEnd: [0.4, 0.25], blob: 0.5 },
  ];
  const v = variants[variant % variants.length];
  return (
    <div style={{
      width: size, height: size, position: 'relative', overflow: 'hidden',
      borderRadius: radius,
      background: `radial-gradient(ellipse at 25% 25%, oklch(${v.gradStart[0]} ${v.gradStart[1]} ${hue}), oklch(${v.gradEnd[0]} ${v.gradEnd[1]} ${hue + 30}))`,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        position: 'absolute', top: `${v.blob * 100}%`, left: `${v.blob * 100}%`,
        width: size * 0.9, height: size * 0.9, borderRadius: '50%',
        background: `oklch(0.5 0.27 ${hue + 90})`,
        filter: `blur(${size * 0.12}px)`, opacity: 0.75,
      }}/>
      <div style={{
        position: 'absolute', top: '-25%', left: '-25%',
        width: size * 0.7, height: size * 0.7, borderRadius: '50%',
        background: `oklch(0.88 0.18 ${hue - 30})`,
        filter: `blur(${size * 0.14}px)`, opacity: 0.5,
      }}/>
      {size >= 120 && (
        <div style={{
          position: 'absolute', left: 10, bottom: 8,
          fontFamily: BD.mono, fontSize: 9,
          color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5,
        }}>CLIP/{String(hue).padStart(3, '0')}</div>
      )}
    </div>
  );
}

// ---------- Status bar spacer (iOS frame already has notch) ----------
const PADTOP = 56;

// ---------- LIBRARY ----------
function Library({ palette, dark = false }) {
  const P = palette;
  const bg = dark ? P.bgDark : P.bg;
  const fg = dark ? P.inkLight : P.ink;
  const surface = dark ? P.surfaceDark : P.surface;
  const muted = dark ? P.mutedDark : P.muted;

  const tracks = [
    { t: 'Copper Bones', a: 'Overmono', d: '3:42', tag: 'FAV', h: P.artHues[0], v: 0 },
    { t: 'Gasoline', a: 'Haim', d: '4:01', tag: 'NEW', h: P.artHues[1], v: 1 },
    { t: 'Topaz', a: 'Mk.gee', d: '2:58', tag: '', h: P.artHues[2], v: 2 },
    { t: 'Foreign Field', a: 'Beach House', d: '5:22', tag: 'LINK', h: P.artHues[3], v: 0 },
    { t: 'Soft Power', a: 'Charli XCX', d: '3:15', tag: 'FAV', h: P.artHues[4], v: 1 },
    { t: 'Fade', a: 'Phoebe Bridgers', d: '4:47', tag: '', h: P.artHues[5], v: 2 },
  ];

  const tagBg = (tag) =>
    tag === 'FAV' ? P.accent2 :
    tag === 'NEW' ? P.accent :
    tag === 'LINK' ? P.accent3 : P.ink;

  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 130 }}>
      {/* Header */}
      <div style={{ padding: `${PADTOP}px 20px 10px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            fontFamily: BD.display, fontSize: 22, letterSpacing: -0.5,
          }}>DMUSIC</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={fg} strokeWidth="1.6">
                <circle cx="7" cy="7" r="5"/><path d="M14 14l-3.5-3.5"/>
              </svg>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 999, background: P.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 18, fontFamily: BD.sans,
            }}>+</div>
          </div>
        </div>
        <div style={{
          fontFamily: BD.display, fontSize: 64, lineHeight: 0.9,
          marginTop: 28, letterSpacing: -2, textTransform: 'uppercase',
        }}>Library.</div>
        <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, marginTop: 10, letterSpacing: 0.5 }}>
          247 TRACKS · 18.3 HRS · UPDATED 2M AGO
        </div>
      </div>

      {/* Now playing card */}
      <div style={{ padding: '12px 20px' }}>
        <div style={{
          background: P.accent, color: '#fff', padding: 18, borderRadius: 22,
          display: 'flex', gap: 14, alignItems: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.4 }}>
            <Artwork size={180} hue={P.artHues[0] + 60} palette={P} variant={1}/>
          </div>
          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <div style={{ fontFamily: BD.mono, fontSize: 10, letterSpacing: 2, opacity: 0.9 }}>
              ◉ NOW PLAYING
            </div>
            <div style={{ fontFamily: BD.display, fontSize: 26, marginTop: 6, lineHeight: 0.95, textTransform: 'uppercase' }}>
              Copper<br/>Bones
            </div>
            <div style={{ fontFamily: BD.sans, fontSize: 13, marginTop: 8, opacity: 0.9 }}>
              Overmono · <span style={{ fontStyle: 'italic', fontFamily: BD.serif, fontSize: 16 }}>Good Lies</span>
            </div>
          </div>
          <div style={{
            position: 'relative', zIndex: 1,
            width: 52, height: 52, borderRadius: 999, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill={P.accent}>
              <path d="M4 2l12 7-12 7V2z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Filters / chips */}
      <div style={{
        padding: '14px 20px 4px',
        display: 'flex', gap: 8, overflowX: 'hidden',
      }}>
        {['All', 'Tracks', 'Albums', 'Artists', 'Links'].map((f, i) => (
          <div key={f} style={{
            padding: '7px 14px', borderRadius: 999,
            fontFamily: BD.sans, fontSize: 12, fontWeight: 600,
            background: i === 0 ? P.ink : 'transparent',
            color: i === 0 ? P.inkLight : fg,
            border: i === 0 ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
            whiteSpace: 'nowrap',
          }}>{f}</div>
        ))}
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 1.5, padding: '8px 4px',
        }}>
          <span>TRACKS · 247</span><span>RECENT ↓</span>
        </div>
        <div style={{
          background: surface, borderRadius: 22, overflow: 'hidden',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          {tracks.map((tr, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < tracks.length - 1 ?
                `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
            }}>
              <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, width: 20 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <Artwork size={40} hue={tr.h} palette={P} variant={tr.v}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: BD.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
                  {tr.t}
                </div>
                <div style={{ fontFamily: BD.sans, fontSize: 12, color: muted, marginTop: 2 }}>
                  {tr.a}
                </div>
              </div>
              {tr.tag && (
                <div style={{
                  padding: '3px 7px', borderRadius: 4,
                  fontFamily: BD.mono, fontSize: 9, letterSpacing: 1,
                  background: tagBg(tr.tag), color: '#fff',
                }}>{tr.tag}</div>
              )}
              <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, minWidth: 32, textAlign: 'right' }}>
                {tr.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <TabBar palette={P} dark={dark} active="library"/>
      <MiniPlayer palette={P} dark={dark}/>
    </div>
  );
}

// ---------- TAB BAR ----------
function TabBar({ palette, dark, active }) {
  const P = palette;
  const fg = dark ? P.inkLight : P.ink;
  const muted = dark ? P.mutedDark : P.muted;
  const bg = dark ? 'rgba(26,5,3,0.7)' : 'rgba(255,255,255,0.7)';
  const tabs = [
    { k: 'library', label: 'Library', icon: <path d="M2 4h14v12H2zM5 7h8M5 10h8M5 13h5" strokeLinecap="round"/> },
    { k: 'player',  label: 'Player',  icon: <path d="M4 2l12 7-12 7V2z" strokeLinejoin="round"/> },
    { k: 'links',   label: 'Links',   icon: <path d="M7 11l-3 3a3 3 0 004 4l3-3M11 7l3-3a3 3 0 114 4l-3 3M7 13l6-6" strokeLinecap="round"/> },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 28, left: 12, right: 12,
      background: bg, borderRadius: 999, padding: '8px 8px',
      display: 'flex', gap: 4,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      boxShadow: dark
        ? '0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)'
        : '0 12px 40px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {tabs.map(t => {
        const on = t.k === active;
        return (
          <div key={t.k} style={{
            flex: 1, padding: '10px 0', borderRadius: 999,
            background: on ? P.ink : 'transparent',
            color: on ? P.inkLight : (on ? P.inkLight : fg),
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: BD.sans, fontSize: 12, fontWeight: 600,
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"
              stroke={on ? P.inkLight : fg} strokeWidth="1.6">
              {t.icon}
            </svg>
            {on && <span>{t.label}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ---------- MINI PLAYER ----------
function MiniPlayer({ palette, dark = false }) {
  const P = palette;
  const bg = dark ? 'rgba(42,10,10,0.75)' : 'rgba(255,255,255,0.82)';
  const fg = dark ? P.inkLight : P.ink;
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 96,
      background: bg, color: fg,
      borderRadius: 20, padding: 8,
      display: 'flex', alignItems: 'center', gap: 10,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      boxShadow: dark
        ? '0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)'
        : '0 8px 24px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      <Artwork size={44} hue={P.artHues[0]} palette={P} variant={0}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: BD.sans, fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>
          Copper Bones
        </div>
        <div style={{ fontFamily: BD.mono, fontSize: 10, color: P.accent, letterSpacing: 1, marginTop: 3 }}>
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

// ---------- PLAYER (full) ----------
function Player({ palette, dark = false, tab = 'now' }) {
  const P = palette;
  const bg = dark ? P.bgDark : P.bg;
  const fg = dark ? P.inkLight : P.ink;
  const muted = dark ? P.mutedDark : P.muted;

  return (
    <div style={{ background: bg, height: '100%', color: fg, position: 'relative', overflow: 'hidden' }}>
      {/* ambient glow from artwork */}
      <div style={{
        position: 'absolute', top: -80, left: -80, right: -80, height: 420,
        background: `radial-gradient(ellipse at center, ${P.accent}55, transparent 70%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>

      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: PADTOP, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: fg,
        }}>⌄</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 2 }}>
            FROM LIBRARY
          </div>
          <div style={{ fontFamily: BD.sans, fontSize: 13, fontWeight: 600, marginTop: 2 }}>
            Late Night Mix
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: fg,
          fontSize: 18, letterSpacing: 1,
        }}>⋯</div>
      </div>

      {/* Cover with swipe gesture dots */}
      <div style={{
        position: 'absolute', top: 110, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
      }}>
        {/* prev peek */}
        <div style={{ opacity: 0.35, transform: 'scale(0.6)', transformOrigin: 'center' }}>
          <Artwork size={220} hue={P.artHues[5]} palette={P} variant={2}/>
        </div>
        {/* main */}
        <div style={{ position: 'relative' }}>
          <div style={{
            boxShadow: `0 24px 60px ${P.accent}66, 0 6px 14px rgba(0,0,0,0.2)`,
            borderRadius: 22, overflow: 'hidden',
          }}>
            <Artwork size={260} hue={P.artHues[0]} palette={P} variant={0}/>
          </div>
          <div style={{
            position: 'absolute', top: -14, right: -14,
            background: P.ink, color: P.inkLight,
            padding: '6px 10px', borderRadius: 4,
            fontFamily: BD.mono, fontSize: 10, letterSpacing: 1.5,
            transform: 'rotate(4deg)',
          }}>TRACK 03</div>
        </div>
        {/* next peek */}
        <div style={{ opacity: 0.35, transform: 'scale(0.6)', transformOrigin: 'center' }}>
          <Artwork size={220} hue={P.artHues[1]} palette={P} variant={1}/>
        </div>
      </div>

      {/* swipe hint */}
      <div style={{
        position: 'absolute', top: 390, left: 0, right: 0, textAlign: 'center',
        fontFamily: BD.mono, fontSize: 9, color: muted, letterSpacing: 2,
      }}>
        ← SWIPE TO CHANGE TRACK →
      </div>

      {/* Title */}
      <div style={{ position: 'absolute', top: 420, left: 20, right: 20, textAlign: 'center' }}>
        <div style={{
          fontFamily: BD.display, fontSize: 38, letterSpacing: -1.5,
          lineHeight: 0.95, textTransform: 'uppercase',
        }}>Copper Bones</div>
        <div style={{ fontFamily: BD.sans, fontSize: 15, color: muted, marginTop: 8 }}>
          Overmono — <span style={{
            fontFamily: BD.serif, fontStyle: 'italic', fontSize: 18, color: P.accent,
          }}>Good Lies</span>
        </div>
      </div>

      {/* Waveform progress */}
      <div style={{ position: 'absolute', top: 530, left: 20, right: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 36 }}>
          {Array.from({ length: 60 }, (_, i) => {
            const played = i < 25;
            const h = 6 + Math.abs(Math.sin(i * 0.6) * 20 + Math.cos(i * 0.3) * 8);
            return (
              <div key={i} style={{
                flex: 1, height: h,
                background: played ? P.accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'),
                borderRadius: 1,
              }}/>
            );
          })}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 10,
          fontFamily: BD.mono, fontSize: 11, color: muted,
        }}><span>01:24</span><span>-01:57</span></div>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute', bottom: 180, left: 20, right: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={fg} strokeWidth="1.5">
          <path d="M3 5h10M18 2l3 3-3 3M19 5H8M3 17h10M18 14l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg width="28" height="22" viewBox="0 0 28 22" fill={fg}>
          <path d="M14 2L0 11l14 9V2zM28 2l-14 9 14 9V2z"/>
        </svg>
        <div style={{
          width: 82, height: 82, borderRadius: 999, background: P.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 12px 32px ${P.accent}88, inset 0 -4px 0 rgba(0,0,0,0.15)`,
        }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <div style={{ width: 7, height: 28, background: '#fff', borderRadius: 1 }}/>
            <div style={{ width: 7, height: 28, background: '#fff', borderRadius: 1 }}/>
          </div>
        </div>
        <svg width="28" height="22" viewBox="0 0 28 22" fill={fg}>
          <path d="M14 2l14 9-14 9V2zM0 2l14 9L0 20V2z"/>
        </svg>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={fg} strokeWidth="1.5">
          <path d="M11 3a8 8 0 108 8M11 3V0M11 3l3 2M11 3L8 5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Bottom row: volume + actions */}
      <div style={{
        position: 'absolute', bottom: 100, left: 20, right: 20,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill={fg}>
          <path d="M5 5l4-3v12L5 11H2V5h3z"/>
        </svg>
        <div style={{
          flex: 1, height: 4, borderRadius: 2,
          background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          position: 'relative',
        }}>
          <div style={{
            width: '60%', height: '100%', background: fg, borderRadius: 2,
          }}/>
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill={fg}>
          <path d="M12 2l5-2v16l-5-2V2zM14 6v8l3 1V5l-3 1z" fillOpacity="0.7"/>
        </svg>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={fg} strokeWidth="1.6">
            <path d="M3 6h14M3 10h14M3 14h10" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* bottom drag indicator */}
      <div style={{
        position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        width: 40, height: 4, borderRadius: 2, background: muted, opacity: 0.4,
      }}/>
    </div>
  );
}

// ---------- LINKS SCREEN ----------
function LinksScreen({ palette, dark = false }) {
  const P = palette;
  const bg = dark ? P.bgDark : P.bg;
  const fg = dark ? P.inkLight : P.ink;
  const surface = dark ? P.surfaceDark : P.surface;
  const muted = dark ? P.mutedDark : P.muted;

  const recent = [
    { title: 'Unreleased Demo v3', host: 'dropbox.com', time: '2m ago', ok: true, h: P.artHues[0] },
    { title: 'Live @ Boiler Room', host: 'soundcloud.com', time: '1h ago', ok: true, h: P.artHues[1] },
    { title: 'Mix — July radio', host: 'cdn.mixcloud.com', time: 'Yesterday', ok: true, h: P.artHues[2] },
    { title: 'Podcast 04.mp3', host: 'personalsite.fr', time: '3d ago', ok: true, h: P.artHues[3] },
    { title: 'youtu.be/xY2...', host: 'youtube.com', time: '3d ago', ok: false, h: P.artHues[4] },
  ];

  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 130 }}>
      {/* Header */}
      <div style={{ padding: `${PADTOP}px 20px 10px` }}>
        <div style={{
          fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 2,
        }}>◉ URL MODE</div>
        <div style={{
          fontFamily: BD.display, fontSize: 56, lineHeight: 0.9,
          marginTop: 10, letterSpacing: -2, textTransform: 'uppercase',
        }}>Play from<br/>a <span style={{ color: P.accent }}>link.</span></div>
        <div style={{
          fontFamily: BD.sans, fontSize: 14, color: muted, marginTop: 14, lineHeight: 1.45,
          maxWidth: 280,
        }}>
          Paste a direct audio URL and DMusic streams it instantly — background-ready, lock-screen aware.
        </div>
      </div>

      {/* Paste field */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{
          background: surface, borderRadius: 18, padding: 14,
          border: `2px dashed ${P.accent}`,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: BD.mono, fontSize: 12, color: fg,
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={P.accent} strokeWidth="1.8">
              <path d="M7 11l-3 3a3 3 0 004 4l3-3M11 7l3-3a3 3 0 114 4l-3 3M7 13l6-6" strokeLinecap="round"/>
            </svg>
            <span style={{ color: muted }}>https://</span>
            <span>example.com/track.mp3</span>
            <span style={{ width: 2, height: 14, background: P.accent, marginLeft: 2,
              animation: 'bdblink 1s steps(2) infinite' }}/>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              flex: 1, background: P.accent, color: '#fff',
              padding: '12px 0', borderRadius: 12, textAlign: 'center',
              fontFamily: BD.display, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase',
            }}>▶ Play now</div>
            <div style={{
              background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              color: fg, padding: '12px 16px', borderRadius: 12,
              fontFamily: BD.sans, fontSize: 13, fontWeight: 600,
            }}>+ Save</div>
          </div>
        </div>
        <style>{`@keyframes bdblink { 50% { opacity: 0; } }`}</style>
      </div>

      {/* Compatibility hint */}
      <div style={{
        padding: '8px 20px',
        display: 'flex', gap: 6, flexWrap: 'wrap',
      }}>
        {[
          { l: '.mp3', ok: true },
          { l: '.m4a', ok: true },
          { l: '.ogg', ok: true },
          { l: 'YouTube', ok: false },
          { l: 'Spotify', ok: false },
        ].map(c => (
          <div key={c.l} style={{
            padding: '4px 10px', borderRadius: 999,
            fontFamily: BD.mono, fontSize: 10, letterSpacing: 0.5,
            background: c.ok ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent',
            color: c.ok ? fg : muted,
            border: c.ok ? 'none' : `1px dashed ${muted}`,
            textDecoration: c.ok ? 'none' : 'line-through',
          }}>{c.l}</div>
        ))}
      </div>

      {/* History */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 1.5, padding: '8px 4px',
        }}>
          <span>RECENT LINKS · {recent.length}</span><span>CLEAR</span>
        </div>
        <div style={{
          background: surface, borderRadius: 22, overflow: 'hidden',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          {recent.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < recent.length - 1 ?
                `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
              opacity: r.ok ? 1 : 0.55,
            }}>
              <div style={{ position: 'relative' }}>
                <Artwork size={40} hue={r.h} palette={P} variant={i % 3}/>
                {!r.ok && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 6,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" stroke="#fff" strokeWidth="1.8" fill="none">
                      <circle cx="8" cy="8" r="6"/><path d="M4 12l8-8"/>
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: BD.sans, fontSize: 14, fontWeight: 600, lineHeight: 1.2,
                  textDecoration: r.ok ? 'none' : 'line-through',
                }}>{r.title}</div>
                <div style={{
                  fontFamily: BD.mono, fontSize: 10, color: muted,
                  marginTop: 3, letterSpacing: 0.3,
                }}>{r.host} · {r.time}</div>
              </div>
              {r.ok ? (
                <div style={{
                  width: 34, height: 34, borderRadius: 999, background: P.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff"><path d="M3 1l7 5-7 5V1z"/></svg>
                </div>
              ) : (
                <div style={{
                  padding: '3px 7px', borderRadius: 4,
                  fontFamily: BD.mono, fontSize: 9, letterSpacing: 1,
                  background: P.accent3, color: '#fff',
                }}>DRM</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <TabBar palette={P} dark={dark} active="links"/>
      <MiniPlayer palette={P} dark={dark}/>
    </div>
  );
}

Object.assign(window, { BD_PALETTES, Library, Player, LinksScreen, MiniPlayer, TabBar, Artwork });
