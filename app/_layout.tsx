import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { FONT_MAP } from '@/theme/fonts';
import { configureAudio } from '@/services/AudioService';
import { usePlayerStore } from '@/store/playerStore';
import { SheetProvider } from '@/components/Sheet';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Navigator() {
  const { dark } = useTheme();
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="import" options={{ presentation: 'modal' }} />
        <Stack.Screen name="search" options={{ presentation: 'modal' }} />
        <Stack.Screen name="playlists/index" />
        <Stack.Screen name="playlists/[id]" />
        <Stack.Screen name="queue" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="lock" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts(FONT_MAP);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    configureAudio().finally(() => setAudioReady(true));
    usePlayerStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SheetProvider>
            <Navigator />
          </SheetProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
