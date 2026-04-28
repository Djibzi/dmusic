import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Icon } from '@/components/Icon';
import { Artwork } from '@/components/Artwork';
import { Cover } from '@/components/Cover';
import { TabBar } from '@/components/TabBar';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useSheet } from '@/components/Sheet';
import { usePlayerStore } from '@/store/playerStore';

function EqualizerBars({ color }: { color: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 180);
    return () => clearInterval(id);
  }, []);
  const heights = [10 + (tick % 2) * 2, 14 - (tick % 3) * 3, 6 + (tick % 2) * 6, 12 - (tick % 2) * 4];
  return (
    <View style={{ flexDirection: 'row', gap: 1.5, alignItems: 'flex-end', height: 14 }}>
      {heights.map((h, j) => (
        <View key={j} style={{ width: 2, height: h, backgroundColor: color, borderRadius: 1 }} />
      ))}
    </View>
  );
}

export default function PlaylistDetail() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const playlist = usePlayerStore((s) => s.playlists.find((p) => p.id === id));
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const playPlaylist = usePlayerStore((s) => s.playPlaylist);
  const removeTrackFromPlaylist = usePlayerStore((s) => s.removeTrackFromPlaylist);
  const renamePlaylist = usePlayerStore((s) => s.renamePlaylist);
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const playNext = usePlayerStore((s) => s.playNext);
  const ui = useSheet();

  if (!playlist) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 2 }}>
          PLAYLIST INTROUVABLE
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 20, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, backgroundColor: palette.accent }}
        >
          <Text style={{ fontFamily: FONTS.sansSemi, color: '#fff' }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const onMenu = () => {
    ui.sheet({
      title: playlist.name,
      options: [
        {
          label: 'Renommer',
          onPress: () =>
            ui.prompt({
              title: 'Renommer',
              defaultValue: playlist.name,
              submitLabel: 'Renommer',
              onSubmit: (name) => {
                if (name.trim()) renamePlaylist(playlist.id, name);
              },
            }),
        },
        {
          label: 'Supprimer la playlist',
          destructive: true,
          onPress: () =>
            ui.confirm({
              title: 'Supprimer ?',
              message: `"${playlist.name}" sera supprimée.`,
              destructive: true,
              confirmLabel: 'Supprimer',
              onConfirm: () => {
                deletePlaylist(playlist.id);
                router.back();
              },
            }),
        },
      ],
    });
  };

  const onTrackLongPress = (tr: typeof playlist.tracks[number]) => {
    ui.sheet({
      title: tr.title,
      message: tr.artist,
      options: [
        { label: 'Lire ensuite', onPress: () => playNext(tr) },
        { label: "Ajouter à la file d'attente", onPress: () => enqueue(tr) },
        {
          label: 'Retirer de la playlist',
          destructive: true,
          onPress: () => removeTrackFromPlaylist(playlist.id, tr.id),
        },
      ],
    });
  };

  const tracks = playlist.tracks;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 320,
                backgroundColor: palette.accent,
                opacity: 0.4,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pressable onPress={() => router.back()}>
                <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.fg, letterSpacing: 1.5 }}>
                  ← PLAYLISTS
                </Text>
              </Pressable>
              <Pressable onPress={onMenu}>
                <Text style={{ fontFamily: FONTS.mono, fontSize: 16, color: c.fg, letterSpacing: 1.5 }}>⋯</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-end', marginTop: 20 }}>
              <View style={{ borderRadius: 16, overflow: 'hidden' }}>
                <Artwork size={120} hue={playlist.hue} variant={0} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 2 }}>
                  PLAYLIST · {tracks.length}
                </Text>
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 34,
                    textTransform: 'uppercase',
                    marginTop: 4,
                    lineHeight: 32,
                    letterSpacing: -1.5,
                    color: c.fg,
                  }}
                >
                  {playlist.name}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable
                onPress={() => playPlaylist(playlist.id, 0)}
                disabled={!tracks.length}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 999,
                  backgroundColor: palette.accent,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: tracks.length ? 1 : 0.4,
                }}
              >
                <Icon name="play" size={12} color="#fff" />
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 13,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: '#fff',
                  }}
                >
                  Play
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!tracks.length) return;
                  const idx = Math.floor(Math.random() * tracks.length);
                  playPlaylist(playlist.id, idx);
                }}
                disabled={!tracks.length}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 22,
                  borderRadius: 999,
                  backgroundColor: c.softFill,
                  opacity: tracks.length ? 1 : 0.4,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 13,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: c.fg,
                  }}
                >
                  Shuffle
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
            {!tracks.length ? (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 2 }}>
                  VIDE
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 13,
                    color: c.muted,
                    marginTop: 10,
                    textAlign: 'center',
                    maxWidth: 260,
                    lineHeight: 20,
                  }}
                >
                  Depuis la bibliothèque, maintiens une track pour l'ajouter ici.
                </Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 22,
                  overflow: 'hidden',
                  borderWidth: dark ? 1 : 0,
                  borderColor: c.hairline,
                }}
              >
                {tracks.map((tr, i) => {
                  const playing = currentTrack?.id === tr.id;
                  return (
                    <Pressable
                      key={tr.id}
                      onPress={() => {
                        playPlaylist(playlist.id, i);
                        router.push('/(tabs)/player');
                      }}
                      onLongPress={() => onTrackLongPress(tr)}
                      delayLongPress={350}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        paddingHorizontal: 14,
                        backgroundColor: playing ? (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)') : 'transparent',
                        borderBottomWidth: i < tracks.length - 1 ? 1 : 0,
                        borderBottomColor: c.hairline,
                      }}
                    >
                      <View style={{ width: 20, alignItems: 'center' }}>
                        {playing ? (
                          <EqualizerBars color={palette.accent} />
                        ) : (
                          <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted }}>
                            {String(i + 1).padStart(2, '0')}
                          </Text>
                        )}
                      </View>
                      <Cover size={40} track={tr} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: FONTS.sansSemi,
                            fontSize: 15,
                            color: playing ? palette.accent : c.fg,
                            lineHeight: 18,
                          }}
                        >
                          {tr.title}
                        </Text>
                        <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: c.muted, marginTop: 2 }}>
                          {tr.artist}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 11,
                          color: c.muted,
                          minWidth: 32,
                          textAlign: 'right',
                        }}
                      >
                        {tr.duration}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <MiniPlayer />
      <TabBar active="library" />
    </View>
  );
}
