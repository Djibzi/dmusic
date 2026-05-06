import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Mode } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { TabBar } from '@/components/TabBar';
import { useSheet } from '@/components/Sheet';
import { PALETTES, Palette } from '@/theme/palettes';
import { usePlayerStore } from '@/store/playerStore';
import * as Storage from '@/services/Storage';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { dark, c } = useTheme();
  return (
    <View style={{ paddingBottom: 10 }}>
      <View style={{ paddingTop: 18, paddingBottom: 10, paddingLeft: 12, paddingRight: 8 }}>
        <Text
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            lineHeight: 22,
            color: c.muted,
            includeFontPadding: false,
          }}
        >
          {title}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: 18,
          overflow: 'hidden',
          borderWidth: dark ? 1 : 0,
          borderColor: c.hairline,
          paddingHorizontal: 14,
          paddingVertical: 6,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  accent,
  onPress,
  destructive,
  last,
}: {
  label: string;
  value?: string;
  accent?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
}) {
  const { palette, c } = useTheme();
  const Wrap: any = onPress ? Pressable : View;
  return (
    <Wrap
      onPress={onPress}
      style={({ pressed }: any) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingLeft: 20,
        paddingRight: 18,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.hairline,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text
        style={{
          flex: 1,
          fontFamily: FONTS.sansSemi,
          fontSize: 14,
          lineHeight: 20,
          color: destructive ? '#e94c4c' : c.fg,
          includeFontPadding: false,
        }}
      >
        {label}
      </Text>
      {value != null && (
        <Text
          style={{
            fontFamily: FONTS.mono,
            fontSize: 12,
            color: accent ? palette.accent : c.muted,
          }}
        >
          {value}
        </Text>
      )}
    </Wrap>
  );
}

function PaletteSwatch({
  paletteKey,
  selected,
  onPress,
}: {
  paletteKey: Palette['key'];
  selected: boolean;
  onPress: () => void;
}) {
  const { dark, c } = useTheme();
  const p = PALETTES[paletteKey];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: 14,
        padding: 14,
        gap: 10,
        borderWidth: 2,
        borderColor: selected ? p.accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View style={{ flex: 1, height: 36, borderRadius: 8, backgroundColor: p.accent }} />
        <View style={{ flex: 1, height: 36, borderRadius: 8, backgroundColor: p.accent2 }} />
        <View style={{ flex: 1, height: 36, borderRadius: 8, backgroundColor: p.accent3 }} />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: FONTS.sansSemi, fontSize: 13, color: c.fg }} numberOfLines={1}>
          {p.name}
        </Text>
        {selected && (
          <Text style={{ fontFamily: FONTS.mono, fontSize: 10, color: p.accent }}>
            ✓ ACTIF
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function ModeSegment({
  current,
  onSelect,
}: {
  current: Mode;
  onSelect: (m: Mode) => void;
}) {
  const { palette, dark, c } = useTheme();
  const opts: { key: Mode; label: string }[] = [
    { key: 'system', label: 'Auto' },
    { key: 'light', label: 'Clair' },
    { key: 'dark', label: 'Sombre' },
  ];
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        padding: 3,
      }}
    >
      {opts.map((o) => {
        const active = o.key === current;
        return (
          <Pressable
            key={o.key}
            onPress={() => onSelect(o.key)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: active ? palette.accent : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.sansSemi,
                fontSize: 13,
                color: active ? '#fff' : c.fg,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Settings() {
  const { palette, paletteKey, setPaletteKey, mode, setMode, c } = useTheme();
  const importedTracks = usePlayerStore((s) => s.importedTracks);
  const linkHistory = usePlayerStore((s) => s.linkHistory);
  const playlists = usePlayerStore((s) => s.playlists);
  const favorites = usePlayerStore((s) => s.favorites);
  const ui = useSheet();

  const clearLinks = () => {
    if (!linkHistory.length) return;
    ui.confirm({
      title: 'Vider l\'historique ?',
      message: `${linkHistory.length} lien${linkHistory.length > 1 ? 's' : ''} récent${linkHistory.length > 1 ? 's' : ''} seront effacés.`,
      destructive: true,
      confirmLabel: 'Vider',
      onConfirm: () => {
        usePlayerStore.setState({ linkHistory: [] });
        Storage.clearLinkHistory().catch((e) => console.warn('[storage] clear history', e));
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 56,
                lineHeight: 64,
                letterSpacing: -2,
                textTransform: 'uppercase',
                includeFontPadding: false,
                color: c.fg,
              }}
            >
              Settings.
            </Text>
            <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, marginTop: 8 }}>
              DMUSIC v1.0.0
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            {/* THÈME */}
            <View style={{ paddingBottom: 10 }}>
              <View style={{ paddingTop: 18, paddingBottom: 10, paddingLeft: 12, paddingRight: 8 }}>
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    lineHeight: 22,
                    color: c.muted,
                    includeFontPadding: false,
                  }}
                >
                  THÈME
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <PaletteSwatch
                  paletteKey="crimsonNight"
                  selected={paletteKey === 'crimsonNight'}
                  onPress={() => setPaletteKey('crimsonNight')}
                />
                <PaletteSwatch
                  paletteKey="violetDusk"
                  selected={paletteKey === 'violetDusk'}
                  onPress={() => setPaletteKey('violetDusk')}
                />
              </View>
            </View>

            {/* MODE */}
            <View style={{ paddingBottom: 10 }}>
              <View style={{ paddingTop: 18, paddingBottom: 10, paddingLeft: 12, paddingRight: 8 }}>
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    lineHeight: 22,
                    color: c.muted,
                    includeFontPadding: false,
                  }}
                >
                  APPARENCE
                </Text>
              </View>
              <ModeSegment current={mode} onSelect={setMode} />
            </View>

            {/* BIBLIOTHÈQUE */}
            <Section title="BIBLIOTHÈQUE">
              <Row label="Tracks importées" value={String(importedTracks.length)} accent />
              <Row label="Liens récents" value={String(linkHistory.length)} accent />
              <Row label="Playlists" value={String(playlists.length)} accent />
              <Row label="Favoris" value={String(favorites.length)} accent last />
            </Section>

            {/* MAINTENANCE */}
            <Section title="MAINTENANCE">
              <Row
                label="Vider l'historique des liens"
                onPress={clearLinks}
                destructive
                value={linkHistory.length ? '→' : undefined}
                last
              />
            </Section>

            {/* À PROPOS */}
            <Section title="À PROPOS">
              <Row label="Version" value="1.0.0" />
              <Row label="Palette active" value={palette.name} accent last />
            </Section>
          </View>
        </ScrollView>
      </SafeAreaView>
      <TabBar active="library" />
    </View>
  );
}
