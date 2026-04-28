import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/Icon';
import { useSheet } from '@/components/Sheet';
import { usePlayerStore } from '@/store/playerStore';

function PulseBars() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 180);
    return () => clearInterval(id);
  }, []);
  const seeds = [12, 6, 16, 4, 10];
  return (
    <View style={{ flexDirection: 'row', gap: 1.5, alignItems: 'flex-end', height: 20 }}>
      {seeds.map((h, j) => (
        <View
          key={j}
          style={{
            width: 3,
            height: h + ((tick + j) % 4) * 2,
            backgroundColor: '#fff',
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}

function parseDuration(d: string): number {
  if (!d || d === '—') return 0;
  const parts = d.split(':').map((x) => parseInt(x, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function fmtTotal(sec: number): string {
  if (!sec) return '—';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Queue() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const skipToQueueIndex = usePlayerStore((s) => s.skipToQueueIndex);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const ui = useSheet();

  const totalSec = queue.reduce((n, t) => n + parseDuration(t.duration), 0);

  const onRemove = (id: string, title: string) => {
    ui.confirm({
      title: 'Retirer ?',
      message: `"${title}" de la file d'attente`,
      destructive: true,
      confirmLabel: 'Retirer',
      onConfirm: () => removeFromQueue(id),
    });
  };

  const onClearAll = () => {
    if (!queue.length) return;
    ui.confirm({
      title: 'Vider la file ?',
      message: `${queue.length} track${queue.length > 1 ? 's' : ''} seront retirées.`,
      destructive: true,
      confirmLabel: 'Vider',
      onConfirm: () => clearQueue(),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Pressable onPress={() => router.back()}>
              <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 1.5 }}>
                ← PLAYER
              </Text>
            </Pressable>
            <Pressable onPress={onClearAll} disabled={!queue.length}>
              <Text
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  color: queue.length ? c.fg : c.muted,
                  letterSpacing: 1.5,
                  opacity: queue.length ? 1 : 0.5,
                }}
              >
                CLEAR
              </Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 54,
                lineHeight: 50,
                letterSpacing: -2,
                textTransform: 'uppercase',
                color: c.fg,
              }}
            >
              Queue.
            </Text>
            <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, marginTop: 8 }}>
              À SUIVRE · {queue.length} TRACK{queue.length > 1 ? 'S' : ''}
              {totalSec ? ` · ${fmtTotal(totalSec)}` : ''}
            </Text>
          </View>

          {currentTrack && (
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <Text
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 10,
                  color: c.muted,
                  letterSpacing: 2,
                  paddingVertical: 4,
                  paddingBottom: 8,
                }}
              >
                EN LECTURE
              </Text>
              <Pressable
                onPress={() => router.back()}
                style={{
                  backgroundColor: palette.accent,
                  borderRadius: 20,
                  padding: 14,
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <Cover size={56} track={currentTrack} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontFamily: FONTS.sansSemi, fontSize: 15, color: '#fff' }}>
                    {currentTrack.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: FONTS.sans, fontSize: 12, color: '#fff', opacity: 0.9, marginTop: 2 }}
                  >
                    {currentTrack.artist}
                  </Text>
                </View>
                <PulseBars />
              </Pressable>
            </View>
          )}

          <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 10,
                color: c.muted,
                letterSpacing: 2,
                paddingVertical: 4,
                paddingBottom: 8,
              }}
            >
              À SUIVRE
            </Text>
            {!queue.length ? (
              <View
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: dark ? 1 : 0,
                  borderColor: c.hairline,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, letterSpacing: 2 }}>
                  FILE VIDE
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
                  Maintiens une track dans la bibliothèque pour la lire ensuite.
                </Text>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: c.surface,
                  borderRadius: 20,
                  overflow: 'hidden',
                  borderWidth: dark ? 1 : 0,
                  borderColor: c.hairline,
                }}
              >
                {queue.map((tr, i) => (
                  <Pressable
                    key={tr.id + '-' + i}
                    onPress={() => skipToQueueIndex(i)}
                    onLongPress={() => onRemove(tr.id, tr.title)}
                    delayLongPress={350}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth: i < queue.length - 1 ? 1 : 0,
                      borderBottomColor: c.hairline,
                    }}
                  >
                    <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, width: 20 }}>
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                    <Cover size={40} track={tr} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: FONTS.sansSemi, fontSize: 15, color: c.fg }}
                      >
                        {tr.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: FONTS.sans, fontSize: 12, color: c.muted, marginTop: 2 }}
                      >
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
                    <Pressable
                      onPress={() => onRemove(tr.id, tr.title)}
                      hitSlop={10}
                      style={{
                        width: 28,
                        height: 28,
                        marginLeft: 2,
                        borderRadius: 999,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontFamily: FONTS.mono, fontSize: 14, color: c.muted }}>✕</Text>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
