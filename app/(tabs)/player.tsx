import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Animated, PanResponder, Dimensions, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Canvas, RoundedRect, BlurMask } from '@shopify/react-native-skia';
import {
  Easing as REasing,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/Icon';
import { useSheet } from '@/components/Sheet';
import { usePlayerStore } from '@/store/playerStore';

// LampAura: glowing border around the cover, driven by the song's pre-computed
// RMS envelope (when available) or by a synth fallback. Position is extrapolated
// at 60fps via useFrameCallback so the lamp stays smooth between expo-av updates
// (which arrive at ~5Hz only). Paused = invisible (amp gates everything).
const LAMP_PAD = 180;
function LampAura({
  size,
  color,
  isPlaying,
}: {
  size: number;
  color: string;
  isPlaying: boolean;
}) {
  const W = size + LAMP_PAD * 2;
  const COVER_RADIUS = 22;

  const beatPhase = useSharedValue(0);
  const subPhase = useSharedValue(0);
  const amp = useSharedValue(0);

  // Subscribe to envelope + position from the store
  const envelopeArr = usePlayerStore((s) => s.envelope);
  const samplesPerSec = usePlayerStore((s) => s.envelopeSamplesPerSec);
  const positionMs = usePlayerStore((s) => s.positionMs);

  // Worklet-accessible mirrors of the JS state
  const envShared = useSharedValue<number[] | null>(null);
  const samplesPerSecShared = useSharedValue(20);
  const positionMsShared = useSharedValue(0);
  const positionUpdatedAtShared = useSharedValue(0);
  const isPlayingShared = useSharedValue(false);

  useEffect(() => {
    envShared.value = envelopeArr;
  }, [envelopeArr, envShared]);

  useEffect(() => {
    samplesPerSecShared.value = samplesPerSec;
  }, [samplesPerSec, samplesPerSecShared]);

  useEffect(() => {
    positionMsShared.value = positionMs;
    positionUpdatedAtShared.value = Date.now();
  }, [positionMs, positionMsShared, positionUpdatedAtShared]);

  useEffect(() => {
    isPlayingShared.value = isPlaying;
  }, [isPlaying, isPlayingShared]);

  // Per-frame clock — used as a dependency to force re-eval at 60fps
  const frameTick = useSharedValue(0);
  useFrameCallback((info) => {
    frameTick.value = info.timestamp;
  }, true);

  useEffect(() => {
    beatPhase.value = withRepeat(
      withTiming(1, { duration: 970, easing: REasing.linear }),
      -1,
      false
    );
    subPhase.value = withRepeat(
      withTiming(1, { duration: 1430, easing: REasing.linear }),
      -1,
      false
    );
  }, [beatPhase, subPhase]);

  useEffect(() => {
    amp.value = withTiming(isPlaying ? 1 : 0, {
      duration: 500,
      easing: REasing.inOut(REasing.cubic),
    });
  }, [isPlaying, amp]);

  // Audio-reactive signal (0..1). Reads from RMS envelope if available, else falls
  // back to the synth oscillators. Position is extrapolated based on Date.now()
  // since the last positionMs update so we sample the envelope at 60fps.
  const audioSignal = useDerivedValue(() => {
    // Force re-eval each frame (DerivedValues only update when deps change)
    const _ = frameTick.value;

    const env = envShared.value;
    if (env && env.length > 0) {
      let pos = positionMsShared.value;
      if (isPlayingShared.value) {
        pos += Date.now() - positionUpdatedAtShared.value;
      }
      const idx = Math.floor((pos / 1000) * samplesPerSecShared.value);
      const clamped = Math.max(0, Math.min(env.length - 1, idx));
      return env[clamped] ?? 0;
    }
    // Synth fallback (no envelope yet — backend still computing, or local file)
    const beat = 0.5 + 0.5 * Math.sin(beatPhase.value * 2 * Math.PI);
    const sub = 0.5 + 0.5 * Math.sin(subPhase.value * 2 * Math.PI);
    return 0.6 * beat + 0.4 * sub;
  });

  // 3 outer halos with radial fade-out via BlurMask style="outer" (gaussian envelope
  // outside the stroke only, stroke itself invisible) → near cover = bright,
  // farther = dim, then 0. Each layer's blur radius determines its reach.
  // Far halo: widest reach, lowest peak (the diffuse outer glow)
  const farOpacity = useDerivedValue(
    () => amp.value * (0.05 + 0.55 * audioSignal.value)
  );
  const farBlur = useDerivedValue(() => 110 + 90 * audioSignal.value);

  // Mid halo: medium reach
  const midOpacity = useDerivedValue(
    () => amp.value * (0.08 + 0.7 * audioSignal.value)
  );
  const midBlur = useDerivedValue(() => 60 + 60 * audioSignal.value);

  // Near halo: tight, brightest near the cover edge
  const nearOpacity = useDerivedValue(
    () => amp.value * (0.1 + 0.75 * audioSignal.value)
  );
  const nearBlur = useDerivedValue(() => 25 + 35 * audioSignal.value);

  // Filament: the sharp bright LED line right on the cover edge
  const filamentOpacity = useDerivedValue(
    () => amp.value * (0.3 + 0.7 * audioSignal.value)
  );
  const filamentBlur = useDerivedValue(() => 1 + 4 * audioSignal.value);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -LAMP_PAD,
        top: -LAMP_PAD,
        width: W,
        height: W,
      }}
    >
      <Canvas style={{ width: W, height: W }}>
        {/* FAR halo — widest blur, drawn first (back-most) */}
        <RoundedRect
          x={LAMP_PAD}
          y={LAMP_PAD}
          width={size}
          height={size}
          r={COVER_RADIUS}
          color={color}
          opacity={farOpacity}
          style="stroke"
          strokeWidth={3}
        >
          <BlurMask blur={farBlur} style="outer" />
        </RoundedRect>

        {/* MID halo — medium blur */}
        <RoundedRect
          x={LAMP_PAD}
          y={LAMP_PAD}
          width={size}
          height={size}
          r={COVER_RADIUS}
          color={color}
          opacity={midOpacity}
          style="stroke"
          strokeWidth={3}
        >
          <BlurMask blur={midBlur} style="outer" />
        </RoundedRect>

        {/* NEAR halo — tight blur, brightest near cover */}
        <RoundedRect
          x={LAMP_PAD}
          y={LAMP_PAD}
          width={size}
          height={size}
          r={COVER_RADIUS}
          color={color}
          opacity={nearOpacity}
          style="stroke"
          strokeWidth={3}
        >
          <BlurMask blur={nearBlur} style="outer" />
        </RoundedRect>

        {/* FILAMENT — the bright LED line ON the cover edge (style=solid keeps it sharp) */}
        <RoundedRect
          x={LAMP_PAD}
          y={LAMP_PAD}
          width={size}
          height={size}
          r={COVER_RADIUS}
          color={color}
          opacity={filamentOpacity}
          style="stroke"
          strokeWidth={2}
        >
          <BlurMask blur={filamentBlur} style="solid" />
        </RoundedRect>
      </Canvas>
    </View>
  );
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function Waveform({
  progress,
  accent,
  inactive,
  seed,
  onSeek,
}: {
  progress: number;
  accent: string;
  inactive: string;
  seed: string;
  onSeek: (fraction: number) => void;
}) {
  const count = 60;
  const viewRef = useRef<View>(null);
  const layoutRef = useRef({ x: 0, width: 0 });
  const [layoutW, setLayoutW] = useState(0);
  const base = hashSeed(seed) * 1000;

  const heights = React.useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const a = Math.sin((i + base) * 0.55);
        const b = Math.cos((i + base * 1.7) * 0.31);
        const c = Math.sin((i + base * 0.4) * 1.13);
        return 6 + Math.abs(a * 16 + b * 9 + c * 5);
      }),
    [seed]
  );

  const progressVal = useRef(new Animated.Value(progress)).current;
  const lastProgressRef = useRef(progress);

  useEffect(() => {
    progressVal.setValue(0);
    lastProgressRef.current = 0;
  }, [seed, progressVal]);

  const isScrubbing = useRef(false);
  const lastSeekTime = useRef(0);
  const SEEK_THROTTLE_MS = 70;

  useEffect(() => {
    const prev = lastProgressRef.current;
    lastProgressRef.current = progress;
    if (isScrubbing.current) return;
    const jumped = Math.abs(progress - prev) > 0.05;
    if (jumped) {
      progressVal.setValue(progress);
    } else {
      Animated.timing(progressVal, {
        toValue: progress,
        duration: 260,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, progressVal]);

  const overlayWidth = progressVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(layoutW, 1)],
    extrapolate: 'clamp',
  });

  const measure = () => {
    viewRef.current?.measureInWindow((x, _y, w) => {
      layoutRef.current = { x, width: w };
    });
  };

  const handle = (pageX: number, commit: boolean) => {
    const { x, width } = layoutRef.current;
    if (width <= 0) return;
    const f = Math.max(0, Math.min(1, (pageX - x) / width));
    progressVal.setValue(f);
    const now = Date.now();
    if (commit || now - lastSeekTime.current >= SEEK_THROTTLE_MS) {
      lastSeekTime.current = now;
      onSeek(f);
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (_e, g) => {
        isScrubbing.current = true;
        progressVal.stopAnimation();
        measure();
        setTimeout(() => handle(g.x0, false), 0);
      },
      onPanResponderMove: (_e, g) => handle(g.moveX, false),
      onPanResponderRelease: (_e, g) => {
        handle(g.moveX || g.x0, true);
        isScrubbing.current = false;
      },
      onPanResponderTerminate: () => {
        isScrubbing.current = false;
      },
    })
  ).current;

  const onLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    if (w !== layoutW) setLayoutW(w);
    measure();
  };

  return (
    <View
      ref={viewRef}
      onLayout={onLayout}
      {...pan.panHandlers}
      style={{ flexDirection: 'row', alignItems: 'center', height: 44, gap: 2, paddingVertical: 4 }}
    >
      {heights.map((h, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{ flex: 1, height: h, backgroundColor: inactive, borderRadius: 1 }}
        />
      ))}
      {layoutW > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 4,
            bottom: 4,
            width: overlayWidth,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 36,
              gap: 2,
              width: layoutW,
            }}
          >
            {heights.map((h, i) => (
              <View
                key={i}
                style={{ flex: 1, height: h, backgroundColor: accent, borderRadius: 1 }}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function Player() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const { currentTrack, isPlaying, toggle, positionMs, durationMs } = usePlayerStore();
  const playlists = usePlayerStore((s) => s.playlists);
  const queue = usePlayerStore((s) => s.queue);
  const currentPlaylistId = usePlayerStore((s) => s.currentPlaylistId);
  const addTracksToPlaylist = usePlayerStore((s) => s.addTracksToPlaylist);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);
  const removeImportedTrack = usePlayerStore((s) => s.removeImportedTrack);
  const skipNext = usePlayerStore((s) => s.skipNext);
  const skipPrev = usePlayerStore((s) => s.skipPrev);
  const seekFraction = usePlayerStore((s) => s.seekFraction);
  const playedHistory = usePlayerStore((s) => s.playedHistory);
  const favorites = usePlayerStore((s) => s.favorites);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const isFavoriteTrack = usePlayerStore((s) => s.isFavoriteTrack);
  const t = currentTrack;
  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  const SCREEN_W = Dimensions.get('window').width;
  const COVER_SIZE = 280;
  const SLOT_W = SCREEN_W;
  const SWIPE_THRESHOLD = 70;
  const coverX = useRef(new Animated.Value(0)).current;

  const nextTrack = (() => {
    if (queue.length) return queue[0];
    if (currentPlaylistId) {
      const p = playlists.find((x) => x.id === currentPlaylistId);
      if (p && p.tracks.length) return p.tracks[0];
    }
    return null;
  })();
  const prevTrack = playedHistory[0] ?? null;
  const hasNext = !!nextTrack;
  const hasPrev = !!prevTrack;

  const stateRef = useRef({ hasNext, hasPrev });
  stateRef.current = { hasNext, hasPrev };
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const isAnimatingRef = useRef(false);

  const coverPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => {
        if (isAnimatingRef.current) return false;
        return Math.abs(g.dx) > 5 && Math.abs(g.dx) > Math.abs(g.dy) * 2;
      },
      onMoveShouldSetPanResponderCapture: (_, g) => {
        if (isAnimatingRef.current) return false;
        return Math.abs(g.dx) > 5 && Math.abs(g.dx) > Math.abs(g.dy) * 2;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        setScrollEnabled(false);
        coverX.stopAnimation();
        coverX.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        const { hasNext: hn, hasPrev: hp } = stateRef.current;
        const dx = g.dx;
        if ((dx < 0 && !hn) || (dx > 0 && !hp)) {
          coverX.setValue(dx * 0.25);
        } else {
          coverX.setValue(dx);
        }
      },
      onPanResponderRelease: (_, g) => {
        setScrollEnabled(true);
        const { hasNext: hn, hasPrev: hp } = stateRef.current;
        const finish = (cb: () => void) => {
          isAnimatingRef.current = true;
          cb();
        };
        if (g.dx < -SWIPE_THRESHOLD && hn) {
          finish(() => {
            Animated.timing(coverX, { toValue: -SLOT_W, duration: 180, useNativeDriver: true }).start(() => {
              usePlayerStore.getState().skipNext();
              coverX.setValue(0);
              isAnimatingRef.current = false;
            });
          });
        } else if (g.dx > SWIPE_THRESHOLD && hp) {
          finish(() => {
            Animated.timing(coverX, { toValue: SLOT_W, duration: 180, useNativeDriver: true }).start(() => {
              usePlayerStore.getState().skipPrev();
              coverX.setValue(0);
              isAnimatingRef.current = false;
            });
          });
        } else {
          Animated.spring(coverX, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        Animated.spring(coverX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const ui = useSheet();

  // After all hooks: render the empty state if no track is loaded.
  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 2 }}>
          NOTHING PLAYING
        </Text>
        <Text style={{ fontFamily: FONTS.sans, fontSize: 14, color: c.muted, marginTop: 10, textAlign: 'center' }}>
          Lance un titre depuis Library ou colle un lien.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 24, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, backgroundColor: palette.accent }}
        >
          <Text style={{ fontFamily: FONTS.sansSemi, color: '#fff' }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const openAddToPlaylist = () => {
    if (!t) return;
    const options = playlists.map((p) => {
      const already = p.tracks.some((x) => x.id === t.id);
      return {
        label: `${already ? '✓ ' : ''}${p.name} (${p.tracks.length})`,
        onPress: () => {
          if (already) {
            ui.alert('Déjà ajoutée', `"${t.title}" est déjà dans "${p.name}"`);
            return;
          }
          addTracksToPlaylist(p.id, [t]);
        },
      };
    });
    options.push({
      label: '+ Nouvelle playlist',
      onPress: () =>
        ui.prompt({
          title: 'Nouvelle playlist',
          placeholder: 'Nom de la playlist',
          submitLabel: 'Créer',
          onSubmit: (name) => {
            const n = name.trim();
            if (!n) return;
            const hue = palette.artHues[playlists.length % palette.artHues.length];
            const p = createPlaylist(n, hue);
            addTracksToPlaylist(p.id, [t]);
          },
        }),
    });
    ui.sheet({ title: 'Ajouter à une playlist', message: t.title, options });
  };

  const openMenu = () => {
    if (!t) return;
    const isLocal = t.id.startsWith('local-');
    const isFav = isFavoriteTrack(t);
    const options: any[] = [
      {
        label: isFav ? '★ Retirer des favoris' : '☆ Ajouter aux favoris',
        onPress: () => toggleFavorite(t),
      },
      { label: 'Ajouter à une playlist', onPress: openAddToPlaylist },
      { label: "Voir la file d'attente", onPress: () => router.push('/queue') },
    ];
    if (isLocal) {
      options.push({
        label: "Supprimer de la bibliothèque",
        destructive: true,
        onPress: () =>
          ui.confirm({
            title: 'Supprimer ?',
            message: `"${t.title}" sera retirée de ta bibliothèque.`,
            destructive: true,
            confirmLabel: 'Supprimer',
            onConfirm: () => {
              removeImportedTrack(t.id);
              router.back();
            },
          }),
      });
    }
    ui.sheet({ title: t.title, message: t.artist, options });
  };
  const fmt = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, overflow: 'hidden' }}>
      {/* ambient glow */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -80,
          left: -80,
          right: -80,
          height: 420,
          backgroundColor: palette.accent,
          opacity: 0.33,
          borderBottomLeftRadius: 400,
          borderBottomRightRadius: 400,
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          {/* Top chrome */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                backgroundColor: c.softFill,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="chevronDown" size={18} color={c.fg} />
            </Pressable>
            <View style={{ alignItems: 'center', maxWidth: '60%' }}>
              {(() => {
                const plName = currentPlaylistId
                  ? playlists.find((p) => p.id === currentPlaylistId)?.name
                  : null;
                if (plName) {
                  return (
                    <>
                      <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 2 }}>
                        DE LA PLAYLIST
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: FONTS.sansSemi, fontSize: 13, color: c.fg, marginTop: 2 }}
                      >
                        {plName}
                      </Text>
                    </>
                  );
                }
                if (t.tag === 'LINK') {
                  return (
                    <>
                      <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 2 }}>
                        DEPUIS UN LIEN
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: FONTS.sansSemi, fontSize: 13, color: c.fg, marginTop: 2 }}
                      >
                        {t.artist}
                      </Text>
                    </>
                  );
                }
                return (
                  <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 2 }}>
                    ◉ EN LECTURE
                  </Text>
                );
              })()}
            </View>
            <Pressable
              onPress={openMenu}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                backgroundColor: c.softFill,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="dots" size={18} color={c.fg} />
            </Pressable>
          </View>

          {/* Cover pager */}
          <View style={{ marginTop: 48, height: COVER_SIZE, width: '100%' }}>
            <Animated.View
              {...coverPan.panHandlers}
              style={{
                width: SLOT_W * 3,
                height: COVER_SIZE,
                flexDirection: 'row',
                marginLeft: -SLOT_W,
                transform: [{ translateX: coverX }],
              }}
            >
              <View style={{ width: SLOT_W, alignItems: 'center', justifyContent: 'center' }}>
                {prevTrack ? (
                  <View style={{ borderRadius: 22, overflow: 'hidden', opacity: 0.85 }}>
                    <Cover size={COVER_SIZE} track={prevTrack} />
                  </View>
                ) : null}
              </View>
              <View style={{ width: SLOT_W, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: COVER_SIZE,
                    height: COVER_SIZE,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LampAura size={COVER_SIZE} color={palette.accent} isPlaying={isPlaying} />
                  <View
                    style={{
                      borderRadius: 22,
                      overflow: 'hidden',
                      shadowColor: palette.accent,
                      shadowOffset: { width: 0, height: 18 },
                      shadowOpacity: 0.35,
                      shadowRadius: 24,
                      elevation: 24,
                    }}
                  >
                    <Cover size={COVER_SIZE} track={t} />
                  </View>
                </View>
              </View>
              <View style={{ width: SLOT_W, alignItems: 'center', justifyContent: 'center' }}>
                {nextTrack ? (
                  <View style={{ borderRadius: 22, overflow: 'hidden', opacity: 0.85 }}>
                    <Cover size={COVER_SIZE} track={nextTrack} />
                  </View>
                ) : null}
              </View>
            </Animated.View>
          </View>
          {(hasPrev || hasNext) && (
            <Text
              style={{
                marginTop: 14,
                textAlign: 'center',
                fontFamily: FONTS.mono,
                fontSize: 9,
                color: c.muted,
                letterSpacing: 2,
              }}
            >
              {hasPrev ? '← ' : '   '}SWIPE{hasNext ? ' →' : '   '}
            </Text>
          )}

          {/* Title */}
          <View style={{ paddingHorizontal: 20, marginTop: 24, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 38,
                letterSpacing: -1.5,
                lineHeight: 36,
                textTransform: 'uppercase',
                color: c.fg,
                textAlign: 'center',
              }}
            >
              {t.title}
            </Text>
            <Text
              style={{ fontFamily: FONTS.sans, fontSize: 15, color: c.muted, marginTop: 8, textAlign: 'center' }}
            >
              {t.artist}
              {t.album ? (
                <>
                  {' — '}
                  <Text style={{ fontFamily: FONTS.serifI, fontSize: 18, color: palette.accent }}>
                    {t.album}
                  </Text>
                </>
              ) : null}
            </Text>
          </View>

          {/* Waveform */}
          <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
            <Waveform
              progress={progress}
              accent={palette.accent}
              inactive={dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
              seed={t.id + '|' + t.title}
              onSeek={seekFraction}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted }}>{fmt(positionMs)}</Text>
              <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted }}>
                {durationMs ? '-' + fmt(durationMs - positionMs) : '—:—'}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View
            style={{
              paddingHorizontal: 20,
              marginTop: 28,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              onPress={() => seekFraction(0)}
              hitSlop={10}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: c.softFill,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18, color: c.fg, marginTop: -2 }}>↺</Text>
            </Pressable>
            <Pressable
              hitSlop={10}
              onPress={skipPrev}
              disabled={!hasPrev}
              style={{ opacity: hasPrev ? 1 : 0.35 }}
            >
              <Icon name="prev" size={28} color={c.fg} />
            </Pressable>
            <Pressable
              onPress={toggle}
              style={{
                width: 82,
                height: 82,
                borderRadius: 999,
                backgroundColor: palette.accent,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: palette.accent,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              {isPlaying ? (
                <View style={{ flexDirection: 'row', gap: 7 }}>
                  <View style={{ width: 7, height: 28, backgroundColor: '#fff', borderRadius: 1 }} />
                  <View style={{ width: 7, height: 28, backgroundColor: '#fff', borderRadius: 1 }} />
                </View>
              ) : (
                <Icon name="play" size={34} color="#fff" />
              )}
            </Pressable>
            <Pressable
              hitSlop={10}
              onPress={skipNext}
              disabled={!queue.length && !currentPlaylistId}
              style={{ opacity: queue.length || currentPlaylistId ? 1 : 0.35 }}
            >
              <Icon name="next" size={28} color={c.fg} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/queue')}
              hitSlop={10}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: c.softFill,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="queue" size={16} color={c.fg} />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* drag indicator */}
      <View
        style={{
          position: 'absolute',
          bottom: 14,
          alignSelf: 'center',
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: c.muted,
          opacity: 0.4,
        }}
      />
    </View>
  );
}
