import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import { Icon } from './Icon';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';

type Tab = { k: 'library' | 'player' | 'links'; label: string; path: string };

const TABS: Tab[] = [
  { k: 'library', label: 'Library', path: '/(tabs)/library' },
  { k: 'player', label: 'Player', path: '/(tabs)/player' },
  { k: 'links', label: 'Links', path: '/(tabs)/links' },
];

export function TabBar({ active }: { active?: Tab['k'] }) {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const current =
    active ??
    (pathname.includes('links') ? 'links' : pathname.includes('player') ? 'player' : 'library');

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 28,
        left: 12,
        right: 12,
        borderRadius: 999,
        overflow: 'hidden',
      }}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={40}
        tint={dark ? 'dark' : 'light'}
        style={{
          flexDirection: 'row',
          padding: 8,
          gap: 4,
          backgroundColor: c.overlay,
          borderWidth: 1,
          borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        }}
      >
        {TABS.map((t) => {
          const on = t.k === current;
          return (
            <Pressable
              key={t.k}
              onPress={() => router.push(t.path as any)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: on ? palette.ink : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon
                name={t.k === 'library' ? 'library' : t.k === 'player' ? 'play' : 'link'}
                size={16}
                color={on ? palette.inkLight : c.fg}
              />
              {on && (
                <Text
                  style={{
                    fontFamily: FONTS.sansSemi,
                    fontSize: 12,
                    color: palette.inkLight,
                  }}
                >
                  {t.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}
