// Direction B — Extra screens for full app coverage
// Uses BD_PALETTES, BD, Artwork, TabBar, MiniPlayer from direction-b-deep.jsx

const PADTOP2 = 56;

function pageBase(palette, dark) {
  const P = palette;
  return {
    bg: dark ? P.bgDark : P.bg,
    fg: dark ? P.inkLight : P.ink,
    surface: dark ? P.surfaceDark : P.surface,
    muted: dark ? P.mutedDark : P.muted,
  };
}

// ---------- ONBOARDING ----------
function Onboarding({ palette, dark = false, step = 1 }) {
  const P = palette;
  const { bg, fg, muted } = pageBase(P, dark);
  const steps = [
    { n: '01', t: 'Ta musique,\nton espace.', s: 'DMusic lit tes fichiers iPhone, ta bibliothèque Apple Music locale, et streame n\'importe quel lien audio direct.' },
    { n: '02', t: 'Colle\nun lien.', s: 'Un .mp3, un .m4a, un podcast, un mix Boiler Room — colle l\'URL et ça joue. Fonctionne en arrière-plan, verrouillé.' },
    { n: '03', t: 'Tout reste\nlocal.', s: 'Pas de compte, pas de cloud obligatoire. SQLite + fichiers iOS. Tes playlists t\'appartiennent.' },
  ];
  const cur = steps[step - 1];
  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -100, left: -100, width: 400, height: 400,
        background: `radial-gradient(circle, ${P.accent}88, transparent 70%)`, filter: 'blur(40px)',
      }}/>
      <div style={{
        position: 'absolute', bottom: 160, right: -80, width: 360, height: 360,
        background: `radial-gradient(circle, ${P.accent2}77, transparent 70%)`, filter: 'blur(50px)',
      }}/>

      <div style={{ padding: `${PADTOP2}px 24px 10px`, position: 'relative' }}>
        <div style={{ fontFamily: BD.display, fontSize: 20, letterSpacing: -0.5 }}>DMUSIC</div>
        <div style={{ position: 'absolute', top: PADTOP2, right: 24,
          fontFamily: BD.mono, fontSize: 11, color: muted, letterSpacing: 1 }}>SKIP</div>
      </div>

      <div style={{ padding: '120px 24px 0', position: 'relative' }}>
        <div style={{
          fontFamily: BD.display, fontSize: 180, color: P.accent,
          lineHeight: 0.8, letterSpacing: -8,
        }}>{cur.n}</div>
        <div style={{
          fontFamily: BD.display, fontSize: 54, lineHeight: 0.92,
          letterSpacing: -2, textTransform: 'uppercase', marginTop: 20, whiteSpace: 'pre-line',
        }}>{cur.t}</div>
        <div style={{
          fontFamily: BD.sans, fontSize: 15, color: muted, lineHeight: 1.5,
          marginTop: 20, maxWidth: 310,
        }}>{cur.s}</div>
      </div>

      {/* progress dots */}
      <div style={{
        position: 'absolute', bottom: 120, left: 24, right: 24,
        display: 'flex', gap: 6,
      }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            flex: i === step ? 2 : 1, height: 4, borderRadius: 2,
            background: i === step ? P.accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
            transition: 'all .3s',
          }}/>
        ))}
      </div>
      <div style={{
        position: 'absolute', bottom: 40, left: 24, right: 24,
        display: 'flex', gap: 10,
      }}>
        <div style={{
          flex: 1, padding: '16px 0', borderRadius: 999, textAlign: 'center',
          background: P.accent, color: '#fff',
          fontFamily: BD.display, fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase',
        }}>{step === 3 ? 'Commencer' : 'Suivant →'}</div>
      </div>
    </div>
  );
}

