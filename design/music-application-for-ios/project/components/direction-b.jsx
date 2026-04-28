// Direction B — "Hot Retro"
// Palette : crème + orange brûlé + rouge tomate, très chaud
// Typo : grotesk rond (Söhne-like) + display condensé
// Interaction : artwork rotatif vinyle, tags colorés, layout dense type ticket

const B = {
  bg: '#fbf3e7',
  bgDark: '#1a1510',
  accent: '#ff5a1f',
  accent2: '#e8432a',
  ink: '#1a1510',
  inkLight: '#fbf3e7',
  mono: '"JetBrains Mono", monospace',
  sans: 'Inter, -apple-system, system-ui, sans-serif',
  display: '"Archivo Black", "Arial Black", sans-serif',
};

function ArtworkB({ size, hue = 30, rotate = 0 }) {
  // Square cover — placeholder for clip/artwork with painterly gradient
  const radius = Math.max(6, size * 0.06);
  return (
    <div style={{
      width: size, height: size, position: 'relative', overflow: 'hidden',
      borderRadius: radius,
      background: `radial-gradient(ellipse at 25% 25%, oklch(0.78 0.2 ${hue}), oklch(0.45 0.22 ${hue + 40}))`,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
    }}>
      {/* painterly blob accent */}
      <div style={{
        position: 'absolute', top: '55%', left: '55%',
        width: size * 0.9, height: size * 0.9, borderRadius: '50%',
        background: `oklch(0.55 0.25 ${hue + 90})`,
        filter: `blur(${size * 0.12}px)`, opacity: 0.75,
      }}/>
      {/* soft corner highlight */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-20%',
        width: size * 0.7, height: size * 0.7, borderRadius: '50%',
        background: `oklch(0.9 0.15 ${hue - 30})`,
        filter: `blur(${size * 0.14}px)`, opacity: 0.45,
      }}/>
      {/* subtle placeholder tag */}
      {size >= 120 && (
        <div style={{
          position: 'absolute', left: 10, bottom: 8,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
          color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5,
        }}>CLIP/{String(hue).padStart(3,'0')}</div>
      )}
    </div>
  );
}

function LibraryB({ dark = false }) {
  const bg = dark ? B.bgDark : B.bg;
  const fg = dark ? B.inkLight : B.ink;
  const card = dark ? '#241c14' : '#fff';
  const muted = dark ? 'rgba(251,243,231,0.6)' : 'rgba(26,21,16,0.55)';

  const tracks = [
    { t: 'Morning Haze', a: 'Alice Chen', d: '3:42', tag: 'FAV', h: 40 },
    { t: 'Gasoline', a: 'Haim', d: '4:01', tag: 'NEW', h: 20 },
    { t: 'Topaz', a: 'Mk.gee', d: '2:58', tag: '', h: 60 },
    { t: 'Foreign Field', a: 'Beach House', d: '5:22', tag: 'LINK', h: 340 },
    { t: 'Soft Power', a: 'Charli XCX', d: '3:15', tag: 'FAV', h: 15 },
    { t: 'Fade', a: 'Phoebe Bridgers', d: '4:47', tag: '', h: 260 },
  ];

  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 120 }}>
      {/* header */}
      <div style={{ padding: '56px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            fontFamily: B.display, fontSize: 28, letterSpacing: -0.5, lineHeight: 1,
          }}>DMUSIC</div>
          <div style={{
            width: 36, height: 36, borderRadius: 999, background: B.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontFamily: B.sans,
          }}>+</div>
        </div>
        <div style={{
          fontFamily: B.display, fontSize: 64, lineHeight: 0.9,
          marginTop: 28, letterSpacing: -2,
          textTransform: 'uppercase',
        }}>
          Library.
        </div>
        <div style={{ fontFamily: B.mono, fontSize: 11, color: muted, marginTop: 8 }}>
          247 tracks · 18.3 hrs · updated 2m ago
        </div>
      </div>

      {/* now playing card */}
      <div style={{ padding: '8px 20px 16px' }}>
        <div style={{
          background: B.accent, color: '#fff', padding: 16, borderRadius: 18,
          display: 'flex', gap: 14, alignItems: 'center', position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20, opacity: 0.3,
          }}>
            <ArtworkB size={140} hue={30} rotate={0} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <div style={{ fontFamily: B.mono, fontSize: 10, letterSpacing: 2, opacity: 0.9 }}>
              NOW PLAYING
            </div>
            <div style={{
              fontFamily: B.display, fontSize: 24, marginTop: 4, lineHeight: 1,
            }}>COPPER BONES</div>
            <div style={{ fontFamily: B.sans, fontSize: 13, marginTop: 2, opacity: 0.9 }}>
              Overmono
            </div>
          </div>
          <div style={{
            position: 'relative', zIndex: 1,
            width: 44, height: 44, borderRadius: 999, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ display: 'flex', gap: 3 }}>
              <div style={{ width: 4, height: 14, background: B.accent }}/>
              <div style={{ width: 4, height: 14, background: B.accent }}/>
            </div>
          </div>
        </div>
      </div>

      {/* tracks */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: B.mono, fontSize: 10, color: muted, letterSpacing: 1.5,
          padding: '8px 4px',
        }}>
          <span>TRACKS</span>
          <span>A→Z · RECENT · LINK</span>
        </div>
        <div style={{ background: card, borderRadius: 18, overflow: 'hidden' }}>
          {tracks.map((tr, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < tracks.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
            }}>
              <ArtworkB size={36} hue={tr.h} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: B.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
                  {tr.t}
                </div>
                <div style={{ fontFamily: B.sans, fontSize: 12, color: muted, marginTop: 2 }}>
                  {tr.a}
                </div>
              </div>
              {tr.tag && (
                <div style={{
                  padding: '3px 7px', borderRadius: 4,
                  fontFamily: B.mono, fontSize: 9, letterSpacing: 1,
                  background: tr.tag === 'FAV' ? B.accent2
                    : tr.tag === 'NEW' ? '#2a9d3f'
                    : B.ink,
                  color: '#fff',
                }}>{tr.tag}</div>
              )}
              <div style={{ fontFamily: B.mono, fontSize: 11, color: muted, minWidth: 32, textAlign: 'right' }}>
                {tr.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MiniPlayerB dark={dark} />
    </div>
  );
}

