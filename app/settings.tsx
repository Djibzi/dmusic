import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { TabBar } from '@/components/TabBar';
import { PALETTES } from '@/theme/palettes';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { dark, c } = useTheme();
  return (
    <View style={{ paddingHorizontal: 4, paddingBottom: 10 }}>
      <Text
        style={{
          fontFamily: FONTS.mono,
          fontSize: 10,
          color: c.muted,
          letterSpacing: 2,
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: 18,
          overflow: 'hidden',
          borderWidth: dark ? 1 : 0,
          borderColor: c.hairline,
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
  toggle,
  accent,
  onToggle,
  last,
}: {
  label: string;
  value?: string;
  toggle?: boolean;
  accent?: boolean;
  onToggle?: () => void;
  last?: boolean;
}) {
  const { palette, dark, c } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.hairline,
      }}
    >
      <Text style={{ flex: 1, fontFamily: FONTS.sansSemi, fontSize: 14, color: c.fg }}>{label}</Text>
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
      {toggle != null && (
        <Pressable
          onPress={onToggle}
          style={{
            width: 40,
            height: 24,
            borderRadius: 12,
            backgroundColor: toggle ? palette.accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'),
            justifyContent: 'center',
            padding: 2,
            alignItems: toggle ? 'flex-end' : 'flex-start',
          }}
        >
          <View style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: '#fff' }} />
        </Pressable>
      )}
    </View>
  );
}

export default function Settings() {
  const { palette, paletteKey, setPaletteKey, dark, c } = useTheme();
  const [crossfade, setCrossfade] = React.useState(true);
  const [gapless, setGapless] = React.useState(true);
  const [normalize, setNormalize] = React.useState(false);
  const [lockArt, setLockArt] = React.useState(true);

  const toggleP = () =>
    setPaletteKey(paletteKey === 'crimsonNight' ? 'violetDusk' : 'crimsonNight');

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 56,
                lineHeight: 52,
                letterSpacing: -2,
                textTransform: 'uppercase',
                color: c.fg,
              }}
            >
              Settings.
            </Text>
            <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: c.muted, marginTop: 8 }}>
              DMUSIC v1.0.0 · BUILD 42
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <Section title="LECTURE">
              <Row label="Crossfade" value="6s" accent />
              <Row label="Gapless playback" toggle={gapless} onToggle={() => setGapless(!gapless)} />
              <Row label="Normaliser le volume" toggle={normalize} onToggle={() => setNormalize(!normalize)} />
              <Row label="Qualité streaming" value="Auto" last />
            </Section>

            <Section title="BIBLIOTHÈQUE">
              <Row label="Stockage utilisé" value="2.4 GB" />
              <Row label="Tracks importées" value="247" accent />
              <Row label="Liens sauvegardés" value="18" accent />
              <Row label="Réindexer" value="→" last />
            </Section>

            <Section title="APPARENCE">
              <Pressable onPress={toggleP}>
                <Row label="Palette" value={palette.name} accent />
              </Pressable>
              <Row label="Mode sombre" value={dark ? 'Actif' : 'Système'} />
              <Row
                label="Lock screen artwork"
                toggle={lockArt}
                onToggle={() => setLockArt(!lockArt)}
                last
              />
            </Section>

            <Section title="COMPTE">
              <Row label="À propos" value="→" last />
            </Section>
          </View>
        </ScrollView>
      </SafeAreaView>
      <TabBar active="library" />
    </View>
  );
}