// ---------- IMPORT ----------
function ImportScreen({ palette, dark = false }) {
  const P = palette;
  const { bg, fg, surface, muted } = pageBase(P, dark);
  const sources = [
    { k: 'Files', s: 'Fichiers iPhone (iCloud, Dropbox, local)', ic: 'M4 3h8l3 3v10H4V3z', count: null },
    { k: 'Apple Music', s: 'Tracks téléchargés localement (hors DRM)', ic: 'M10 2a8 8 0 100 16 8 8 0 000-16zM10 6v6M7 10h6', count: 64 },
    { k: 'URL', s: 'Coller un lien audio direct', ic: 'M7 11l-3 3a3 3 0 004 4l3-3M11 7l3-3a3 3 0 114 4l-3 3', count: null },
    { k: 'AirDrop', s: 'Reçoit depuis un autre appareil', ic: 'M10 2v10M5 7l5-5 5 5M4 15h12', count: null },
  ];
  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 130 }}>
      <div style={{ padding: `${PADTOP2}px 20px 10px` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 2,
        }}>
          <span>← BIBLIOTHÈQUE</span>
        </div>
        <div style={{
          fontFamily: BD.display, fontSize: 56, lineHeight: 0.92,
          letterSpacing: -2, textTransform: 'uppercase', marginTop: 16,
        }}>Importer.</div>
        <div style={{
          fontFamily: BD.sans, fontSize: 14, color: muted, marginTop: 10, maxWidth: 280, lineHeight: 1.45,
        }}>Ajoute de la musique depuis plusieurs sources. Tout est stocké localement.</div>
      </div>

      <div style={{ padding: '20px' }}>
        {sources.map((src, i) => (
          <div key={i} style={{
            background: surface, borderRadius: 20, padding: 16,
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10,
            border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: i === 0 ? P.accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                stroke={i === 0 ? '#fff' : fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={src.ic}/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontFamily: BD.sans, fontSize: 15, fontWeight: 600 }}>{src.k}</div>
                {src.count != null && (
                  <div style={{
                    padding: '2px 7px', borderRadius: 4,
                    fontFamily: BD.mono, fontSize: 9,
                    background: P.accent, color: '#fff',
                  }}>{src.count} TRACKS</div>
                )}
              </div>
              <div style={{ fontFamily: BD.sans, fontSize: 12, color: muted, marginTop: 2 }}>{src.s}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" stroke={muted} strokeWidth="1.6" fill="none">
              <path d="M6 3l5 5-5 5"/>
            </svg>
          </div>
        ))}

        {/* Progress / recent import */}
        <div style={{
          marginTop: 20, background: P.accent, color: '#fff',
          borderRadius: 20, padding: 18, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontFamily: BD.mono, fontSize: 10, letterSpacing: 2, opacity: 0.9 }}>◉ IMPORT EN COURS</div>
          <div style={{ fontFamily: BD.display, fontSize: 22, textTransform: 'uppercase',
            marginTop: 6, lineHeight: 1 }}>12/24 tracks</div>
          <div style={{
            marginTop: 12, height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 3,
          }}>
            <div style={{ width: '50%', height: '100%', background: '#fff', borderRadius: 3 }}/>
          </div>
          <div style={{ fontFamily: BD.mono, fontSize: 11, marginTop: 8, opacity: 0.9 }}>
            Morning Haze — Alice Chen.m4a
          </div>
        </div>
      </div>

      <TabBar palette={P} dark={dark} active="library"/>
    </div>
  );
}