function MiniPlayerB({ dark = false, floating = true }) {
  const bg = dark ? '#241c14' : '#fff';
  const fg = dark ? B.inkLight : B.ink;
  return (
    <div style={{
      position: floating ? 'absolute' : 'relative',
      left: floating ? 12 : 0, right: floating ? 12 : 0,
      bottom: floating ? 34 : 0,
      background: bg, color: fg,
      borderRadius: 20, padding: 8,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 14px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.05)',
    }}>
      <ArtworkB size={44} hue={30} rotate={0} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: B.sans, fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>
          Copper Bones
        </div>
        <div style={{ fontFamily: B.mono, fontSize: 10, color: B.accent, letterSpacing: 1, marginTop: 3 }}>
          01:24 ━━━━━━━━○────── 03:21
        </div>
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 999, background: B.accent,
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

function PlayerB({ dark = false }) {
  const bg = dark ? B.bgDark : B.bg;
  const fg = dark ? B.inkLight : B.ink;
  const muted = dark ? 'rgba(251,243,231,0.6)' : 'rgba(26,21,16,0.55)';

  return (
    <div style={{ background: bg, height: '100%', color: fg, position: 'relative', overflow: 'hidden' }}>
      {/* top */}
      <div style={{
        position: 'absolute', top: 60, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: B.sans, fontSize: 18,
        }}>⌄</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: B.mono, fontSize: 10, color: muted, letterSpacing: 2 }}>
            FROM LIBRARY
          </div>
          <div style={{ fontFamily: B.sans, fontSize: 13, fontWeight: 600, marginTop: 2 }}>
            Late Night Mix
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>⋯</div>
      </div>

      {/* big square cover */}
      <div style={{
        position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)',
      }}>
        <div style={{
          boxShadow: `0 20px 50px rgba(255,90,31,0.35), 0 4px 12px rgba(26,21,16,0.15)`,
          borderRadius: 20, overflow: 'hidden',
        }}>
          <ArtworkB size={320} hue={30} />
        </div>
        {/* corner sticker */}
        <div style={{
          position: 'absolute', top: -14, right: -14,
          background: B.ink, color: B.bg,
          padding: '6px 10px', borderRadius: 4,
          fontFamily: B.mono, fontSize: 10, letterSpacing: 1.5,
          transform: 'rotate(4deg)',
        }}>
          TRACK 03
        </div>
      </div>

      {/* title block */}
      <div style={{ position: 'absolute', top: 470, left: 20, right: 20, textAlign: 'center' }}>
        <div style={{
          fontFamily: B.display, fontSize: 40, letterSpacing: -1.5,
          lineHeight: 0.95, textTransform: 'uppercase',
        }}>
          Copper Bones
        </div>
        <div style={{
          fontFamily: B.sans, fontSize: 16, color: muted, marginTop: 6,
        }}>
          Overmono — <span style={{ color: B.accent, fontWeight: 600 }}>Good Lies</span>
        </div>
      </div>

      {/* progress */}
      <div style={{ position: 'absolute', top: 580, left: 20, right: 20 }}>
        <div style={{ position: 'relative', height: 6, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: 3 }}>
          <div style={{ width: '42%', height: '100%', background: B.accent, borderRadius: 3 }}/>
          <div style={{
            position: 'absolute', left: '42%', top: '50%',
            width: 18, height: 18, borderRadius: 999, background: B.accent,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 2px 6px rgba(255,90,31,0.4)',
          }}/>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 8,
          fontFamily: B.mono, fontSize: 11, color: muted,
        }}>
          <span>01:24</span><span>03:21</span>
        </div>
      </div>

      {/* controls */}
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
          width: 80, height: 80, borderRadius: 999, background: B.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(255,90,31,0.4)',
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

Object.assign(window, { LibraryB, PlayerB, MiniPlayerB, ArtworkB });
