import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';

const STEPS = [
  {
    n: '01',
    t: 'Ta musique,\nton espace.',
    s: "DMusic lit tes fichiers iPhone, ta bibliothèque Apple Music locale, et streame n'importe quel lien audio direct.",
  },
  {
    n: '02',
    t: 'Colle\nun lien.',
    s: "Un .mp3, un .m4a, un podcast, un mix Boiler Room — colle l'URL et ça joue. Fonctionne en arrière-plan, verrouillé.",
  },
  {
    n: '03',
    t: 'Tout reste\nlocal.',
    s: "Pas de compte, pas de cloud obligatoire. SQLite + fichiers iOS. Tes playlists t'appartiennent.",
  },
];

export default function Onboarding() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const cur = STEPS[step - 1];

  const slideAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(dotsAnim, {
      toValue: step,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [step, slideAnim, dotsAnim]);

  const slideOpacity = slideAnim;
  const slideTx = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });
  const numberScale = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  const goNext = () => {
    if (step < 3) setStep(step + 1);
    else router.replace('/(tabs)/library');
  };
  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, overflow: 'hidden' }}>
      {/* Glow 1 */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 400,
          height: 400,
          borderRadius: 200,
          backgroundColor: palette.accent,
          opacity: 0.45,
        }}
      />
      {/* Glow 2 */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 180,
          right: -100,
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: palette.accent2,
          opacity: 0.4,
        }}
      />

      <SafeAreaView style={{ flex: 1, position: 'relative' }}>
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: FONTS.display, fontSize: 20, letterSpacing: -0.5, color: c.fg }}>
            DMUSIC
          </Text>
          <Pressable onPress={() => router.replace('/(tabs)/library')}>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: c.muted,
                letterSpacing: 1,
              }}
            >
              SKIP
            </Text>
          </Pressable>
        </View>

        <Animated.View
          style={{
            paddingHorizontal: 24,
            marginTop: 80,
            opacity: slideOpacity,
            transform: [{ translateX: slideTx }],
          }}
        >
          <Animated.Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 180,
              color: palette.accent,
              lineHeight: 200,
              letterSpacing: -8,
              includeFontPadding: false,
              transform: [{ scale: numberScale }],
              transformOrigin: 'left center' as any,
            }}
          >
            {cur.n}
          </Animated.Text>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 54,
              lineHeight: 58,
              letterSpacing: -2,
              textTransform: 'uppercase',
              marginTop: 16,
              color: c.fg,
            }}
          >
            {cur.t}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.sans,
              fontSize: 15,
              color: c.muted,
              lineHeight: 22,
              marginTop: 20,
              maxWidth: 310,
            }}
          >
            {cur.s}
          </Text>
        </Animated.View>

        {/* Tap zones — left = prev, right = next */}
        <Pressable
          onPress={goPrev}
          style={{ position: 'absolute', top: 60, bottom: 180, left: 0, width: '50%' }}
        />
        <Pressable
          onPress={goNext}
          style={{ position: 'absolute', top: 60, bottom: 180, right: 0, width: '50%' }}
        />

        {/* Progress dots */}
        <View
          style={{
            position: 'absolute',
            bottom: 120,
            left: 24,
            right: 24,
            flexDirection: 'row',
            gap: 6,
          }}
        >
          {[1, 2, 3].map((i) => {
            const flex = dotsAnim.interpolate({
              inputRange: [i - 1, i, i + 1],
              outputRange: [1, 2, 1],
              extrapolate: 'clamp',
            });
            const isActive = i === step;
            return (
              <Animated.View
                key={i}
                style={{
                  flex,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isActive ? palette.accent : c.softFillAlt,
                }}
              />
            );
          })}
        </View>

        <View style={{ position: 'absolute', bottom: 40, left: 24, right: 24 }}>
          <Pressable
            onPress={goNext}
            style={{
              paddingVertical: 16,
              borderRadius: 999,
              backgroundColor: palette.accent,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 14,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: '#fff',
              }}
            >
              {step === 3 ? 'Commencer' : 'Suivant →'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
