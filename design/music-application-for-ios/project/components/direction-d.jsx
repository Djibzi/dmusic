// Direction D — "Soft Zine"
// Palette : crème pêche + lavande + prune profond (tons doux et vibrants à la fois)
// Typo : serif d'affichage très grosse + grotesk doux
// Interaction : cartes arrondies XL, blur glassmorphism, artwork en grand, layout éditorial zine

const D = {
  bg: '#f3e9de',
  bgDark: '#1c1424',
  accent: '#6a3cff',
  accent2: '#ff7ab8',
  accent3: '#ffd66b',
  ink: '#1c1424',
  inkLight: '#fbf6ef',
  muted: 'rgba(28,20,36,0.55)',
  mutedDark: 'rgba(251,246,239,0.6)',
  serif: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  sans: 'Inter, -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

function ArtworkD({ size, hue = 280, shape = 'square' }) {
  const bg = `radial-gradient(ellipse at 30% 30%, oklch(0.75 0.2 ${hue}), oklch(0.4 0.22 ${hue + 40}))`;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: shape === 'circle' ? '50%' : size * 0.06,
      background: bg, position: 'relative', overflow: 'hidden',
    }}>
      {/* painterly blobs */}
      <div style={{
        position: 'absolute', top: '60%', left: '50%',
        width: size * 0.8, height: size * 0.8, borderRadius: '50%',
        background: `oklch(0.55 0.25 ${hue + 80})`, filter: 'blur(20px)', opacity: 0.7,
      }}/>
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: size * 0.6, height: size * 0.6, borderRadius: '50%',
        background: `oklch(0.85 0.2 ${hue - 40})`, filter: 'blur(24px)', opacity: 0.5,
      }}/>
    </div>
  );
}

// ── Library ──
function LibraryD({ dark = false }) {
  const bg = dark ? D.bgDark : D.bg;
  const fg = dark ? D.inkLight : D.ink;
  const muted = dark ? D.mutedDark : D.muted;
  const card = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)';

  const tracks = [
    { t: 'Morning Haze', a: 'Alice Chen', d: '3:42', h: 40 },
    { t: 'Gasoline', a: 'HAIM', d: '4:01', h: 20 },
    { t: 'Topaz', a: 'Mk.gee', d: '2:58', h: 60 },
    { t: 'Foreign Field', a: 'Beach House', d: '5:22', h: 340 },
    { t: 'Soft Power', a: 'Charli XCX', d: '3:15', h: 310 },
    { t: 'Fade Into You', a: 'Mazzy Star', d: '4:47', h: 260 },
  ];

  return (
    <div style={{
      background: bg, color: fg, minHeight: '100%', paddingBottom: 120,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient color blobs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 260, height: 260, borderRadius: '50%',
        background: D.accent2, filter: 'blur(60px)', opacity: 0.35,
      }}/>
      <div style={{
        position: 'absolute', top: 200, left: -100,
        width: 280, height: 280, borderRadius: '50%',
        background: D.accent, filter: 'blur(80px)', opacity: 0.25,
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* header */}
        <div style={{ padding: '60px 24px 12px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{
              fontFamily: D.mono, fontSize: 10, letterSpacing: 2, color: muted,
            }}>ISSUE 24 · DMUSIC</div>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: fg, color: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: D.sans, fontSize: 16, fontWeight: 600,
            }}>D</div>
          </div>
          <div style={{
            fontFamily: D.serif, fontSize: 88, lineHeight: 0.85,
            fontStyle: 'italic', marginTop: 26, letterSpacing: -3,
          }}>
            Your<br/>library,
          </div>
          <div style={{
            fontFamily: D.serif, fontSize: 88, lineHeight: 0.85,
            letterSpacing: -3, marginTop: -2, color: D.accent,
          }}>softly.</div>
        </div>

        {/* featured card */}
        <div style={{ padding: '32px 20px 16px' }}>
          <div style={{
            background: card,
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'}`,
            borderRadius: 28, padding: 18,
            display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <ArtworkD size={70} hue={280} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: D.mono, fontSize: 9, color: muted, letterSpacing: 2 }}>
                CONTINUE LISTENING
              </div>
              <div style={{
                fontFamily: D.serif, fontSize: 24, lineHeight: 1.05, marginTop: 4,
                letterSpacing: -0.5,
              }}>Copper Bones</div>
              <div style={{ fontFamily: D.sans, fontSize: 12, color: muted, marginTop: 2 }}>
                Overmono · 2:15 left
              </div>
            </div>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: D.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 22px oklch(0.5 0.25 280 / 0.4)`,
            }}>
              <svg width="14" height="16" viewBox="0 0 14 16">
                <path d="M0 0l14 8-14 8V0z" fill="#fff"/>
              </svg>
            </div>
          </div>
        </div>

        {/* section label */}
        <div style={{
          padding: '14px 24px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontFamily: D.serif, fontSize: 26, fontStyle: 'italic' }}>
            All tracks
          </div>
          <div style={{ fontFamily: D.mono, fontSize: 10, color: muted, letterSpacing: 1.5 }}>
            247 · A-Z
          </div>
        </div>

        {/* list */}
        <div style={{ padding: '0 20px' }}>
          {tracks.map((tr, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 6px',
              borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(28,20,36,0.1)'}`,
            }}>
              <ArtworkD size={50} hue={tr.h} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: D.serif, fontSize: 22, lineHeight: 1,
                  fontStyle: 'italic', letterSpacing: -0.3,
                }}>{tr.t}</div>
                <div style={{
                  fontFamily: D.sans, fontSize: 12, color: muted, marginTop: 3,
                }}>{tr.a}</div>
              </div>
              <div style={{ fontFamily: D.mono, fontSize: 11, color: muted }}>
                {tr.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MiniPlayerD dark={dark} />
    </div>
  );
}

