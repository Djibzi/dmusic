// Direction C — "Data Terminal"
// Palette : fond bleu-nuit profond + accents cyan électrique + violet
// Typo : mono partout + grotesk pour titres; inspiration Kraken/trading
// Interaction : dense, data-rich, waveforms, bcp d'infos meta

const C = {
  bg: '#0a0e1a',
  bgLight: '#f6f7fb',
  panel: '#121827',
  panelLight: '#fff',
  fg: '#eef1f8',
  fgDark: '#0a0e1a',
  accent: '#00d9ff',
  accent2: '#a97bff',
  positive: '#4ade80',
  muted: 'rgba(238,241,248,0.55)',
  mutedLight: 'rgba(10,14,26,0.55)',
  line: 'rgba(238,241,248,0.08)',
  lineLight: 'rgba(10,14,26,0.08)',
  mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  sans: 'Inter, -apple-system, system-ui, sans-serif',
  serif: '"Instrument Serif", serif',
};

function ArtworkC({ size, hue = 200 }) {
  return (
    <div style={{
      width: size, height: size, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, oklch(0.4 0.2 ${hue}), oklch(0.25 0.15 ${hue + 40}))`,
      borderRadius: 4,
    }}>
      {/* grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: `${size / 6}px ${size / 6}px`,
      }}/>
      {/* chart-like line */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={`M0 ${size*0.7} L${size*0.15} ${size*0.55} L${size*0.3} ${size*0.62} L${size*0.5} ${size*0.3} L${size*0.7} ${size*0.45} L${size*0.85} ${size*0.2} L${size} ${size*0.35}`}
          stroke={C.accent} strokeWidth={size / 80} fill="none"
        />
      </svg>
    </div>
  );
}

// ── Library ──
function LibraryC({ dark = true }) {
  const bg = dark ? C.bg : C.bgLight;
  const panel = dark ? C.panel : C.panelLight;
  const fg = dark ? C.fg : C.fgDark;
  const muted = dark ? C.muted : C.mutedLight;
  const line = dark ? C.line : C.lineLight;

  const tracks = [
    { t: 'NIGHTDRIVER', a: 'HAAI', d: '4:12', bpm: 128, key: 'A♭m', plays: 47, h: 220 },
    { t: 'COPPER_BONES', a: 'OVERMONO', d: '3:21', bpm: 140, key: 'Cm', plays: 112, h: 260 },
    { t: 'EMBER', a: 'FOUR_TET', d: '5:48', bpm: 96, key: 'Em', plays: 24, h: 40 },
    { t: 'LOW_BEAM', a: 'SKEE_MASK', d: '4:55', bpm: 132, key: 'Dm', plays: 8, h: 300 },
    { t: 'PARALLAX', a: 'JON_HOPKINS', d: '5:14', bpm: 110, key: 'F♯m', plays: 61, h: 170 },
    { t: 'NEON_RUST', a: 'OBJEKT', d: '3:48', bpm: 138, key: 'Gm', plays: 19, h: 110 },
  ];

  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 110, fontFamily: C.sans }}>
      {/* top bar — terminal style */}
      <div style={{
        padding: '56px 16px 12px',
        borderBottom: `1px solid ${line}`,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: C.mono, fontSize: 10, color: muted, letterSpacing: 1.5,
        }}>
          <span>DMUSIC v1.0 · LIBRARY</span>
          <span style={{ color: C.accent }}>● ONLINE</span>
        </div>
        <div style={{
          fontFamily: C.sans, fontSize: 32, fontWeight: 700, marginTop: 14,
          letterSpacing: -0.5,
        }}>
          Library
        </div>
        {/* stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14,
        }}>
          {[
            ['TRACKS', '247'],
            ['DURATION', '18.3H'],
            ['LINKS', '34'],
          ].map(([l, v]) => (
            <div key={l} style={{
              background: panel, padding: '10px 12px', borderRadius: 6,
              border: `1px solid ${line}`,
            }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: muted, letterSpacing: 1.5 }}>{l}</div>
              <div style={{ fontFamily: C.mono, fontSize: 22, fontWeight: 700, color: fg, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div style={{
        display: 'flex', padding: '12px 16px 0', gap: 4,
        fontFamily: C.mono, fontSize: 11, letterSpacing: 1,
      }}>
        {['ALL', 'TRACKS', 'ALBUMS', 'LINKS'].map((p, i) => (
          <div key={p} style={{
            padding: '6px 12px', borderRadius: 4,
            background: i === 0 ? (dark ? 'rgba(0,217,255,0.12)' : 'rgba(0,217,255,0.18)') : 'transparent',
            color: i === 0 ? C.accent : muted,
            border: i === 0 ? `1px solid ${C.accent}` : `1px solid transparent`,
          }}>{p}</div>
        ))}
      </div>

      {/* col headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '28px 1fr 50px 40px 40px',
        gap: 8, padding: '14px 16px 8px',
        fontFamily: C.mono, fontSize: 9, color: muted, letterSpacing: 1.5,
        borderBottom: `1px solid ${line}`,
      }}>
        <span>#</span><span>TRACK</span><span style={{textAlign: 'right'}}>BPM</span>
        <span style={{textAlign: 'right'}}>KEY</span><span style={{textAlign: 'right'}}>TIME</span>
      </div>

      {/* rows */}
      {tracks.map((tr, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '28px 36px 1fr 50px 40px 40px',
          gap: 8, padding: '10px 16px', alignItems: 'center',
          borderBottom: `1px solid ${line}`,
          background: i === 1 ? (dark ? 'rgba(0,217,255,0.06)' : 'rgba(0,217,255,0.08)') : 'transparent',
        }}>
          <div style={{
            fontFamily: C.mono, fontSize: 10, color: i === 1 ? C.accent : muted,
          }}>{String(i + 1).padStart(2, '0')}</div>
          <ArtworkC size={36} hue={tr.h} />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: C.mono, fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
              color: i === 1 ? C.accent : fg,
            }}>{tr.t}</div>
            <div style={{ fontFamily: C.sans, fontSize: 11, color: muted, marginTop: 2 }}>
              {tr.a.replace(/_/g, ' ')} · {tr.plays} plays
            </div>
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.accent2, textAlign: 'right' }}>
            {tr.bpm}
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: muted, textAlign: 'right' }}>
            {tr.key}
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: muted, textAlign: 'right' }}>
            {tr.d}
          </div>
        </div>
      ))}

      <MiniPlayerC dark={dark} />
    </div>
  );
}

function MiniPlayerC({ dark = true, floating = true }) {
  const bg = dark ? C.panel : C.panelLight;
  const fg = dark ? C.fg : C.fgDark;
  const muted = dark ? C.muted : C.mutedLight;
  return (
    <div style={{
      position: floating ? 'absolute' : 'relative',
      left: floating ? 12 : 0, right: floating ? 12 : 0,
      bottom: floating ? 40 : 0,
      background: bg, color: fg,
      borderRadius: 8, padding: 10,
      border: `1px solid ${dark ? 'rgba(0,217,255,0.3)' : 'rgba(0,217,255,0.4)'}`,
      boxShadow: dark ? '0 0 30px rgba(0,217,255,0.15)' : '0 10px 30px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ArtworkC size={40} hue={260} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          }}>
            <div style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>
              COPPER_BONES
            </div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.accent }}>
              ● PLAYING
            </div>
          </div>
          <div style={{ fontFamily: C.sans, fontSize: 11, color: muted, marginTop: 2 }}>
            Overmono · 140 BPM · Cm
          </div>
          {/* mini waveform */}
          <div style={{ marginTop: 6, display: 'flex', gap: 1, alignItems: 'flex-end', height: 12 }}>
            {Array.from({length: 40}).map((_, i) => {
              const h = 2 + Math.abs(Math.sin(i * 0.5) * 9) + (i % 3);
              return <div key={i} style={{
                flex: 1, height: h,
                background: i < 17 ? C.accent : muted,
              }}/>;
            })}
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 4, background: C.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', gap: 3 }}>
            <div style={{ width: 3, height: 14, background: C.bg }}/>
            <div style={{ width: 3, height: 14, background: C.bg }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerC({ dark = true }) {
  const bg = dark ? C.bg : C.bgLight;
  const panel = dark ? C.panel : C.panelLight;
  const fg = dark ? C.fg : C.fgDark;
  const muted = dark ? C.muted : C.mutedLight;
  const line = dark ? C.line : C.lineLight;

  return (
    <div style={{ background: bg, height: '100%', color: fg, fontFamily: C.sans, position: 'relative', overflow: 'hidden' }}>
      {/* glow behind */}
      <div style={{
        position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${dark ? 'rgba(0,217,255,0.15)' : 'rgba(0,217,255,0.1)'}, transparent 70%)`,
        filter: 'blur(40px)',
      }}/>

      {/* top bar */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '56px 16px 0',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: C.mono, fontSize: 10, letterSpacing: 1.5, color: muted,
        }}>
          <span>⌄ NOW PLAYING</span>
          <span>T+00:01:24.382</span>
          <span>⋯</span>
        </div>
      </div>

      {/* artwork with overlay panel */}
      <div style={{ position: 'relative', padding: '32px 16px 0', zIndex: 2 }}>
        <ArtworkC size={370} hue={260} />
        {/* stats overlay bottom */}
        <div style={{
          position: 'absolute', left: 24, right: 24, bottom: 12,
          background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(10px)',
          border: `1px solid ${C.accent}`, borderRadius: 6,
          padding: '8px 12px',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8,
          color: C.fg,
        }}>
          {[
            ['BPM', '140'],
            ['KEY', 'Cm'],
            ['ENERGY', '0.82'],
            ['YEAR', '2023'],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontFamily: C.mono, fontSize: 8, color: C.muted, letterSpacing: 1.5 }}>{l}</div>
              <div style={{ fontFamily: C.mono, fontSize: 14, fontWeight: 700, color: C.accent }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* title block */}
      <div style={{ padding: '24px 16px 0', position: 'relative', zIndex: 2 }}>
        <div style={{
          fontFamily: C.mono, fontSize: 10, color: C.accent, letterSpacing: 2,
        }}>TRACK 03 / 12 · GOOD LIES</div>
        <div style={{
          fontFamily: C.sans, fontSize: 32, fontWeight: 700,
          marginTop: 6, letterSpacing: -0.5, lineHeight: 1,
        }}>
          Copper Bones
        </div>
        <div style={{ fontFamily: C.sans, fontSize: 15, color: muted, marginTop: 4 }}>
          Overmono
        </div>
      </div>

      {/* waveform with markers */}
      <div style={{ padding: '20px 16px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', height: 40 }}>
          {Array.from({length: 70}).map((_, i) => {
            const h = 4 + Math.abs(Math.sin(i * 0.3) * 18) + Math.abs(Math.cos(i * 0.7) * 10);
            const played = i < 29;
            return <div key={i} style={{
              flex: 1, height: h,
              background: played ? C.accent : (dark ? 'rgba(238,241,248,0.15)' : 'rgba(10,14,26,0.15)'),
              borderRadius: 1,
            }}/>;
          })}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 8,
          fontFamily: C.mono, fontSize: 10, color: muted, letterSpacing: 1,
        }}>
          <span style={{ color: C.accent }}>01:24</span>
          <span>03:21</span>
        </div>
      </div>

      {/* controls */}
      <div style={{
        position: 'absolute', bottom: 64, left: 16, right: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2,
      }}>
        <div style={{ fontFamily: C.mono, fontSize: 11, color: muted }}>SHUF</div>
        <svg width="24" height="20" viewBox="0 0 24 20" fill={fg}>
          <path d="M12 2L2 10l10 8V2zM22 2l-10 8 10 8V2z"/>
        </svg>
        <div style={{
          width: 72, height: 72, borderRadius: 8, background: C.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 40px ${C.accent}`,
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 5, height: 26, background: C.bg }}/>
            <div style={{ width: 5, height: 26, background: C.bg }}/>
          </div>
        </div>
        <svg width="24" height="20" viewBox="0 0 24 20" fill={fg}>
          <path d="M12 2l10 8-10 8V2zM2 2l10 8-10 8V2z"/>
        </svg>
        <div style={{ fontFamily: C.mono, fontSize: 11, color: muted }}>RPT</div>
      </div>
    </div>
  );
}

// ── Link Library screen (feature signature) ──
function LinksC({ dark = true }) {
  const bg = dark ? C.bg : C.bgLight;
  const panel = dark ? C.panel : C.panelLight;
  const fg = dark ? C.fg : C.fgDark;
  const muted = dark ? C.muted : C.mutedLight;
  const line = dark ? C.line : C.lineLight;

  const history = [
    { t: 'Set 4am Warehouse', u: 'soundcloud.com/...mp3', h: 220, d: '32:14', ago: '12m' },
    { t: 'Boiler Room NYC', u: 'archive.org/.../br-nyc.m4a', h: 180, d: '1:02:45', ago: '3h' },
    { t: 'Drum-n-Bass Mix 01', u: 'cdn.djset.com/mix01.mp3', h: 330, d: '45:22', ago: 'yesterday' },
    { t: 'Ambient Loop', u: 'files.user.me/loop.ogg', h: 40, d: '8:12', ago: '2d' },
    { t: 'Untitled Rip', u: 'my.server/tr.mp3', h: 280, d: '4:18', ago: '1w' },
  ];

  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', fontFamily: C.sans, paddingBottom: 40 }}>
      {/* header */}
      <div style={{ padding: '56px 16px 20px', borderBottom: `1px solid ${line}` }}>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: muted, letterSpacing: 1.5 }}>
          DMUSIC · LINK_PLAYER
        </div>
        <div style={{
          fontFamily: C.sans, fontSize: 32, fontWeight: 700, marginTop: 10, letterSpacing: -0.5,
        }}>
          Play from URL
        </div>
        <div style={{ fontFamily: C.sans, fontSize: 13, color: muted, marginTop: 4, lineHeight: 1.4 }}>
          Paste a direct audio link (.mp3 / .m4a / .ogg) to stream instantly.
        </div>
      </div>

      {/* paste input */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{
          background: panel, border: `1px solid ${C.accent}`, borderRadius: 8,
          padding: '14px 14px',
        }}>
          <div style={{
            fontFamily: C.mono, fontSize: 9, color: C.accent, letterSpacing: 2,
          }}>URL</div>
          <div style={{
            fontFamily: C.mono, fontSize: 13, color: fg, marginTop: 6, wordBreak: 'break-all',
          }}>
            https://cdn.example.com/tracks/<span style={{ color: C.accent }}>new-release.mp3</span><span style={{
              display: 'inline-block', width: 2, height: 15, background: C.accent, marginLeft: 2,
              transform: 'translateY(3px)',
            }}/>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <div style={{
              flex: 1, padding: '10px 14px', borderRadius: 6,
              background: C.accent, color: C.bg,
              fontFamily: C.mono, fontSize: 12, fontWeight: 700, letterSpacing: 1,
              textAlign: 'center',
            }}>▶ PLAY NOW</div>
            <div style={{
              padding: '10px 14px', borderRadius: 6,
              border: `1px solid ${line}`, color: fg,
              fontFamily: C.mono, fontSize: 12, letterSpacing: 1,
            }}>+ SAVE</div>
          </div>
        </div>
      </div>

      {/* history */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: C.mono, fontSize: 10, color: muted, letterSpacing: 1.5, marginBottom: 10,
        }}>
          <span>RECENT LINKS · 34</span>
          <span style={{ color: C.accent2 }}>CLEAR ALL</span>
        </div>
        {history.map((h, i) => (
          <div key={i} style={{
            background: panel, borderRadius: 6, padding: '12px 12px',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
            border: `1px solid ${line}`,
          }}>
            <ArtworkC size={40} hue={h.h} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: C.sans, fontSize: 14, fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{h.t}</div>
              <div style={{
                fontFamily: C.mono, fontSize: 10, color: muted, marginTop: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{h.u}</div>
              <div style={{
                display: 'flex', gap: 10, marginTop: 4,
                fontFamily: C.mono, fontSize: 9, color: muted, letterSpacing: 1,
              }}>
                <span style={{ color: C.accent }}>{h.d}</span>
                <span>·</span>
                <span>{h.ago}</span>
              </div>
            </div>
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke={muted} strokeWidth="1.5">
              <path d="M2 2l6 6-6 6"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LibraryC, PlayerC, MiniPlayerC, ArtworkC, LinksC });
