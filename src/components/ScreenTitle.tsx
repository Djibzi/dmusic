import React from 'react';
import { Text, View, TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { FONTS } from '@/theme/fonts';

export function DisplayTitle({
  children,
  size = 56,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  style?: TextStyle;
}) {
  const { c } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: FONTS.display,
          fontSize: size,
          lineHeight: size * 0.92,
          letterSpacing: -2,
          color: c.fg,
          textTransform: 'uppercase',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function MonoMeta({
  children,
  color,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
}) {
  const { c } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: FONTS.mono,
          fontSize: 11,
          color: color ?? c.muted,
          letterSpacing: 1.5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function ScreenWrap({
  children,
  background,
}: {
  children: React.ReactNode;
  background?: string;
}) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: background ?? c.bg }}>
      {children}
    </View>
  );
}
