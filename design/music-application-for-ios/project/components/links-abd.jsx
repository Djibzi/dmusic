// Link screens for directions A, B, D (C already has its own in direction-c.jsx)

// ── Direction A — Link screen ──
function LinksA({ dark = true }) {
  const bg = dark ? '#0b0b0a' : '#f4f2ec';
  const fg = dark ? '#f4f2ec' : '#0b0b0a';
  const muted = dark ? 'rgba(244,242,236,0.5)' : 'rgba(11,11,10,0.5)';
  const accent = '#c6ff3d';
  const serif = '"Instrument Serif", "Times New Roman", serif';
  const mono = '"JetBrains Mono", monospace';
  const line = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const history = [
    { t: '4am Warehouse Set', d: '32:14', ago: '12m', h: 220 },
    { t: 'Boiler Room NYC', d: '1:02:45', ago: '3h', h: 180 },
    { t: 'Ambient Loop', d: '8:12', ago: '2d', h: 40 },
    { t: 'Untitled Rip', d: '4:18', ago: '1w', h: 280 },
  ];

  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 40 }}>
      <div style={{ padding: '66px 24px 20px' }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: muted }}>
          LINKS / 34
        </div>
        <div style={{
          fontFamily: serif, fontSize: 56, lineHeight: 0.95, fontStyle: 'italic',
          marginTop: 12, letterSpacing: -1,
        }}>
          paste.<br/>play.
        </div>
      </div>

      {/* input card */}
      <div style={{ padding: '0 24px' }}>
        <div style={{
          border: `1px solid ${accent}`, padding: 16,
          background: dark ? 'rgba(198,255,61,0.05)' : 'rgba(198,255,61,0.12)',
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: accent, letterSpacing: 2 }}>
            ENTER URL
          </div>
          <div style={{
            fontFamily: mono, fontSize: 13, marginTop: 10, wordBreak: 'break-all',
          }}>
            https://cdn.example.com/<span style={{ color: accent }}>track.mp3</span>
            <span style={{ display: 'inline-block', width: 2, height: 14, background: accent, marginLeft: 2, verticalAlign: 'middle' }}/>
          </div>
          <div style={{
            display: 'flex', gap: 10, marginTop: 18,
          }}>
            <div style={{
              flex: 1, textAlign: 'center', padding: '12px 0',
              background: accent, color: '#0b0b0a',
              fontFamily: mono, fontSize: 12, letterSpacing: 2,
            }}>▶ PLAY</div>
            <div style={{
              flex: 1, textAlign: 'center', padding: '12px 0',
              border: `1px solid ${line}`,
              fontFamily: mono, fontSize: 12, letterSpacing: 2,
            }}>+ SAVE</div>
          </div>
        </div>
      </div>

      {/* history */}
      <div style={{
        padding: '32px 24px 10px',
        fontFamily: mono, fontSize: 10, color: muted, letterSpacing: 2,
      }}>RECENT</div>
      <div style={{ padding: '0 24px' }}>
        {history.map((h, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '32px 44px 1fr auto',
            gap: 12, alignItems: 'center', padding: '14px 0',
            borderTop: `1px solid ${line}`,
          }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: muted }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <ArtworkA size={44} hue={h.h} />
            <div>
              <div style={{ fontFamily: serif, fontSize: 20, fontStyle: 'italic', lineHeight: 1.1 }}>
                {h.t}
              </div>
              <div style={{ fontFamily: mono, fontSize: 9, color: muted, letterSpacing: 1, marginTop: 3 }}>
                {h.ago.toUpperCase()} AGO
              </div>
            </div>
            <div style={{ fontFamily: mono, fontSize: 11, color: muted }}>{h.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Direction B — Link screen ──
function LinksB({ dark = false }) {
  const bg = dark ? '#1a1510' : '#fbf3e7';
  const fg = dark ? '#fbf3e7' : '#1a1510';
  const accent = '#ff5a1f';
  const card = dark ? '#241c14' : '#fff';
  const muted = dark ? 'rgba(251,243,231,0.6)' : 'rgba(26,21,16,0.55)';
  const sans = 'Inter, system-ui, sans-serif';
  const mono = '"JetBrains Mono", monospace';
  const display = '"Archivo Black", "Arial Black", sans-serif';

  const history = [
    { t: '4am Warehouse Set', d: '32:14', ago: '12m', h: 30 },
    { t: 'Boiler Room NYC', d: '1:02:45', ago: '3h', h: 350 },
    { t: 'Ambient Loop', d: '8:12', ago: '2d', h: 60 },
    { t: 'Drum-n-Bass Mix', d: '45:22', ago: '1w', h: 280 },
  ];

  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 40 }}>
      <div style={{ padding: '56px 20px 20px' }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: muted }}>
          LINK PLAYER
        </div>
        <div style={{
          fontFamily: display, fontSize: 52, lineHeight: 0.9,
          marginTop: 14, letterSpacing: -2, textTransform: 'uppercase',
        }}>Paste &<br/>Play.</div>
      </div>

      {/* input */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{
          background: card, borderRadius: 20, padding: 18,
          boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: muted, letterSpacing: 2 }}>
            URL
          </div>
          <div style={{
            fontFamily: mono, fontSize: 13, marginTop: 8, wordBreak: 'break-all',
          }}>
            https://cdn.example.com/<span style={{ color: accent, fontWeight: 700 }}>new-release.mp3</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <div style={{
              flex: 1, padding: '12px 0', borderRadius: 999,
              background: accent, color: '#fff',
              fontFamily: sans, fontSize: 14, fontWeight: 700, textAlign: 'center',
              boxShadow: '0 6px 18px rgba(255,90,31,0.35)',
            }}>▶ Play</div>
            <div style={{
              padding: '12px 20px', borderRadius: 999,
              border: `1.5px solid ${fg}`, color: fg,
              fontFamily: sans, fontSize: 14, fontWeight: 700,
            }}>Save</div>
          </div>
        </div>
      </div>

      {/* history */}
      <div style={{ padding: '28px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: display, fontSize: 20, textTransform: 'uppercase' }}>Recent</div>
        <div style={{ fontFamily: mono, fontSize: 10, color: muted, letterSpacing: 1.5 }}>34 LINKS</div>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ background: card, borderRadius: 18, overflow: 'hidden' }}>
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < history.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
            }}>
              <ArtworkB size={36} hue={h.h} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>
                  {h.t}
                </div>
                <div style={{ fontFamily: sans, fontSize: 11, color: muted, marginTop: 2 }}>
                  {h.ago} ago · URL
                </div>
              </div>
              <div style={{
                padding: '3px 8px', borderRadius: 4,
                background: accent, color: '#fff',
                fontFamily: mono, fontSize: 9, letterSpacing: 1,
              }}>LINK</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: muted }}>{h.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Direction D — Link screen ──
function LinksD({ dark = false }) {
  const bg = dark ? '#1c1424' : '#f3e9de';
  const fg = dark ? '#fbf6ef' : '#1c1424';
  const muted = dark ? 'rgba(251,246,239,0.6)' : 'rgba(28,20,36,0.55)';
  const accent = '#6a3cff';
  const serif = '"Instrument Serif", Georgia, serif';
  const sans = 'Inter, system-ui, sans-serif';
  const mono = '"JetBrains Mono", monospace';
  const card = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)';

  const history = [
    { t: '4am Warehouse Set', d: '32:14', ago: '12m', h: 30 },
    { t: 'Boiler Room NYC', d: '1:02:45', ago: '3h', h: 340 },
    { t: 'Ambient Loop', d: '8:12', ago: '2d', h: 60 },
    { t: 'Untitled Rip', d: '4:18', ago: '1w', h: 280 },
  ];

  return (
    <div style={{
      background: bg, color: fg, minHeight: '100%', paddingBottom: 40,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient */}
      <div style={{
        position: 'absolute', top: -80, right: -100,
        width: 320, height: 320, borderRadius: '50%',
        background: '#ff7ab8', filter: 'blur(80px)', opacity: 0.35,
      }}/>
      <div style={{
        position: 'absolute', top: 220, left: -80,
        width: 260, height: 260, borderRadius: '50%',
        background: accent, filter: 'blur(70px)', opacity: 0.3,
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '60px 24px 8px' }}>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: muted }}>
            PASTE A LINK
          </div>
          <div style={{
            fontFamily: serif, fontSize: 68, lineHeight: 0.88,
            fontStyle: 'italic', marginTop: 14, letterSpacing: -2,
          }}>Stream<br/>anything.</div>
        </div>

        {/* input card */}
        <div style={{ padding: '28px 20px 0' }}>
          <div style={{
            background: card,
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`,
            borderRadius: 28, padding: 20,
          }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: muted, letterSpacing: 2 }}>
              URL
            </div>
            <div style={{
              fontFamily: serif, fontSize: 20, fontStyle: 'italic', marginTop: 8,
              wordBreak: 'break-all', lineHeight: 1.3,
            }}>
              cdn.example.com/<span style={{ color: accent }}>track.mp3</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <div style={{
                flex: 1, padding: '14px 0', borderRadius: 999,
                background: accent, color: '#fff',
                fontFamily: sans, fontSize: 15, fontWeight: 600, textAlign: 'center',
              }}>Play</div>
              <div style={{
                padding: '14px 24px', borderRadius: 999,
                background: fg, color: bg,
                fontFamily: sans, fontSize: 15, fontWeight: 600,
              }}>Save</div>
            </div>
          </div>
        </div>

        {/* history */}
        <div style={{
          padding: '32px 24px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <div style={{ fontFamily: serif, fontSize: 26, fontStyle: 'italic' }}>Recent</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: muted, letterSpacing: 1.5 }}>
            34 links
          </div>
        </div>
        <div style={{ padding: '0 20px' }}>
          {history.map((h, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 6px',
              borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(28,20,36,0.1)'}`,
            }}>
              <ArtworkD size={50} hue={h.h} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: serif, fontSize: 20, fontStyle: 'italic', lineHeight: 1.1,
                }}>{h.t}</div>
                <div style={{ fontFamily: sans, fontSize: 11, color: muted, marginTop: 3 }}>
                  {h.ago} ago
                </div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: muted }}>{h.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LinksA, LinksB, LinksD });