function MiniPlayerD({ dark = false, floating = true }) {
  const fg = dark ? D.inkLight : D.ink;
  return (
    <div style={{
      position: floating ? 'absolute' : 'relative',
      left: floating ? 16 : 0, right: floating ? 16 : 0,
      bottom: floating ? 40 : 0,
      background: dark ? 'rgba(28,20,36,0.7)' : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`,
      color: fg,
      borderRadius: 28, padding: 10,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 16px 44px rgba(28,20,36,0.18)',
    }}>
      <ArtworkD size={48} hue={280} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: D.serif, fontSize: 17, fontStyle: 'italic', lineHeight: 1 }}>
          Copper Bones
        </div>
        <div style={{ fontFamily: D.sans, fontSize: 11, color: dark ? D.mutedDark : D.muted, marginTop: 3 }}>
          Overmono
        </div>
      </div>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', background: D.accent,
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

function PlayerD({ dark = false }) {
  const bg = dark ? D.bgDark : D.bg;
  const fg = dark ? D.inkLight : D.ink;
  const muted = dark ? D.mutedDark : D.muted;

  return (
    <div style={{
      background: bg, height: '100%', color: fg,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* big ambient blobs behind */}
      <div style={{
        position: 'absolute', top: 60, left: -50,
        width: 400, height: 400, borderRadius: '50%',
        background: D.accent, filter: 'blur(80px)', opacity: 0.5,
      }}/>
      <div style={{
        position: 'absolute', top: 200, right: -80,
        width: 380, height: 380, borderRadius: '50%',
        background: D.accent2, filter: 'blur(90px)', opacity: 0.45,
      }}/>
      <div style={{
        position: 'absolute', bottom: 100, left: 40,
        width: 300, height: 300, borderRadius: '50%',
        background: D.accent3, filter: 'blur(70px)', opacity: 0.35,
      }}/>

      {/* top bar */}
      <div style={{
        position: 'relative', zIndex: 2, padding: '56px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke={fg} strokeWidth="2">
          <path d="M1 1l8 8 8-8"/>
        </svg>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: D.mono, fontSize: 10, color: muted, letterSpacing: 2 }}>
            PLAYING FROM
          </div>
          <div style={{ fontFamily: D.serif, fontSize: 15, fontStyle: 'italic', marginTop: 2 }}>
            Late Night Mix
          </div>
        </div>
        <div style={{ fontSize: 22, lineHeight: 0.5, color: fg }}>⋯</div>
      </div>

      {/* artwork centered */}
      <div style={{
        position: 'relative', zIndex: 2, padding: '40px 0 0',
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          position: 'relative',
          boxShadow: `0 30px 60px oklch(0.3 0.2 280 / 0.4)`,
          borderRadius: 24, overflow: 'hidden',
        }}>
          <ArtworkD size={300} hue={280} />
        </div>
      </div>

      {/* title */}
      <div style={{
        position: 'relative', zIndex: 2, padding: '40px 28px 0', textAlign: 'center',
      }}>
        <div style={{
          fontFamily: D.serif, fontSize: 44, fontStyle: 'italic',
          lineHeight: 0.95, letterSpacing: -1.5,
        }}>Copper Bones</div>
        <div style={{
          fontFamily: D.sans, fontSize: 14, color: muted, marginTop: 8,
          letterSpacing: 0.3,
        }}>
          Overmono · Good Lies
        </div>
      </div>

      {/* progress */}
      <div style={{
        position: 'absolute', bottom: 180, left: 24, right: 24, zIndex: 2,
      }}>
        <div style={{
          height: 3, background: dark ? 'rgba(255,255,255,0.2)' : 'rgba(28,20,36,0.15)',
          borderRadius: 2, position: 'relative',
        }}>
          <div style={{
            width: '42%', height: '100%', background: fg, borderRadius: 2,
          }}/>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 8,
          fontFamily: D.mono, fontSize: 10, color: muted, letterSpacing: 1,
        }}>
          <span>1:24</span><span>-1:57</span>
        </div>
      </div>

      {/* controls — glass */}
      <div style={{
        position: 'absolute', bottom: 70, left: 24, right: 24, zIndex: 2,
        background: dark ? 'rgba(28,20,36,0.4)' : 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)'}`,
        borderRadius: 999, padding: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: fg,
        }}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4h8M6 1l4 3-4 3M16 10H8M12 7l-4 3 4 3"/>
          </svg>
        </div>
        <svg width="20" height="16" viewBox="0 0 20 16" fill={fg}>
          <path d="M10 2L0 8l10 6V2zM20 2l-10 6 10 6V2z"/>
        </svg>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 5, height: 20, background: bg, borderRadius: 1 }}/>
            <div style={{ width: 5, height: 20, background: bg, borderRadius: 1 }}/>
          </div>
        </div>
        <svg width="20" height="16" viewBox="0 0 20 16" fill={fg}>
          <path d="M10 2l10 6-10 6V2zM0 2l10 6L0 14V2z"/>
        </svg>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: fg,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1.5L9.8 5.4 14 6l-3 3 .8 4.5L8 11.5 4.2 13.5 5 9 2 6l4.2-.6L8 1.5z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LibraryD, PlayerD, MiniPlayerD, ArtworkD });
