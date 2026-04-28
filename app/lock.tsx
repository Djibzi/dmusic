import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { Artwork } from '@/components/Artwork';
import { Icon } from '@/components/Icon';

export default function LockScreen() {
  const { palette } = useTheme();
  const bg = palette.bgDark;
  const fg = palette.inkLight;

  return (
    <View style={{ flex: 1, backgroundColor: bg, overflow: 'hidden' }}>
      {/* Ambient */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: palette.accent,
          opacity: 0.33,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 120,
          right: -80,
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: palette.accent2,
          opacity: 0.4,
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: fg,
              opacity: 0.85,
              letterSpacing: 1,
            }}
          >
            mardi 14 janvier
          </Text>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 92,
              color: fg,
              letterSpacing: -4,
              marginTop: 2,
            }}
          >
            01:24
          </Text>
        </View>

        {/* Now playing widget */}
        <View style={{ position: 'absolute', top: 260, left: 16, right: 16, borderRadius: 20, overflow: 'hidden' }}>
          <BlurView
            intensity={50}
            tint="dark"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: 14,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <Artwork size={56} hue={palette.artHues[0]} variant={0} />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontFamily: FONTS.mono, fontSize: 9, color: fg, opacity: 0.7, letterSpacing: 2 }}
              >
                DMUSIC · NOW PLAYING
              </Text>
              <Text
                style={{ fontFamily: FONTS.sansSemi, fontSize: 15, color: fg, marginTop: 2 }}
              >
                Copper Bones
              </Text>
              <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: fg, opacity: 0.7, marginTop: 1 }}>
                Overmono
              </Text>
              <View
                style={{
                  marginTop: 8,
                  height: 3,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <View style={{ width: '42%', height: '100%', backgroundColor: fg }} />
              </View>
            </View>
          </BlurView>
        </View>

        {/* Transport */}
        <View style={{ position: 'absolute', top: 400, left: 16, right: 16, borderRadius: 20, overflow: 'hidden' }}>
          <BlurView
            intensity={40}
            tint="dark"
            style={{
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Icon name="prev" size={26} color={fg} />
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.95)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <View style={{ width: 5, height: 20, backgroundColor: palette.accent, borderRadius: 1 }} />
                <View style={{ width: 5, height: 20, backgroundColor: palette.accent, borderRadius: 1 }} />
              </View>
            </View>
            <Icon name="next" size={26} color={fg} />
          </BlurView>
        </View>

        {/* Bottom */}
        <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              color: fg,
              opacity: 0.7,
              letterSpacing: 1.5,
            }}
          >
            ↑ SWIPE TO UNLOCK
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
