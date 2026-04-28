import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Icon } from '@/components/Icon';
import { Artwork } from '@/components/Artwork';
import { TabBar } from '@/components/TabBar';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useSheet } from '@/components/Sheet';
import { usePlayerStore } from '@/store/playerStore';

export default function Playlists() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const playlists = usePlayerStore((s) => s.playlists);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);

  const totalTracks = playlists.reduce((n, p) => n + p.tracks.length, 0);

  const ui = useSheet();
  const onCreate = () => {
    ui.prompt({
      title: 'Nouvelle playlist',
      placeholder: 'Nom de la playlist',
      submitLabel: 'Créer',
      onSubmit: (name) => {
        const n = name.trim();
        if (!n) return;
        const hue = palette.artHues[playlists.length % palette.artHues.length];
        const p = createPlaylist(n, hue);
        router.push({ pathname: '/playlists/[id]', params: { id: p.id } });
      },
    });
  };

  const hero = playlists[0];
  const rest = playlists.slice(1);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: FONTS.display, fontSize: 22, letterSpacing: -0.5, color: c.fg }}>
                DMUSIC
              </Text>
              <Pressable
                onPress={onCreate}
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
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 56,
                lineHeight: 52,
                letterSpacing: -2,
                textTransform: 'uppercase',
                marginTop: 18,
                color: c.fg,
              }}
            >
              Playlists.
            </Text>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: c.muted,
                marginTop: 8,
                letterSpacing: 0.5,
              }}
            >
              {playlists.length} PLAYLIST{playlists.length > 1 ? 'S' : ''} · {totalTracks} TRACK
              {totalTracks > 1 ? 'S' : ''}
            </Text>
          </View>

          {!playlists.length && (
            <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  color: c.muted,
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              >
                AUCUNE PLAYLIST
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 14,
                  color: c.muted,
                  marginTop: 12,
                  textAlign: 'center',
                  maxWidth: 260,
                  lineHeight: 20,
                }}
              >
                Appuie sur + pour créer ta première playlist.
              </Text>
              <Pressable
                onPress={onCreate}
                style={{
                  marginTop: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 22,
                  borderRadius: 999,
                  backgroundColor: palette.accent,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 13,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: '#fff',
                  }}
                >
                  Créer une playlist
                </Text>
              </Pressable>
            </View>
          )}

          {hero && (
            <View style={{ paddingHorizontal: 20, paddingVertical: 14 }}>
              <Pressable
                onPress={() => router.push({ pathname: '/playlists/[id]', params: { id: hero.id } })}
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 22,
                  padding: 16,
                  flexDirection: 'row',
                  gap: 14,
                  alignItems: 'center',
                  borderWidth: dark ? 1 : 0,
                  borderColor: c.hairline,
                }}
              >
                <Artwork size={90} hue={hero.hue} variant={0} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 2 }}>
                    RÉCENTE
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 26,
                      textTransform: 'uppercase',
                      marginTop: 4,
                      lineHeight: 26,
                      letterSpacing: -1,
                      color: c.fg,
                    }}
                  >
                    {hero.name}
                  </Text>
                  <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: c.muted, marginTop: 6 }}>
                    {hero.tracks.length} track{hero.tracks.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    backgroundColor: palette.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="play" size={14} color="#fff" />
                </View>
              </Pressable>
            </View>
          )}

          {rest.length > 0 && (
            <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
                {rest.map((l, i) => (
                  <Pressable
                    key={l.id}
                    onPress={() => router.push({ pathname: '/playlists/[id]', params: { id: l.id } })}
                    style={{
                      width: '48.5%',
                      backgroundColor: c.surface,
                      borderRadius: 18,
                      padding: 12,
                      borderWidth: dark ? 1 : 0,
                      borderColor: c.hairline,
                      marginBottom: 10,
                    }}
                  >
                    <Artwork size={152} hue={l.hue} variant={(i % 3) as 0 | 1 | 2} />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 15,
                        textTransform: 'uppercase',
                        marginTop: 10,
                        lineHeight: 16,
                        letterSpacing: -0.3,
                        color: c.fg,
                      }}
                    >
                      {l.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 9,
                        color: c.muted,
                        marginTop: 4,
                        letterSpacing: 0.5,
                      }}
                    >
                      {l.tracks.length} TRACK{l.tracks.length > 1 ? 'S' : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <MiniPlayer />
      <TabBar active="library" />
    </View>
  );
}
