import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useSheet } from '@/components/Sheet';
import { usePlayerStore } from '@/store/playerStore';
import * as Storage from '@/services/Storage';

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'min ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

const COMPAT = [
  { l: '.mp3', ok: true },
  { l: '.m4a', ok: true },
  { l: '.ogg', ok: true },
  { l: 'YouTube', ok: true },
  { l: 'SoundCloud', ok: true },
  { l: 'Spotify', ok: false },
];

export default function LinksScreen() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const { playFromUrl, linkHistory } = usePlayerStore();
  const playlists = usePlayerStore((s) => s.playlists);
  const addTracksToPlaylist = usePlayerStore((s) => s.addTracksToPlaylist);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);
  const removeLinkHistoryItem = usePlayerStore((s) => s.removeLinkHistoryItem);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const playNext = usePlayerStore((s) => s.playNext);
  const favorites = usePlayerStore((s) => s.favorites);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const isFavoriteTrack = usePlayerStore((s) => s.isFavoriteTrack);
  const ui = useSheet();

  const history = linkHistory.map((h) => ({
    id: h.id,
    title: h.title,
    host: h.host,
    time: relTime(h.playedAt),
    hue: h.hue,
    ok: true,
    url: h.url,
    durationMs: h.durationMs,
    thumbnail: h.thumbnail,
  }));

  const fmtDur = (ms?: number) => {
    if (!ms || ms <= 0) return '—';
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const linkToTrack = (h: typeof history[number]) => ({
    id: h.id,
    title: h.title,
    artist: h.host,
    duration: fmtDur(h.durationMs),
    expectedDurationMs: h.durationMs,
    uri: h.url,
    originalUrl: h.url,
    hue: h.hue,
    variant: 0 as 0 | 1 | 2,
    tag: 'LINK' as const,
    thumbnail: h.thumbnail,
  });

  const promptCreatePlaylist = (onCreated: (id: string) => void) =>
    ui.prompt({
      title: 'Nouvelle playlist',
      placeholder: 'Nom de la playlist',
      submitLabel: 'Créer',
      onSubmit: (name) => {
        const n = name.trim();
        if (!n) return;
        const hue = palette.artHues[playlists.length % palette.artHues.length];
        const p = createPlaylist(n, hue);
        onCreated(p.id);
      },
    });

  const openAddToPlaylistSheet = (h: typeof history[number]) => {
    const options = playlists.map((p) => {
      const already = p.tracks.some((t) => t.id === h.id);
      return {
        label: `${already ? '✓ ' : ''}${p.name} (${p.tracks.length})`,
        onPress: () => {
          if (already) {
            ui.alert('Déjà ajouté', `"${h.title}" est déjà dans "${p.name}"`);
            return;
          }
          addTracksToPlaylist(p.id, [linkToTrack(h)]);
        },
      };
    });
    options.push({
      label: '+ Nouvelle playlist',
      onPress: () => promptCreatePlaylist((id) => addTracksToPlaylist(id, [linkToTrack(h)])),
    });
    ui.sheet({ title: 'Ajouter à une playlist', message: h.title, options });
  };

  const onLinkLongPress = (h: typeof history[number]) => {
    const isFav = isFavoriteTrack(linkToTrack(h));
    ui.sheet({
      title: h.title,
      message: h.host,
      options: [
        {
          label: isFav ? '★ Retirer des favoris' : '☆ Ajouter aux favoris',
          onPress: () => toggleFavorite(linkToTrack(h)),
        },
        { label: 'Lire ensuite', onPress: () => playNext(linkToTrack(h)) },
        { label: "Ajouter à la file d'attente", onPress: () => enqueue(linkToTrack(h)) },
        { label: 'Ajouter à une playlist', onPress: () => openAddToPlaylistSheet(h) },
        {
          label: "Supprimer de l'historique",
          destructive: true,
          onPress: () => removeLinkHistoryItem(h.id),
        },
      ],
    });
  };

  const onPlay = async () => {
    const u = url.trim();
    if (!u) return;
    router.push('/(tabs)/player');
    await playFromUrl(u, palette.artHues[0]);
  };

  const replay = async (u: string) => {
    if (!u) return;
    router.push('/(tabs)/player');
    await playFromUrl(u, palette.artHues[0]);
  };

  const clearHistory = () => {
    usePlayerStore.setState({ linkHistory: [] });
    Storage.clearLinkHistory().catch((e) => console.warn('[storage] clear history', e));
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
            <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 2 }}>
              ◉ URL MODE
            </Text>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 56,
                lineHeight: 52,
                letterSpacing: -2,
                textTransform: 'uppercase',
                marginTop: 10,
                color: c.fg,
              }}
            >
              Play from{'\n'}a <Text style={{ color: palette.accent }}>link.</Text>
            </Text>
            <Text
              style={{
                fontFamily: FONTS.sans,
                fontSize: 14,
                color: c.muted,
                marginTop: 14,
                lineHeight: 20,
                maxWidth: 280,
              }}
            >
              Colle une URL ou un lien YouTube/SoundCloud, DMusic extrait l'audio et le stream.
            </Text>
          </View>

          {/* Paste field */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: 18,
                padding: 14,
                borderWidth: 2,
                borderColor: palette.accent,
                borderStyle: 'dashed',
                gap: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="link" size={16} stroke={palette.accent} strokeWidth={1.8} />
                <Text style={{ fontFamily: FONTS.mono, fontSize: 12, color: c.muted }}>https://</Text>
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="example.com/track.mp3"
                  placeholderTextColor={c.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  selectionColor={palette.accent}
                  cursorColor={palette.accent}
                  style={{
                    flex: 1,
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    color: c.fg,
                    padding: 0,
                  }}
                />
              </View>
              <Pressable
                onPress={onPlay}
                style={{
                  backgroundColor: palette.accent,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 13,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: '#fff',
                  }}
                >
                  ▶ Play now
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Compat */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 8,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {COMPAT.map((c2) => (
              <View
                key={c2.l}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  backgroundColor: c2.ok ? c.softFill : 'transparent',
                  borderWidth: c2.ok ? 0 : 1,
                  borderColor: c.muted,
                  borderStyle: 'dashed',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    letterSpacing: 0.5,
                    color: c2.ok ? c.fg : c.muted,
                    textDecorationLine: c2.ok ? 'none' : 'line-through',
                  }}
                >
                  {c2.l}
                </Text>
              </View>
            ))}
          </View>

          {/* History */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 8,
              }}
            >
              <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 1.5 }}>
                RECENT LINKS · {history.length}
              </Text>
              {history.length > 0 && (
                <Pressable onPress={clearHistory}>
                  <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 1.5 }}>
                    CLEAR
                  </Text>
                </Pressable>
              )}
            </View>
            {!history.length ? (
              <View
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 22,
                  padding: 20,
                  borderWidth: dark ? 1 : 0,
                  borderColor: c.hairline,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: c.muted,
                    letterSpacing: 2,
                  }}
                >
                  AUCUN HISTORIQUE
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 13,
                    color: c.muted,
                    marginTop: 10,
                    textAlign: 'center',
                    lineHeight: 20,
                    maxWidth: 260,
                  }}
                >
                  Colle un lien ci-dessus, il apparaîtra ici après lecture.
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
              {history.map((r, i) => (
                <Pressable
                  key={r.id}
                  onPress={() => replay(r.url)}
                  onLongPress={() => onLinkLongPress(r)}
                  delayLongPress={350}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    paddingHorizontal: 14,
                    borderBottomWidth: i < history.length - 1 ? 1 : 0,
                    borderBottomColor: c.hairline,
                    opacity: r.ok ? 1 : 0.55,
                  }}
                >
                  <View style={{ position: 'relative' }}>
                    <Cover size={40} track={{ thumbnail: r.thumbnail, hue: r.hue, variant: (i % 3) as 0 | 1 | 2 }} />
                    {!r.ok && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 6,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="invalid" size={16} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: FONTS.sansSemi,
                        fontSize: 14,
                        color: c.fg,
                        lineHeight: 17,
                        textDecorationLine: r.ok ? 'none' : 'line-through',
                      }}
                    >
                      {r.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 10,
                        color: c.muted,
                        marginTop: 3,
                        letterSpacing: 0.3,
                      }}
                    >
                      {r.host} · {r.time}
                    </Text>
                  </View>
                  {r.ok ? (
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        backgroundColor: palette.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="play" size={12} color="#fff" />
                    </View>
                  ) : (
                    <View
                      style={{
                        paddingVertical: 3,
                        paddingHorizontal: 7,
                        borderRadius: 4,
                        backgroundColor: palette.accent3,
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
                        DRM
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <MiniPlayer />
      <TabBar active="links" />
    </View>
  );
}
