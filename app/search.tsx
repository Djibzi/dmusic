import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Icon } from '@/components/Icon';
import { Artwork } from '@/components/Artwork';
import { Cover } from '@/components/Cover';
import { usePlayerStore, Track } from '@/store/playerStore';

type FilterKey = 'All' | 'Tracks' | 'Playlists' | 'Links';

type ResultRow =
  | { kind: 'track'; track: Track }
  | { kind: 'playlist'; id: string; name: string; count: number; hue: number }
  | { kind: 'link'; id: string; title: string; host: string; url: string; hue: number; thumbnail?: string };

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function SearchScreen() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<FilterKey>('All');

  const importedTracks = usePlayerStore((s) => s.importedTracks);
  const playlists = usePlayerStore((s) => s.playlists);
  const linkHistory = usePlayerStore((s) => s.linkHistory);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playFromUrl = usePlayerStore((s) => s.playFromUrl);

  const allTracks = importedTracks;

  const results = useMemo<ResultRow[]>(() => {
    const query = norm(q.trim());
    if (!query) return [];

    const out: ResultRow[] = [];

    if (filter === 'All' || filter === 'Tracks') {
      for (const t of allTracks) {
        if (norm(t.title).includes(query) || norm(t.artist).includes(query)) {
          out.push({ kind: 'track', track: t });
        }
      }
    }

    if (filter === 'All' || filter === 'Playlists') {
      for (const p of playlists) {
        if (norm(p.name).includes(query)) {
          out.push({ kind: 'playlist', id: p.id, name: p.name, count: p.tracks.length, hue: p.hue });
        }
      }
    }

    if (filter === 'All' || filter === 'Links') {
      for (const h of linkHistory) {
        if (norm(h.title).includes(query) || norm(h.host).includes(query) || norm(h.url).includes(query)) {
          out.push({ kind: 'link', id: h.id, title: h.title, host: h.host, url: h.url, hue: h.hue, thumbnail: h.thumbnail });
        }
      }
    }

    return out;
  }, [q, filter, allTracks, playlists, linkHistory]);

  const onPressResult = (r: ResultRow) => {
    if (r.kind === 'track') {
      playTrack(r.track);
      router.back();
      router.push('/(tabs)/player');
    } else if (r.kind === 'playlist') {
      router.back();
      router.push({ pathname: '/playlists/[id]', params: { id: r.id } });
    } else {
      router.back();
      router.push('/(tabs)/player');
      playFromUrl(r.url, r.hue);
    }
  };

  const FILTERS: FilterKey[] = ['All', 'Tracks', 'Playlists', 'Links'];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
            <Pressable onPress={() => router.back()}>
              <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 1.5 }}>
                ANNULER
              </Text>
            </Pressable>
            <View
              style={{
                marginTop: 20,
                backgroundColor: c.surface,
                borderRadius: 16,
                padding: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                borderWidth: 2,
                borderColor: palette.accent,
              }}
            >
              <Icon name="search" size={18} color={palette.accent} strokeWidth={2} />
              <TextInput
                value={q}
                onChangeText={setQ}
                style={{ flex: 1, fontFamily: FONTS.sans, fontSize: 15, color: c.fg, padding: 0 }}
                autoFocus
                placeholder="Rechercher tracks, playlists, liens…"
                placeholderTextColor={c.muted}
                autoCorrect={false}
                autoCapitalize="none"
                selectionColor={palette.accent}
                cursorColor={palette.accent}
              />
              {q.length > 0 && (
                <Pressable onPress={() => setQ('')} hitSlop={10}>
                  <Text style={{ fontFamily: FONTS.mono, fontSize: 14, color: c.muted }}>✕</Text>
                </Pressable>
              )}
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, gap: 8 }}
          >
            {FILTERS.map((f) => {
              const on = f === filter;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: on ? palette.ink : 'transparent',
                    borderWidth: on ? 0 : 1,
                    borderColor: c.chipBorder,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontFamily: FONTS.sansSemi, fontSize: 12, color: on ? palette.inkLight : c.fg }}>
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            {!q.trim() ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 2 }}>
                  TAPE POUR CHERCHER
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
                  Tracks, playlists et historique de liens.
                </Text>
              </View>
            ) : !results.length ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 2 }}>
                  AUCUN RÉSULTAT
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    color: c.muted,
                    letterSpacing: 1.5,
                    padding: 8,
                  }}
                >
                  {results.length} RÉSULTAT{results.length > 1 ? 'S' : ''}
                </Text>
                <View
                  style={{
                    backgroundColor: c.surface,
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: dark ? 1 : 0,
                    borderColor: c.hairline,
                  }}
                >
                  {results.map((r, i) => {
                    const type = r.kind === 'track' ? 'TRACK' : r.kind === 'playlist' ? 'PLAYLIST' : 'LINK';
                    const tint = r.kind === 'link' ? palette.accent3 : r.kind === 'playlist' ? palette.accent2 : palette.ink;
                    const hue =
                      r.kind === 'track' ? r.track.hue : r.kind === 'playlist' ? r.hue : r.hue;
                    const title =
                      r.kind === 'track' ? r.track.title : r.kind === 'playlist' ? r.name : r.title;
                    const subtitle =
                      r.kind === 'track'
                        ? r.track.artist
                        : r.kind === 'playlist'
                        ? `${r.count} track${r.count > 1 ? 's' : ''}`
                        : r.host;
                    return (
                      <Pressable
                        key={`${r.kind}-${i}`}
                        onPress={() => onPressResult(r)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          paddingHorizontal: 14,
                          borderBottomWidth: i < results.length - 1 ? 1 : 0,
                          borderBottomColor: c.hairline,
                        }}
                      >
                        <View
                          style={{
                            paddingVertical: 3,
                            paddingHorizontal: 6,
                            borderRadius: 4,
                            backgroundColor: tint,
                            minWidth: 56,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1, color: '#fff' }}>
                            {type}
                          </Text>
                        </View>
                        {r.kind === 'playlist' ? (
                          <Artwork size={40} hue={hue} variant={(i % 3) as 0 | 1 | 2} />
                        ) : (
                          <Cover
                            size={40}
                            track={{
                              hue,
                              variant: (i % 3) as 0 | 1 | 2,
                              thumbnail: r.kind === 'track' ? r.track.thumbnail : r.thumbnail,
                            }}
                          />
                        )}
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            numberOfLines={1}
                            style={{ fontFamily: FONTS.sansSemi, fontSize: 15, color: c.fg }}
                          >
                            {title}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={{ fontFamily: FONTS.sans, fontSize: 12, color: c.muted, marginTop: 2 }}
                          >
                            {subtitle}
                          </Text>
                        </View>
                        <Icon name="chevronRight" size={14} color={c.muted} />
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
