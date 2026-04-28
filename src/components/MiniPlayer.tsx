import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, PanResponder, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Cover } from './Cover';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';
import { usePlayerStore } from '@/store/playerStore';

const SCREEN_W = Dimensions.get('window').width;
const DISMISS_THRESHOLD = 90;

export function MiniPlayer() {
  const { palette, dark, c } = useTheme();
  const router = useRouter();
  const { currentTrack, isPlaying, toggle, positionMs, durationMs } = usePlayerStore();
  const stopPlayback = usePlayerStore((s) => s.stopPlayback);
  const seekFraction = usePlayerStore((s) => s.seekFraction);
  const translateX = useRef(new Animated.Value(0)).current;
  const barRef = useRef<View>(null);
  const barLayout = useRef({ x: 0, width: 0 });

  const measureBar = () => {
    barRef.current?.measureInWindow((x, _y, w) => {
      barLayout.current = { x, width: w };
    });
  };

  const seekFromPageX = (pageX: number) => {
    const { x, width } = barLayout.current;
    if (width <= 0) return;
    const f = Math.max(0, Math.min(1, (pageX - x) / width));
    seekFraction(f);
  };

  const seekBarPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (_e, g) => {
        measureBar();
        setTimeout(() => seekFromPageX(g.x0), 0);
      },
      onPanResponderMove: (_e, g) => seekFromPageX(g.moveX),
      onPanResponderRelease: (_e, g) => seekFromPageX(g.moveX || g.x0),
    })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > DISMISS_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: g.dx > 0 ? SCREEN_W : -SCREEN_W,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            stopPlayback();
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  if (!currentTrack) return null;

  const frac = durationMs > 0 ? positionMs / durationMs : 0;
  const fmt = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + String(r).padStart(2, '0');
  };
  const bar = (() => {
    const total = 16;
    const filled = Math.round(frac * total);
    return '━'.repeat(filled) + '●' + '─'.repeat(Math.max(0, total - filled - 1));
  })();

  const opacity = translateX.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: [0, 1, 0],
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 96,
        borderRadius: 20,
        overflow: 'hidden',
        transform: [{ translateX }],
        opacity,
      }}
    >
      <Pressable onPress={() => router.push('/(tabs)/player')}>
        <BlurView
          intensity={40}
          tint={dark ? 'dark' : 'light'}
          style={{
            backgroundColor: c.miniOverlay,
            padding: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderWidth: 1,
            borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          }}
        >
          <Cover size={44} track={currentTrack} variant={0} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: FONTS.sansSemi,
                fontSize: 14,
                color: c.fg,
                lineHeight: 16,
              }}
            >
              {currentTrack.title}
            </Text>
            <View
              ref={barRef}
              onLayout={measureBar}
              {...seekBarPan.panHandlers}
              style={{ marginTop: 3, paddingVertical: 4, alignSelf: 'flex-start' }}
            >
              <Text
                pointerEvents="none"
                numberOfLines={1}
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 10,
                  color: palette.accent,
                  letterSpacing: 1,
                }}
              >
                {fmt(positionMs)} {bar} {durationMs ? fmt(durationMs) : '—:—'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              toggle();
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              backgroundColor: palette.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {isPlaying ? (
                <>
                  <View style={{ width: 4, height: 14, backgroundColor: '#fff' }} />
                  <View style={{ width: 4, height: 14, backgroundColor: '#fff' }} />
                </>
              ) : (
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderTopWidth: 7,
                    borderBottomWidth: 7,
                    borderLeftWidth: 10,
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderLeftColor: '#fff',
                    marginLeft: 2,
                  }}
                />
              )}
            </View>
          </Pressable>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}