// ---------- PLAYLISTS LIST ----------
function PlaylistsScreen({ palette, dark = false }) {
  const P = palette;
  const { bg, fg, surface, muted } = pageBase(P, dark);
  const lists = [
    { t: 'Late Night Mix', c: 24, d: '1h 32m', h: P.artHues[0], big: true },
    { t: 'Morning Run', c: 18, d: '1h 04m', h: P.artHues[1] },
    { t: 'Focus Deep', c: 42, d: '3h 11m', h: P.artHues[2] },
    { t: 'Vinyl Rips', c: 11, d: '44m', h: P.artHues[3] },
    { t: 'From Links', c: 8, d: '32m', h: P.artHues[4], link: true },
    { t: 'Chill Sunday', c: 26, d: '1h 48m', h: P.artHues[5] },
  ];
  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 130 }}>
      <div style={{ padding: `${PADTOP2}px 20px 10px` }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontFamily: BD.display, fontSize: 22, letterSpacing: -0.5 }}>DMUSIC</div>
          <div style={{
            width: 36, height: 36, borderRadius: 999, background: P.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 18,
          }}>+</div>
        </div>
        <div style={{
          fontFamily: BD.display, fontSize: 56, lineHeight: 0.92,
          letterSpacing: -2, textTransform: 'uppercase', marginTop: 18,
        }}>Playlists.</div>
        <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, marginTop: 8, letterSpacing: 0.5 }}>
          6 PLAYLISTS · 129 TRACKS TOTAL
        </div>
      </div>

      {/* Hero playlist */}
      <div style={{ padding: '14px 20px' }}>
        <div style={{
          background: surface, borderRadius: 22, padding: 16,
          display: 'flex', gap: 14, alignItems: 'center',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          <div style={{ position: 'relative' }}>
            <Artwork size={90} hue={lists[0].h} palette={P} variant={0}/>
            <div style={{
              position: 'absolute', top: -10, right: -10,
              background: P.ink, color: P.inkLight,
              padding: '4px 8px', borderRadius: 4,
              fontFamily: BD.mono, fontSize: 9, letterSpacing: 1,
              transform: 'rotate(4deg)',
            }}>PINNED</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 2 }}>
              SUGGESTED
            </div>
            <div style={{
              fontFamily: BD.display, fontSize: 26, textTransform: 'uppercase',
              marginTop: 4, lineHeight: 1, letterSpacing: -1,
            }}>Late Night<br/>Mix</div>
            <div style={{ fontFamily: BD.sans, fontSize: 12, color: muted, marginTop: 6 }}>
              {lists[0].c} tracks · {lists[0].d}
            </div>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 999, background: P.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="#fff"><path d="M3 1l8 6-8 6V1z"/></svg>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '12px 20px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          {lists.slice(1).map((l, i) => (
            <div key={i} style={{
              background: surface, borderRadius: 18, padding: 12,
              border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ position: 'relative' }}>
                <Artwork size={152} hue={l.h} palette={P} variant={i % 3}/>
                {l.link && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    padding: '3px 6px', borderRadius: 4,
                    fontFamily: BD.mono, fontSize: 8, letterSpacing: 1,
                    background: P.accent3, color: '#fff',
                  }}>LINKS</div>
                )}
              </div>
              <div style={{
                fontFamily: BD.display, fontSize: 15, textTransform: 'uppercase',
                marginTop: 10, lineHeight: 1, letterSpacing: -0.3,
              }}>{l.t}</div>
              <div style={{ fontFamily: BD.mono, fontSize: 9, color: muted, marginTop: 4, letterSpacing: 0.5 }}>
                {l.c} · {l.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TabBar palette={P} dark={dark} active="library"/>
      <MiniPlayer palette={P} dark={dark}/>
    </div>
  );
}

