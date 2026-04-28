import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Artwork } from '@/components/Artwork';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useSheet } from '@/components/Sheet';
import { usePlayerStore } from '@/store/playerStore';

export default function Library() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const importedTracks = usePlayerStore((s) => s.importedTracks);
  const favorites = usePlayerStore((s) => s.favorites);
  const playlists = usePlayerStore((s) => s.playlists);
  const addTracksToPlaylist = usePlayerStore((s) => s.addTracksToPlaylist);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);
  const removeImportedTrack = usePlayerStore((s) => s.removeImportedTrack);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const playNext = usePlayerStore((s) => s.playNext);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const isFavoriteTrack = usePlayerStore((s) => s.isFavoriteTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);
  const { playTrack, currentTrack } = usePlayerStore();
  const importedIds = new Set(importedTracks.map((t) => t.id));
  const favTracksNotImported = favorites.filter((f) => !importedIds.has(f.id));
  const tracks = [...importedTracks, ...favTracksNotImported];
  const ui = useSheet();

  const promptCreatePlaylist = (onCreated?: (id: string) => void) =>
    ui.prompt({
      title: 'Nouvelle playlist',
      placeholder: 'Nom de la playlist',
      submitLabel: 'Créer',
      onSubmit: (name) => {
        const n = name.trim();
        if (!n) return;
        const hue = palette.artHues[playlists.length % palette.artHues.length];
        const p = createPlaylist(n, hue);
        onCreated?.(p.id);
      },
    });

  const onAddToPlaylist = (tr: typeof tracks[number]) => {
    const options = playlists.map((p) => {
      const already = p.tracks.some((t) => t.id === tr.id);
      return {
        label: `${already ? '✓ ' : ''}${p.name} (${p.tracks.length})`,
        onPress: () => {
          if (already) {
            ui.alert('Déjà ajoutée', `"${tr.title}" est déjà dans "${p.name}"`);
            return;
          }
          addTracksToPlaylist(p.id, [tr]);
        },
      };
    });
    options.push({
      label: '+ Nouvelle playlist',
      onPress: () => promptCreatePlaylist((id) => addTracksToPlaylist(id, [tr])),
    });
    ui.sheet({ title: 'Ajouter à une playlist', message: tr.title, options });
  };

  const onTrackMenu = (tr: typeof tracks[number]) => {
    const isLocal = tr.id.startsWith('local-');
    const isFav = isFavoriteTrack(tr);
    const options: any[] = [
      {
        label: isFav ? '★ Retirer des favoris' : '☆ Ajouter aux favoris',
        onPress: () => toggleFavorite(tr),
      },
      { label: 'Lire ensuite', onPress: () => playNext(tr) },
      { label: "Ajouter à la file d'attente", onPress: () => enqueue(tr) },
      { label: 'Ajouter à une playlist', onPress: () => onAddToPlaylist(tr) },
      {
        label: 'Créer une playlist avec cette track',
        onPress: () => promptCreatePlaylist((id) => addTracksToPlaylist(id, [tr])),
      },
    ];
    if (isLocal) {
      options.push({
        label: 'Supprimer de la bibliothèque',
        destructive: true,
        onPress: () =>
          ui.confirm({
            title: 'Supprimer ?',
            message: `"${tr.title}" sera retirée de ta bibliothèque.`,
            destructive: true,
            confirmLabel: 'Supprimer',
            onConfirm: () => removeImportedTrack(tr.id),
          }),
      });
    }
    ui.sheet({ title: tr.title, message: tr.artist, options });
  };

  const tagBg = (tag: string) =>
    tag === 'FAV'
      ? palette.accent2
      : tag === 'NEW'
      ? palette.accent
      : tag === 'LINK'
      ? palette.accent3
      : palette.ink;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: FONTS.display, fontSize: 22, letterSpacing: -0.5, color: c.fg }}>
                DMUSIC
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => router.push('/search')}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    backgroundColor: c.softFill,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="search" size={16} color={c.fg} />
                </Pressable>
                <Pressable
                  onPress={() => router.push('/import')}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    backgroundColor: palette.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="plus" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 64,
                lineHeight: 58,
                marginTop: 28,
                letterSpacing: -2,
                textTransform: 'uppercase',
                color: c.fg,
              }}
            >
              Library.
            </Text>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: c.muted,
                marginTop: 10,
                letterSpacing: 0.5,
              }}
            >
              {tracks.length} TRACK{tracks.length > 1 ? 'S' : ''} · {importedTracks.length} IMPORT{importedTracks.length > 1 ? 'ÉS' : 'É'}
            </Text>
          </View>

          {/* Now playing card */}
          {currentTrack && (
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Pressable
              onPress={() => router.push('/(tabs)/player')}
              style={{
                backgroundColor: palette.accent,
                padding: 18,
                borderRadius: 22,
                flexDirection: 'row',
                gap: 14,
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <View style={{ position: 'absolute', top: -40, right: -40, opacity: 0.4 }}>
                <Artwork size={180} hue={currentTrack.hue + 60} variant={currentTrack.variant ?? 1} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 2, color: '#fff', opacity: 0.9 }}
                >
                  ◉ NOW PLAYING
                </Text>
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 26,
                    marginTop: 6,
                    lineHeight: 26,
                    textTransform: 'uppercase',
                    color: '#fff',
                  }}
                >
                  {currentTrack.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: FONTS.sans, fontSize: 13, marginTop: 8, color: '#fff', opacity: 0.9 }}
                >
                  {currentTrack.artist}
                  {currentTrack.album ? (
                    <>
                      {' · '}
                      <Text style={{ fontFamily: FONTS.serifI, fontSize: 16 }}>
                        {currentTrack.album}
                      </Text>
                    </>
                  ) : null}
                </Text>
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  toggle();
                }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isPlaying ? (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <View style={{ width: 5, height: 18, backgroundColor: palette.accent, borderRadius: 1 }} />
                    <View style={{ width: 5, height: 18, backgroundColor: palette.accent, borderRadius: 1 }} />
                  </View>
                ) : (
                  <Icon name="play" size={18} color={palette.accent} />
                )}
              </Pressable>
            </Pressable>
          </View>
          )}

          {/* Tracks */}
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 8,
              }}
            >
              <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 1.5 }}>
                TRACKS · {tracks.length}
              </Text>
              <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 1.5 }}>
                RECENT ↓
              </Text>
            </View>
            {!tracks.length ? (
              <Pressable
                onPress={() => router.push('/import')}
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 22,
                  padding: 24,
                  borderWidth: dark ? 1 : 0,
                  borderColor: c.hairline,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 2 }}>
                  AUCUNE TRACK
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
                  Importe des fichiers ou colle un lien depuis l'onglet Links.
                </Text>
                <View
                  style={{
                    marginTop: 16,
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 999,
                    backgroundColor: palette.accent,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 12,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      color: '#fff',
                    }}
                  >
                    Importer
                  </Text>
                </View>
              </Pressable>
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
                const displayTag = isFavoriteTrack(tr) ? 'FAV' : tr.tag;
                return (
                <Pressable
                  key={tr.id}
                  onPress={() => {
                    playTrack(tr);
                    router.push('/(tabs)/player');
                  }}
                  onLongPress={() => onTrackMenu(tr)}
                  delayLongPress={350}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    paddingHorizontal: 14,
                    borderBottomWidth: i < tracks.length - 1 ? 1 : 0,
                    borderBottomColor: c.hairline,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      color: c.muted,
                      width: 20,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Cover size={40} track={tr} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{ fontFamily: FONTS.sansSemi, fontSize: 15, color: c.fg, lineHeight: 18 }}
                      numberOfLines={1}
                    >
                      {tr.title}
                    </Text>
                    <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: c.muted, marginTop: 2 }}>
                      {tr.artist}
                    </Text>
                  </View>
                  {displayTag ? (
                    <View
                      style={{
                        paddingVertical: 3,
                        paddingHorizontal: 7,
                        borderRadius: 4,
                        backgroundColor: tagBg(displayTag),
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 9,
                          letterSpacing: 1,
                          color: '#fff',
                        }}
                      >
                        {displayTag}
                      </Text>
                    </View>
                  ) : null}
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

          {/* Playlists */}
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 10,
                color: c.muted,
                letterSpacing: 1.5,
                padding: 8,
              }}
            >
              PLAYLISTS · {playlists.length}
            </Text>

            <Pressable
              onPress={() =>
                promptCreatePlaylist((id) =>
                  router.push({ pathname: '/playlists/[id]', params: { id } })
                )
              }
              style={{
                backgroundColor: c.surface,
                borderRadius: 22,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                borderWidth: 2,
                borderColor: palette.accent,
                borderStyle: 'dashed',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: palette.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="plus" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 16,
                    textTransform: 'uppercase',
                    letterSpacing: -0.3,
                    color: c.fg,
                  }}
                >
                  Créer une playlist
                </Text>
                <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: c.muted, marginTop: 2 }}>
                  Regroupe tes tracks comme tu veux
                </Text>
              </View>
            </Pressable>

            {playlists.length > 0 && (
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: c.surface,
                  borderRadius: 22,
                  overflow: 'hidden',
                  borderWidth: dark ? 1 : 0,
                  borderColor: c.hairline,
                }}
              >
                {playlists.map((p, i) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push({ pathname: '/playlists/[id]', params: { id: p.id } })}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth: i < playlists.length - 1 ? 1 : 0,
                      borderBottomColor: c.hairline,
                    }}
                  >
                    <Artwork size={44} hue={p.hue} variant={(i % 3) as 0 | 1 | 2} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: FONTS.sansSemi,
                          fontSize: 15,
                          color: c.fg,
                          lineHeight: 18,
                        }}
                      >
                        {p.name}
                      </Text>
                      <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: c.muted, marginTop: 2 }}>
                        {p.tracks.length} track{p.tracks.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                    <Icon name="chevronRight" size={14} color={c.muted} />
                  </Pressable>
                ))}
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
