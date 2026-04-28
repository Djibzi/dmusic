import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Icon } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { useSheet } from '@/components/Sheet';
import { usePlayerStore, Track } from '@/store/playerStore';

type Src = {
  k: string;
  s: string;
  icon: 'folder' | 'apple' | 'link' | 'airdrop';
  action: 'files' | 'url' | 'soon';
  primary?: boolean;
};

const SOURCES: Src[] = [
  { k: 'Files', s: 'Fichiers iPhone (iCloud, Dropbox, local)', icon: 'folder', action: 'files', primary: true },
  { k: 'URL', s: 'Coller un lien YouTube, SoundCloud, mp3…', icon: 'link', action: 'url' },
  { k: 'Apple Music', s: 'Bientôt — tracks téléchargés hors DRM', icon: 'apple', action: 'soon' },
  { k: 'AirDrop', s: 'Bientôt — reçoit depuis un autre appareil', icon: 'airdrop', action: 'soon' },
];

const AUDIO_EXT = /\.(mp3|m4a|aac|wav|flac|ogg|oga|opus)$/i;

function titleFromFilename(name: string): string {
  return name.replace(AUDIO_EXT, '').replace(/[_-]+/g, ' ').trim() || name;
}

function formatDuration(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function probeDuration(uri: string): Promise<{ durationLabel: string; durationMs?: number }> {
  try {
    const { sound, status } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
    await sound.unloadAsync().catch(() => {});
    if (status.isLoaded && status.durationMillis) {
      const sec = status.durationMillis / 1000;
      return { durationLabel: formatDuration(sec), durationMs: status.durationMillis };
    }
  } catch (e) {
    console.warn('[import] probe duration failed', e);
  }
  return { durationLabel: '—' };
}

export default function ImportScreen() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const importedTracks = usePlayerStore((s) => s.importedTracks);
  const addImportedTracks = usePlayerStore((s) => s.addImportedTracks);
  const [busy, setBusy] = useState(false);
  const [lastAdded, setLastAdded] = useState<number>(0);
  const [lastSkipped, setLastSkipped] = useState<number>(0);
  const ui = useSheet();

  const pickFiles = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) {
        setBusy(false);
        return;
      }

      const destDir = `${FileSystem.documentDirectory}audio/`;
      try {
        await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
      } catch {}

      const hues = palette.artHues;
      const newTracks: Track[] = [];
      const seenTitles = new Set(importedTracks.map((t) => t.title.toLowerCase()));
      let skipped = 0;

      for (let i = 0; i < res.assets.length; i++) {
        const a = res.assets[i];
        const newTitle = titleFromFilename(a.name || 'Unknown');
        const titleKey = newTitle.toLowerCase();
        if (seenTitles.has(titleKey)) {
          skipped++;
          continue;
        }
        seenTitles.add(titleKey);
        const safeName = (a.name || `track-${Date.now()}-${i}`).replace(/[^\w.\- ]+/g, '_');
        const fileName = `${Date.now()}-${i}-${safeName}`;
        const dest = `${destDir}${fileName}`;
        try {
          await FileSystem.copyAsync({ from: a.uri, to: dest });
        } catch (e) {
          console.warn('[import] copy failed', a.name, e);
          continue;
        }
        const { durationLabel, durationMs } = await probeDuration(dest);
        newTracks.push({
          id: `local-${Date.now()}-${i}`,
          title: newTitle,
          artist: 'Fichier local',
          duration: durationLabel,
          expectedDurationMs: durationMs,
          uri: `audio/${fileName}`,
          hue: hues[(importedTracks.length + i) % hues.length],
          variant: ((importedTracks.length + i) % 3) as 0 | 1 | 2,
          tag: 'NEW',
        });
      }

      if (newTracks.length) {
        addImportedTracks(newTracks);
        setLastAdded(newTracks.length);
      }
      setLastSkipped(skipped);
    } catch (e: any) {
      ui.alert('Import échoué', String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const onSource = (src: Src) => {
    if (src.action === 'files') pickFiles();
    else if (src.action === 'url') router.push('/(tabs)/links');
    else ui.alert('Bientôt', 'Cette source sera activée plus tard.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
            <Pressable onPress={() => router.back()}>
              <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.muted, letterSpacing: 2 }}>
                ← BIBLIOTHÈQUE
              </Text>
            </Pressable>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 56,
                lineHeight: 52,
                letterSpacing: -2,
                textTransform: 'uppercase',
                marginTop: 16,
                color: c.fg,
              }}
            >
              Importer.
            </Text>
            <Text
              style={{
                fontFamily: FONTS.sans,
                fontSize: 14,
                color: c.muted,
                marginTop: 10,
                maxWidth: 280,
                lineHeight: 20,
              }}
            >
              Ajoute de la musique depuis plusieurs sources. Tout est stocké localement.
            </Text>
          </View>

          <View style={{ padding: 20 }}>
            {SOURCES.map((src) => {
              const disabled = src.action === 'soon';
              const count = src.action === 'files' ? importedTracks.length : null;
              return (
                <Pressable
                  key={src.k}
                  onPress={() => onSource(src)}
                  disabled={busy && src.action === 'files'}
                  style={({ pressed }) => ({
                    backgroundColor: c.surface,
                    borderRadius: 20,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    marginBottom: 10,
                    borderWidth: dark ? 1 : 0,
                    borderColor: c.hairline,
                    opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: src.primary ? palette.accent : c.softFill,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={src.icon} size={20} color={src.primary ? '#fff' : c.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontFamily: FONTS.sansSemi, fontSize: 15, color: c.fg }}>{src.k}</Text>
                      {count != null && count > 0 && (
                        <View
                          style={{
                            paddingVertical: 2,
                            paddingHorizontal: 7,
                            borderRadius: 4,
                            backgroundColor: palette.accent,
                          }}
                        >
                          <Text style={{ fontFamily: FONTS.mono, fontSize: 9, color: '#fff' }}>
                            {count} TRACK{count > 1 ? 'S' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: c.muted, marginTop: 2 }}>
                      {src.s}
                    </Text>
                  </View>
                  <Icon name="chevronRight" size={16} color={c.muted} />
                </Pressable>
              );
            })}

            {(busy || lastAdded > 0 || lastSkipped > 0) && (
              <View
                style={{
                  marginTop: 20,
                  backgroundColor: palette.accent,
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <Text
                  style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 2, color: '#fff', opacity: 0.9 }}
                >
                  {busy ? '◉ IMPORT EN COURS' : '✓ IMPORT TERMINÉ'}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 22,
                    textTransform: 'uppercase',
                    marginTop: 6,
                    lineHeight: 22,
                    color: '#fff',
                  }}
                >
                  {busy
                    ? 'Copie des fichiers…'
                    : lastAdded > 0
                    ? `${lastAdded} track${lastAdded > 1 ? 's' : ''} ajoutée${lastAdded > 1 ? 's' : ''}`
                    : 'Aucun nouveau track'}
                </Text>
                {!busy && lastSkipped > 0 && (
                  <Text style={{ fontFamily: FONTS.mono, fontSize: 11, marginTop: 8, color: '#fff', opacity: 0.85, letterSpacing: 0.5 }}>
                    {lastSkipped} doublon{lastSkipped > 1 ? 's' : ''} ignoré{lastSkipped > 1 ? 's' : ''} (déjà en bibliothèque)
                  </Text>
                )}
                {!busy && lastAdded > 0 && (
                  <Text style={{ fontFamily: FONTS.sans, fontSize: 12, marginTop: 8, color: '#fff', opacity: 0.9 }}>
                    Retourne dans la bibliothèque pour les écouter.
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <TabBar active="library" />
    </View>
  );
}