// ---------- PLAYLIST DETAIL ----------
function PlaylistDetail({ palette, dark = false }) {
  const P = palette;
  const { bg, fg, surface, muted } = pageBase(P, dark);
  const tracks = [
    { t: 'Copper Bones', a: 'Overmono', d: '3:42', h: P.artHues[0], playing: true },
    { t: 'Gasoline', a: 'Haim', d: '4:01', h: P.artHues[1] },
    { t: 'Topaz', a: 'Mk.gee', d: '2:58', h: P.artHues[2] },
    { t: 'Foreign Field', a: 'Beach House', d: '5:22', h: P.artHues[3] },
    { t: 'Fade', a: 'Phoebe Bridgers', d: '4:47', h: P.artHues[5] },
  ];
  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 130, position: 'relative' }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(180deg, ${P.accent}66 0%, ${bg} 100%)`,
        padding: `${PADTOP2}px 20px 24px`,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: BD.mono, fontSize: 11, color: fg, letterSpacing: 1.5,
        }}>
          <span>← PLAYLISTS</span>
          <span>⋯</span>
        </div>
        <div style={{
          display: 'flex', gap: 16, alignItems: 'flex-end', marginTop: 20,
        }}>
          <div style={{
            boxShadow: `0 14px 40px ${P.accent}55`,
            borderRadius: 16, overflow: 'hidden',
          }}>
            <Artwork size={120} hue={P.artHues[0]} palette={P} variant={0}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 2 }}>
              PLAYLIST · 24
            </div>
            <div style={{
              fontFamily: BD.display, fontSize: 34, textTransform: 'uppercase',
              marginTop: 4, lineHeight: 0.95, letterSpacing: -1.5,
            }}>Late Night<br/>Mix</div>
          </div>
        </div>
        <div style={{
          fontFamily: BD.sans, fontSize: 13, color: muted, marginTop: 14, lineHeight: 1.5,
        }}>
          24 tracks · 1h 32m · Created by you — Oct 2025
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <div style={{
            flex: 1, padding: '14px 0', borderRadius: 999, background: P.accent, color: '#fff',
            textAlign: 'center', fontFamily: BD.display, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff"><path d="M2 0l9 6-9 6V0z"/></svg>
            Play
          </div>
          <div style={{
            padding: '14px 22px', borderRadius: 999,
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            color: fg, fontFamily: BD.display, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase',
          }}>Shuffle</div>
        </div>
      </div>

      {/* Tracks */}
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{
          background: surface, borderRadius: 22, overflow: 'hidden',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          {tracks.map((tr, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: tr.playing ? (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)') : 'transparent',
              borderBottom: i < tracks.length - 1 ?
                `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
            }}>
              <div style={{ fontFamily: BD.mono, fontSize: 11, color: tr.playing ? P.accent : muted, width: 20 }}>
                {tr.playing ? (
                  <div style={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', height: 14 }}>
                    {[10, 6, 12, 4].map((h, j) => (
                      <div key={j} style={{
                        width: 2, height: h, background: P.accent, borderRadius: 1,
                        animation: `bar${j} 0.9s ease-in-out infinite alternate`,
                      }}/>
                    ))}
                  </div>
                ) : String(i + 1).padStart(2, '0')}
              </div>
              <Artwork size={40} hue={tr.h} palette={P} variant={i % 3}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: BD.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.2,
                  color: tr.playing ? P.accent : fg,
                }}>{tr.t}</div>
                <div style={{ fontFamily: BD.sans, fontSize: 12, color: muted, marginTop: 2 }}>{tr.a}</div>
              </div>
              <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, minWidth: 32, textAlign: 'right' }}>
                {tr.d}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes bar0 { from { height: 4px } to { height: 12px } }
        @keyframes bar1 { from { height: 10px } to { height: 4px } }
        @keyframes bar2 { from { height: 6px } to { height: 14px } }
        @keyframes bar3 { from { height: 12px } to { height: 6px } }
      `}</style>

      <TabBar palette={P} dark={dark} active="library"/>
      <MiniPlayer palette={P} dark={dark}/>
    </div>
  );
}

// ---------- QUEUE ----------
function QueueScreen({ palette, dark = false }) {
  const P = palette;
  const { bg, fg, surface, muted } = pageBase(P, dark);
  const queue = [
    { t: 'Gasoline', a: 'Haim', d: '4:01', h: P.artHues[1] },
    { t: 'Topaz', a: 'Mk.gee', d: '2:58', h: P.artHues[2] },
    { t: 'Foreign Field', a: 'Beach House', d: '5:22', h: P.artHues[3] },
    { t: 'Soft Power', a: 'Charli XCX', d: '3:15', h: P.artHues[4] },
  ];
  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 130 }}>
      <div style={{ padding: `${PADTOP2}px 20px 10px`, display: 'flex',
        justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, letterSpacing: 1.5 }}>← PLAYER</div>
        <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, letterSpacing: 1.5 }}>CLEAR</div>
      </div>
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          fontFamily: BD.display, fontSize: 54, lineHeight: 0.9,
          letterSpacing: -2, textTransform: 'uppercase',
        }}>Queue.</div>
        <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, marginTop: 8 }}>
          À SUIVRE · 4 TRACKS · 15:36
        </div>
      </div>

      {/* Now playing block */}
      <div style={{ padding: '20px 20px 10px' }}>
        <div style={{ fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 2, padding: '4px 4px 8px' }}>
          EN LECTURE
        </div>
        <div style={{
          background: P.accent, color: '#fff', borderRadius: 20, padding: 14,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <Artwork size={56} hue={P.artHues[0]} palette={P} variant={0}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: BD.sans, fontSize: 15, fontWeight: 600 }}>Copper Bones</div>
            <div style={{ fontFamily: BD.sans, fontSize: 12, opacity: 0.9, marginTop: 2 }}>Overmono</div>
          </div>
          <div style={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', height: 20 }}>
            {[12, 6, 16, 4, 10].map((h, j) => (
              <div key={j} style={{ width: 3, height: h, background: '#fff', borderRadius: 1,
                animation: `qbar${j % 4} 0.9s ease-in-out infinite alternate` }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Queue list */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 2, padding: '4px 4px 8px' }}>
          À SUIVRE
        </div>
        <div style={{
          background: surface, borderRadius: 20, overflow: 'hidden',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          {queue.map((tr, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < queue.length - 1 ?
                `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" stroke={muted} strokeWidth="1.6" fill="none">
                <path d="M2 3h10M2 7h10M2 11h10" strokeLinecap="round"/>
              </svg>
              <Artwork size={40} hue={tr.h} palette={P} variant={i % 3}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: BD.sans, fontSize: 15, fontWeight: 600 }}>{tr.t}</div>
                <div style={{ fontFamily: BD.sans, fontSize: 12, color: muted, marginTop: 2 }}>{tr.a}</div>
              </div>
              <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, minWidth: 32, textAlign: 'right' }}>
                {tr.d}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes qbar0 { from { height: 4px } to { height: 16px } }
        @keyframes qbar1 { from { height: 14px } to { height: 4px } }
        @keyframes qbar2 { from { height: 8px } to { height: 18px } }
        @keyframes qbar3 { from { height: 16px } to { height: 6px } }
      `}</style>
    </div>
  );
}

// ---------- SEARCH ----------
function SearchScreen({ palette, dark = false }) {
  const P = palette;
  const { bg, fg, surface, muted } = pageBase(P, dark);
  const results = [
    { type: 'TRACK', t: 'Copper Bones', a: 'Overmono', h: P.artHues[0] },
    { type: 'ALBUM', t: 'Good Lies', a: 'Overmono · 2023', h: P.artHues[1] },
    { type: 'ARTIST', t: 'Overmono', a: '5 albums · 42 tracks', h: P.artHues[2] },
    { type: 'LINK', t: 'Overmono — Boiler Room', a: 'youtube.com (DRM)', h: P.artHues[3], drm: true },
  ];
  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 130 }}>
      <div style={{ padding: `${PADTOP2}px 20px 10px` }}>
        <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, letterSpacing: 1.5 }}>ANNULER</div>
        <div style={{
          marginTop: 20, background: surface, borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          border: `2px solid ${P.accent}`,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={P.accent} strokeWidth="2">
            <circle cx="8" cy="8" r="5"/><path d="M16 16l-4-4"/>
          </svg>
          <div style={{
            flex: 1, fontFamily: BD.sans, fontSize: 15, color: fg, fontWeight: 500,
          }}>overmono</div>
          <span style={{ width: 2, height: 18, background: P.accent,
            animation: 'bdblink 1s steps(2) infinite' }}/>
        </div>
        <style>{`@keyframes bdblink { 50% { opacity: 0 } }`}</style>
      </div>

      {/* Category chips */}
      <div style={{ padding: '16px 20px 4px', display: 'flex', gap: 8 }}>
        {['All', 'Tracks', 'Albums', 'Artists', 'Links'].map((f, i) => (
          <div key={f} style={{
            padding: '6px 12px', borderRadius: 999,
            fontFamily: BD.sans, fontSize: 12, fontWeight: 600,
            background: i === 0 ? P.ink : 'transparent',
            color: i === 0 ? P.inkLight : fg,
            border: i === 0 ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
          }}>{f}</div>
        ))}
      </div>

      {/* Results */}
      <div style={{ padding: '12px 20px' }}>
        <div style={{
          fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 1.5, padding: '8px 4px',
        }}>4 RÉSULTATS</div>
        <div style={{
          background: surface, borderRadius: 20, overflow: 'hidden',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          {results.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < results.length - 1 ?
                `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
              opacity: r.drm ? 0.55 : 1,
            }}>
              <div style={{
                padding: '3px 6px', borderRadius: 4,
                fontFamily: BD.mono, fontSize: 9, letterSpacing: 1,
                background: r.drm ? P.accent3 : P.ink, color: '#fff',
                minWidth: 48, textAlign: 'center',
              }}>{r.type}</div>
              <Artwork size={40} hue={r.h} palette={P} variant={i % 3}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: BD.sans, fontSize: 15, fontWeight: 600,
                  textDecoration: r.drm ? 'line-through' : 'none',
                }}>{r.t}</div>
                <div style={{ fontFamily: BD.sans, fontSize: 12, color: muted, marginTop: 2 }}>{r.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- SETTINGS ----------
function SettingsScreen({ palette, dark = false }) {
  const P = palette;
  const { bg, fg, surface, muted } = pageBase(P, dark);
  const Section = ({ title, children }) => (
    <div style={{ padding: '4px 4px 10px' }}>
      <div style={{
        fontFamily: BD.mono, fontSize: 10, color: muted, letterSpacing: 2, padding: '12px 4px 8px',
      }}>{title}</div>
      <div style={{
        background: surface, borderRadius: 18, overflow: 'hidden',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}>{children}</div>
    </div>
  );
  const Row = ({ label, value, toggle, accent, last }) => (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
    }}>
      <div style={{ flex: 1, fontFamily: BD.sans, fontSize: 14, fontWeight: 500 }}>{label}</div>
      {value && (
        <div style={{
          fontFamily: BD.mono, fontSize: 12,
          color: accent ? P.accent : muted,
        }}>{value}</div>
      )}
      {toggle != null && (
        <div style={{
          width: 40, height: 24, borderRadius: 12,
          background: toggle ? P.accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'),
          display: 'flex', alignItems: 'center', padding: 2,
          justifyContent: toggle ? 'flex-end' : 'flex-start',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 999, background: '#fff',
          }}/>
        </div>
      )}
    </div>
  );
  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', paddingBottom: 130 }}>
      <div style={{ padding: `${PADTOP2}px 20px 10px` }}>
        <div style={{
          fontFamily: BD.display, fontSize: 56, lineHeight: 0.92,
          letterSpacing: -2, textTransform: 'uppercase',
        }}>Settings.</div>
        <div style={{ fontFamily: BD.mono, fontSize: 11, color: muted, marginTop: 8 }}>
          DMUSIC v1.0.0 · BUILD 42
        </div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <Section title="LECTURE">
          <Row label="Crossfade" value="6s" accent/>
          <Row label="Gapless playback" toggle={true}/>
          <Row label="Normaliser le volume" toggle={false}/>
          <Row label="Qualité streaming" value="Auto" last/>
        </Section>

        <Section title="BIBLIOTHÈQUE">
          <Row label="Stockage utilisé" value="2.4 GB"/>
          <Row label="Tracks importées" value="247" accent/>
          <Row label="Liens sauvegardés" value="18" accent/>
          <Row label="Réindexer" value="→" last/>
        </Section>

        <Section title="APPARENCE">
          <Row label="Palette" value={P.name} accent/>
          <Row label="Mode sombre" value={dark ? 'Actif' : 'Système'}/>
          <Row label="Lock screen artwork" toggle={true} last/>
        </Section>

        <Section title="COMPTE">
          <Row label="À propos" value="→" last/>
        </Section>
      </div>

      <TabBar palette={P} dark={dark} active="library"/>
    </div>
  );
}

