// Direction A — "Bold Acid"
// Palette : noir charbon + vert acide + blanc cassé
// Typo : serif éditoriale (display) + mono pour meta
// Interaction : swipe horizontal, numérotation visible, contrast fort

const A = {
  bg: '#0b0b0a',
  bgLight: '#f4f2ec',
  fg: '#f4f2ec',
  fgDark: '#0b0b0a',
  accent: '#c6ff3d',
  muted: 'rgba(244,242,236,0.5)',
  mutedLight: 'rgba(11,11,10,0.5)',
  serif: '"Instrument Serif", "Times New Roman", serif',
  mono: '"JetBrains Mono", "SF Mono", monospace',
  sans: '-apple-system, system-ui, sans-serif',
};

// Artwork placeholder — striped
function ArtworkA({ size, hue = 80, light = false }) {
  const c1 = `oklch(0.75 0.18 ${hue})`;
  const c2 = `oklch(0.55 0.22 ${hue + 30})`;
  return (
    <div style={{
      width: size, height: size, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      borderRadius: 2,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(45deg, transparent 0 12px, rgba(0,0,0,0.12) 12px 13px)`,
      }} />
      <div style={{
        position: 'absolute', left: 10, bottom: 8,
        fontFamily: A.mono, fontSize: 9, color: 'rgba(0,0,0,0.55)',
        letterSpacing: 1,
      }}>ART/{String(hue).padStart(3,'0')}</div>
    </div>
  );
}

// ── Library ──
function LibraryA({ dark = true }) {
  const bg = dark ? A.bg : A.bgLight;
  const fg = dark ? A.fg : A.fgDark;
  const muted = dark ? A.muted : A.mutedLight;
  const tracks = [
    { n: '01', t: 'Nightdriver', a: 'HAAI', d: '4:12', h: 140 },
    { n: '02', t: 'Ember', a: 'Four Tet', d: '5:48', h: 60 },
    { n: '03', t: 'Copper Bones', a: 'Overmono', d: '3:21', h: 260 },
    { n: '04', t: 'Slow River', a: 'Floating Points', d: '6:03', h: 200 },
    { n: '05', t: 'Low Beam', a: 'Skee Mask', d: '4:55', h: 320 },
    { n: '06', t: 'Parallax', a: 'Jon Hopkins', d: '5:14', h: 30 },
    { n: '07', t: 'Neon Rust', a: 'Objekt', d: '3:48', h: 110 },
  ];
  return (
    <div style={{ background: bg, minHeight: '100%', color: fg, paddingBottom: 120 }}>
      {/* header */}
      <div style={{ padding: '66px 24px 20px' }}>
        <div style={{ fontFamily: A.mono, fontSize: 10, color: muted, letterSpacing: 2 }}>
          LIBRARY / 247 TRACKS
        </div>
        <div style={{
          fontFamily: A.serif, fontSize: 56, lineHeight: 0.95,
          fontStyle: 'italic', marginTop: 12, letterSpacing: -1,
        }}>
          your<br/>sound.
        </div>
      </div>

      {/* filter pills */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 24px 24px', overflow: 'hidden' }}>
        {['ALL', 'RECENT', 'ALBUMS', 'LINKS'].map((p, i) => (
          <div key={p} style={{
            padding: '6px 14px', borderRadius: 999,
            fontFamily: A.mono, fontSize: 10, letterSpacing: 1.5,
            background: i === 0 ? A.accent : 'transparent',
            color: i === 0 ? A.fgDark : fg,
            border: `1px solid ${i === 0 ? A.accent : muted}`,
          }}>{p}</div>
        ))}
      </div>

      {/* tracks */}
      <div style={{ padding: '0 24px' }}>
        {tracks.map((tr, i) => (
          <div key={tr.n} style={{
            display: 'grid', gridTemplateColumns: '32px 44px 1fr auto',
            gap: 12, alignItems: 'center', padding: '14px 0',
            borderTop: `1px solid ${muted}`,
          }}>
            <div style={{ fontFamily: A.mono, fontSize: 11, color: muted }}>{tr.n}</div>
            <ArtworkA size={44} hue={tr.h} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: A.serif, fontSize: 20, lineHeight: 1.1, fontStyle: 'italic' }}>
                {tr.t}
              </div>
              <div style={{ fontFamily: A.mono, fontSize: 10, color: muted, marginTop: 3, letterSpacing: 1 }}>
                {tr.a.toUpperCase()}
              </div>
            </div>
            <div style={{ fontFamily: A.mono, fontSize: 11, color: muted }}>{tr.d}</div>
          </div>
        ))}
      </div>

      {/* mini player pinned */}
      <MiniPlayerA dark={dark} />
    </div>
  );
}

// ── Mini player ──
function MiniPlayerA({ dark = true, floating = true }) {
  const bg = dark ? '#161614' : '#fff';
  const fg = dark ? A.fg : A.fgDark;
  const muted = dark ? A.muted : A.mutedLight;
  return (
    <div style={{
      position: floating ? 'absolute' : 'relative',
      left: floating ? 16 : 0, right: floating ? 16 : 0,
      bottom: floating ? 40 : 0,
      background: bg, color: fg,
      borderRadius: 4, padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 12,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      boxShadow: dark ? 'none' : '0 10px 30px rgba(0,0,0,0.08)',
    }}>
      <ArtworkA size={42} hue={260} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: A.serif, fontSize: 16, fontStyle: 'italic', lineHeight: 1 }}>
          Copper Bones
        </div>
        <div style={{ fontFamily: A.mono, fontSize: 9, color: muted, letterSpacing: 1, marginTop: 4 }}>
          OVERMONO · 01:24 / 03:21
        </div>
        {/* progress bar */}
        <div style={{ marginTop: 6, height: 2, background: muted, borderRadius: 1 }}>
          <div style={{ width: '42%', height: '100%', background: A.accent }} />
        </div>
      </div>
      {/* play btn */}
      <div style={{
        width: 36, height: 36, borderRadius: 999, background: A.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="12" height="14" viewBox="0 0 12 14">
          <path d="M0 0l12 7-12 7V0z" fill={A.fgDark}/>
        </svg>
      </div>
    </div>
  );
}

// ── Player plein écran ──
function PlayerA({ dark = true }) {
  const bg = dark ? A.bg : A.bgLight;
  const fg = dark ? A.fg : A.fgDark;
  const muted = dark ? A.muted : A.mutedLight;
  const line = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  return (
    <div style={{ background: bg, height: '100%', color: fg, position: 'relative', overflow: 'hidden' }}>
      {/* top bar */}
      <div style={{
        position: 'absolute', top: 60, left: 24, right: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: A.mono, fontSize: 10, letterSpacing: 1.5, color: muted, zIndex: 2,
      }}>
        <div>▼ NOW PLAYING</div>
        <div>QUEUE · 12</div>
      </div>

      {/* big index */}
      <div style={{
        position: 'absolute', top: 110, left: 24,
        fontFamily: A.mono, fontSize: 11, color: muted, letterSpacing: 2,
      }}>
        TRACK 03 / 12
      </div>

      {/* artwork — offset, with frame */}
      <div style={{ padding: '140px 0 0 24px' }}>
        <div style={{ position: 'relative', width: 280, height: 280 }}>
          <div style={{
            position: 'absolute', inset: -12, border: `1px solid ${line}`,
          }} />
          <ArtworkA size={280} hue={260} />
          {/* label sticker */}
          <div style={{
            position: 'absolute', top: -16, right: -16,
            background: A.accent, color: A.fgDark,
            padding: '4px 8px', fontFamily: A.mono, fontSize: 10, letterSpacing: 1.5,
          }}>
            SIDE A
          </div>
        </div>
      </div>

      {/* title block */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{
          fontFamily: A.serif, fontSize: 46, fontStyle: 'italic',
          lineHeight: 0.95, letterSpacing: -1,
        }}>
          Copper<br/>Bones.
        </div>
        <div style={{
          fontFamily: A.mono, fontSize: 11, color: muted,
          letterSpacing: 2, marginTop: 14,
        }}>
          OVERMONO · GOOD LIES · 2023
        </div>
      </div>

      {/* waveform scrubber */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 36 }}>
          {Array.from({length: 64}).map((_, i) => {
            const h = 6 + Math.abs(Math.sin(i * 0.4) * 28) + (i % 3) * 2;
            const played = i < 27;
            return (
              <div key={i} style={{
                flex: 1, height: h,
                background: played ? A.accent : muted,
              }}/>
            );
          })}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 10,
          fontFamily: A.mono, fontSize: 10, color: muted, letterSpacing: 1,
        }}>
          <div>01:24</div>
          <div>-01:57</div>
        </div>
      </div>

      {/* controls */}
      <div style={{
        position: 'absolute', bottom: 70, left: 24, right: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill={fg}>
          <path d="M2 2h2v14H2zM6 9l10-7v14L6 9z"/>
        </svg>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={fg} strokeWidth="1.5">
          <path d="M2 4h8M6 1l4 3-4 3M12 10H4M8 7l-4 3 4 3"/>
        </svg>
        <div style={{
          width: 72, height: 72, borderRadius: 999, background: A.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 6, height: 22, background: A.fgDark }}/>
            <div style={{ width: 6, height: 22, background: A.fgDark }}/>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={fg} strokeWidth="1.5">
          <path d="M2 7h10M9 4l3 3-3 3"/>
        </svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill={fg}>
          <path d="M14 2h2v14h-2zM12 9L2 2v14l10-7z"/>
        </svg>
      </div>
    </div>
  );
}

Object.assign(window, { LibraryA, PlayerA, MiniPlayerA, ArtworkA });
