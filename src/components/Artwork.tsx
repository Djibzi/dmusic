import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, ClipPath } from 'react-native-svg';
import { FONTS } from '@/theme/fonts';

type Variant = 0 | 1 | 2;

const VARIANTS: { gradStart: [number, number]; gradEnd: [number, number]; blob: number }[] = [
  { gradStart: [0.78, 0.2], gradEnd: [0.35, 0.22], blob: 0.55 },
  { gradStart: [0.68, 0.22], gradEnd: [0.3, 0.2], blob: 0.6 },
  { gradStart: [0.82, 0.17], gradEnd: [0.4, 0.25], blob: 0.5 },
];

function hsl(h: number, s: number, l: number) {
  return `hsl(${((h % 360) + 360) % 360}, ${s}%, ${l}%)`;
}

export function Artwork({
  size,
  hue,
  variant = 0,
  style,
}: {
  size: number;
  hue: number;
  variant?: Variant;
  style?: any;
}) {
  const radius = Math.max(6, size * 0.06);
  const v = VARIANTS[variant % VARIANTS.length];
  const base1 = hsl(hue, 72, 60);
  const base2 = hsl(hue + 30, 65, 28);
  const blobColor = hsl(hue + 90, 85, 45);
  const haloColor = hsl(hue - 30, 80, 78);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: base2,
        },
        styles.innerShadow,
        style,
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="bg" cx="25%" cy="25%" r="90%">
            <Stop offset="0%" stopColor={base1} stopOpacity={1} />
            <Stop offset="100%" stopColor={base2} stopOpacity={1} />
          </RadialGradient>
          <ClipPath id="clip">
            <Rect x={0} y={0} width={size} height={size} rx={radius} ry={radius} />
          </ClipPath>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill="url(#bg)" rx={radius} ry={radius} />
        <Circle
          cx={size * v.blob + size * 0.45}
          cy={size * v.blob + size * 0.45}
          r={size * 0.45}
          fill={blobColor}
          opacity={0.6}
          clipPath="url(#clip)"
        />
        <Circle
          cx={-size * 0.1}
          cy={-size * 0.1}
          r={size * 0.35}
          fill={haloColor}
          opacity={0.4}
          clipPath="url(#clip)"
        />
      </Svg>
      {size >= 120 && (
        <Text
          style={{
            position: 'absolute',
            left: 10,
            bottom: 8,
            fontFamily: FONTS.mono,
            fontSize: 9,
            color: 'rgba(255,255,255,0.75)',
            letterSpacing: 1.5,
          }}
        >
          CLIP/{String(hue).padStart(3, '0')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  innerShadow: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
});