// ---------- LOCK SCREEN ----------
function LockScreen({ palette, dark = true }) {
  const P = palette;
  // Always dark-ish — simulates iOS lock with wallpaper
  const bg = P.bgDark;
  const fg = P.inkLight;
  return (
    <div style={{ background: bg, color: fg, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient from artwork */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 30% 30%, ${P.accent}55, transparent 60%),
                     radial-gradient(circle at 70% 80%, ${P.accent2}66, transparent 60%)`,
        filter: 'blur(40px)',
      }}/>

      {/* Time */}
      <div style={{ padding: `${PADTOP2 + 20}px 20px 0`, textAlign: 'center', position: 'relative' }}>
        <div style={{
          fontFamily: BD.mono, fontSize: 13, opacity: 0.85, letterSpacing: 1,
        }}>mardi 14 janvier</div>
        <div style={{
          fontFamily: BD.display, fontSize: 92, lineHeight: 1,
          letterSpacing: -4, marginTop: 2,
        }}>01:24</div>
      </div>

      {/* Now playing widget */}
      <div style={{
        position: 'absolute', top: 260, left: 16, right: 16,
        background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 14,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        display: 'flex', gap: 12, alignItems: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
      }}>
        <Artwork size={56} hue={P.artHues[0]} palette={P} variant={0}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: BD.mono, fontSize: 9, opacity: 0.7, letterSpacing: 2 }}>DMUSIC · NOW PLAYING</div>
          <div style={{ fontFamily: BD.sans, fontSize: 15, fontWeight: 600, marginTop: 2 }}>Copper Bones</div>
          <div style={{ fontFamily: BD.sans, fontSize: 12, opacity: 0.7, marginTop: 1 }}>Overmono</div>
          <div style={{
            marginTop: 8, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2,
          }}>
            <div style={{ width: '42%', height: '100%', background: fg, borderRadius: 2 }}/>
          </div>
        </div>
      </div>

      {/* Transport controls */}
      <div style={{
        position: 'absolute', top: 400, left: 16, right: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '14px 0', background: 'rgba(255,255,255,0.08)', borderRadius: 20,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
      }}>
        <svg width="26" height="20" viewBox="0 0 26 20" fill={fg}>
          <path d="M12 2L0 10l12 8V2zM24 2l-12 8 12 8V2z"/>
        </svg>
        <div style={{
          width: 60, height: 60, borderRadius: 999, background: 'rgba(255,255,255,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 5, height: 20, background: P.accent, borderRadius: 1 }}/>
            <div style={{ width: 5, height: 20, background: P.accent, borderRadius: 1 }}/>
          </div>
        </div>
        <svg width="26" height="20" viewBox="0 0 26 20" fill={fg}>
          <path d="M12 2l12 8-12 8V2zM0 2l12 8L0 18V2z"/>
        </svg>
      </div>

      {/* Bottom */}
      <div style={{
        position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center',
        fontFamily: BD.mono, fontSize: 11, opacity: 0.7, letterSpacing: 1.5,
      }}>
        ↑ SWIPE TO UNLOCK
      </div>
    </div>
  );
}

Object.assign(window, {
  Onboarding, ImportScreen, PlaylistsScreen, PlaylistDetail,
  QueueScreen, SearchScreen, SettingsScreen, LockScreen,
});
