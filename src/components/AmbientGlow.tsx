import React from 'react';
import { View } from 'react-native';

export function AmbientGlow({
  color,
  top = -80,
  left = -80,
  right = -80,
  height = 420,
  opacity = 0.35,
}: {
  color: string;
  top?: number;
  left?: number;
  right?: number;
  height?: number;
  opacity?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left,
        right,
        height,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: color,
          opacity,
          borderRadius: 9999,
        }}
      />
    </View>
  );
}
